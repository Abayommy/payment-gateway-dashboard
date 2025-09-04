// src/services/failover/circuitBreakerService.ts
import { CircuitBreaker, CircuitBreakerState } from '@/types/failover';
import { ProviderMetrics, Transaction } from '@/services/simulator/transactionSimulator';

class CircuitBreakerService {
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private listeners: ((breakers: Map<string, CircuitBreaker>) => void)[] = [];

  constructor() {
    this.initializeCircuitBreakers();
  }

  private initializeCircuitBreakers() {
    const providerIds = ['stripe', 'paypal', 'square'];
    
    providerIds.forEach(providerId => {
      const breaker: CircuitBreaker = {
        providerId,
        state: 'CLOSED',
        failureCount: 0,
        successCount: 0,
        failureThreshold: 5,
        recoveryTimeoutMs: 60000, // 1 minute
        halfOpenMaxCalls: 3,
        halfOpenSuccessThreshold: 2,
        windowSizeMs: 300000, // 5 minutes
      };
      
      this.circuitBreakers.set(providerId, breaker);
    });
  }

  // Check if provider can handle request
  canExecute(providerId: string): boolean {
    const breaker = this.circuitBreakers.get(providerId);
    if (!breaker) return true;

    const now = new Date();

    switch (breaker.state) {
      case 'CLOSED':
        return true;

      case 'OPEN':
        if (breaker.nextAttemptTime && now >= breaker.nextAttemptTime) {
          // Transition to HALF_OPEN
          breaker.state = 'HALF_OPEN';
          breaker.successCount = 0;
          breaker.failureCount = 0;
          this.notifyListeners();
          return true;
        }
        return false;

      case 'HALF_OPEN':
        return breaker.successCount + breaker.failureCount < breaker.halfOpenMaxCalls;

      default:
        return false;
    }
  }

  // Record transaction result
  recordResult(providerId: string, transaction: Transaction) {
    const breaker = this.circuitBreakers.get(providerId);
    if (!breaker) return;

    const now = new Date();
    const isSuccess = transaction.status === 'completed';

    // Clean old records outside window
    this.cleanOldRecords(breaker, now);

    if (isSuccess) {
      breaker.successCount++;
      breaker.lastSuccessTime = now;
      
      if (breaker.state === 'HALF_OPEN') {
        if (breaker.successCount >= breaker.halfOpenSuccessThreshold) {
          // Transition to CLOSED
          breaker.state = 'CLOSED';
          breaker.failureCount = 0;
          breaker.successCount = 0;
          delete breaker.nextAttemptTime;
        }
      }
    } else {
      breaker.failureCount++;
      breaker.lastFailureTime = now;

      if (breaker.state === 'CLOSED' && breaker.failureCount >= breaker.failureThreshold) {
        // Transition to OPEN
        breaker.state = 'OPEN';
        breaker.nextAttemptTime = new Date(now.getTime() + breaker.recoveryTimeoutMs);
      } else if (breaker.state === 'HALF_OPEN') {
        // Transition back to OPEN
        breaker.state = 'OPEN';
        breaker.nextAttemptTime = new Date(now.getTime() + breaker.recoveryTimeoutMs);
      }
    }

    this.notifyListeners();
  }

  // Update provider metrics to trigger circuit breaker
  updateFromMetrics(providers: ProviderMetrics[]) {
    providers.forEach(provider => {
      const breaker = this.circuitBreakers.get(provider.id);
      if (!breaker) return;

      // Simulate circuit breaker logic based on provider health
      if (provider.status === 'down') {
        if (breaker.state === 'CLOSED') {
          breaker.state = 'OPEN';
          breaker.nextAttemptTime = new Date(Date.now() + breaker.recoveryTimeoutMs);
          breaker.failureCount = breaker.failureThreshold;
        }
      } else if (provider.status === 'operational' && breaker.state === 'OPEN') {
        // Start recovery process
        if (!breaker.nextAttemptTime || new Date() >= breaker.nextAttemptTime) {
          breaker.state = 'HALF_OPEN';
          breaker.successCount = 0;
          breaker.failureCount = 0;
        }
      }
    });

    this.notifyListeners();
  }

  private cleanOldRecords(breaker: CircuitBreaker, now: Date) {
    // In a real implementation, we'd track individual requests with timestamps
    // For demo purposes, we'll reset counts periodically
    const windowStart = new Date(now.getTime() - breaker.windowSizeMs);
    
    if (breaker.lastFailureTime && breaker.lastFailureTime < windowStart) {
      breaker.failureCount = Math.max(0, breaker.failureCount - 1);
    }
    
    if (breaker.lastSuccessTime && breaker.lastSuccessTime < windowStart) {
      breaker.successCount = Math.max(0, breaker.successCount - 1);
    }
  }

  // Manual control methods
  openCircuit(providerId: string) {
    const breaker = this.circuitBreakers.get(providerId);
    if (breaker) {
      breaker.state = 'OPEN';
      breaker.nextAttemptTime = new Date(Date.now() + breaker.recoveryTimeoutMs);
      this.notifyListeners();
    }
  }

  closeCircuit(providerId: string) {
    const breaker = this.circuitBreakers.get(providerId);
    if (breaker) {
      breaker.state = 'CLOSED';
      breaker.failureCount = 0;
      breaker.successCount = 0;
      delete breaker.nextAttemptTime;
      this.notifyListeners();
    }
  }

  forceHalfOpen(providerId: string) {
    const breaker = this.circuitBreakers.get(providerId);
    if (breaker) {
      breaker.state = 'HALF_OPEN';
      breaker.successCount = 0;
      breaker.failureCount = 0;
      this.notifyListeners();
    }
  }

  // Get current state
  getCircuitBreaker(providerId: string): CircuitBreaker | undefined {
    return this.circuitBreakers.get(providerId);
  }

  getAllCircuitBreakers(): CircuitBreaker[] {
    return Array.from(this.circuitBreakers.values());
  }

  getAvailableProviders(): string[] {
    return Array.from(this.circuitBreakers.entries())
      .filter(([_, breaker]) => this.canExecute(breaker.providerId))
      .map(([providerId, _]) => providerId);
  }

  // Configuration
  updateConfig(providerId: string, config: Partial<CircuitBreaker>) {
    const breaker = this.circuitBreakers.get(providerId);
    if (breaker) {
      Object.assign(breaker, config);
      this.notifyListeners();
    }
  }

  // Listeners
  onChange(callback: (breakers: Map<string, CircuitBreaker>) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(new Map(this.circuitBreakers)));
  }
}

export const circuitBreakerService = new CircuitBreakerService();
