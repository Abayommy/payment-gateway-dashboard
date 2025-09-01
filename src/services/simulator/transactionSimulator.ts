// src/services/simulator/transactionSimulator.ts
export interface Transaction {
  id: string;
  provider: 'stripe' | 'paypal' | 'square';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  timestamp: Date;
  responseTime: number;
  errorCode?: string;
  merchantId: string;
  paymentMethod: 'card' | 'bank' | 'wallet';
}

export interface ProviderMetrics {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: number;
  avgResponseTime: number;
  costPerTransaction: number;
  transactionsToday: number;
  successRate: number;
  recentTransactions: Transaction[];
}

class TransactionSimulator {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private listeners: ((transaction: Transaction) => void)[] = [];
  private metricsListeners: ((metrics: ProviderMetrics[]) => void)[] = [];
  
  private providers: ProviderMetrics[] = [
    {
      id: 'stripe',
      name: 'Stripe',
      status: 'operational',
      uptime: 99.9,
      avgResponseTime: 120,
      costPerTransaction: 0.029,
      transactionsToday: 1247,
      successRate: 99.2,
      recentTransactions: []
    },
    {
      id: 'paypal',
      name: 'PayPal',
      status: 'degraded',
      uptime: 97.5,
      avgResponseTime: 340,
      costPerTransaction: 0.031,
      transactionsToday: 892,
      successRate: 96.8,
      recentTransactions: []
    },
    {
      id: 'square',
      name: 'Square',
      status: 'operational',
      uptime: 99.7,
      avgResponseTime: 180,
      costPerTransaction: 0.026,
      transactionsToday: 634,
      successRate: 98.9,
      recentTransactions: []
    }
  ];

  private generateTransaction(): Transaction {
    const providers = ['stripe', 'paypal', 'square'] as const;
    const paymentMethods = ['card', 'bank', 'wallet'] as const;
    const currencies = ['USD', 'EUR', 'GBP'];
    
    const provider = providers[Math.floor(Math.random() * providers.length)];
    const providerData = this.providers.find(p => p.id === provider)!;
    
    // Simulate different success rates based on provider status
    const baseSuccessRate = providerData.successRate / 100;
    const statusMultiplier = providerData.status === 'operational' ? 1 : 
                           providerData.status === 'degraded' ? 0.9 : 0.7;
    const successRate = baseSuccessRate * statusMultiplier;
    
    const isSuccess = Math.random() < successRate;
    const responseTime = this.generateResponseTime(provider, providerData.status);
    
    return {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      provider,
      amount: Math.round((Math.random() * 500 + 10) * 100) / 100,
      currency: currencies[Math.floor(Math.random() * currencies.length)],
      status: isSuccess ? 'completed' : 'failed',
      timestamp: new Date(),
      responseTime,
      errorCode: !isSuccess ? this.generateErrorCode() : undefined,
      merchantId: `merch_${Math.random().toString(36).substr(2, 8)}`,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
    };
  }

  private generateResponseTime(provider: string, status: string): number {
    const baseTime = provider === 'stripe' ? 120 : provider === 'paypal' ? 340 : 180;
    const statusMultiplier = status === 'operational' ? 1 : 
                           status === 'degraded' ? 1.5 : 2.5;
    
    return Math.round(baseTime * statusMultiplier * (0.8 + Math.random() * 0.4));
  }

  private generateErrorCode(): string {
    const errorCodes = [
      'insufficient_funds',
      'card_declined',
      'network_error',
      'invalid_card',
      'processing_error',
      'timeout'
    ];
    return errorCodes[Math.floor(Math.random() * errorCodes.length)];
  }

  private updateProviderMetrics(transaction: Transaction) {
    const provider = this.providers.find(p => p.id === transaction.provider);
    if (!provider) return;

    // Update recent transactions
    provider.recentTransactions.unshift(transaction);
    if (provider.recentTransactions.length > 50) {
      provider.recentTransactions = provider.recentTransactions.slice(0, 50);
    }

    // Update daily transaction count
    provider.transactionsToday++;

    // Update average response time (rolling average)
    provider.avgResponseTime = Math.round(
      (provider.avgResponseTime * 0.9) + (transaction.responseTime * 0.1)
    );

    // Update success rate (rolling average)
    const recentSuccessRate = 
      provider.recentTransactions.filter(t => t.status === 'completed').length / 
      Math.min(provider.recentTransactions.length, 20) * 100;
    
    provider.successRate = Math.round(recentSuccessRate * 10) / 10;

    // Simulate status changes based on recent performance
    if (recentSuccessRate < 90 && provider.status === 'operational') {
      provider.status = 'degraded';
    } else if (recentSuccessRate > 95 && provider.status === 'degraded') {
      provider.status = 'operational';
    }

    // Notify metrics listeners
    this.metricsListeners.forEach(listener => listener([...this.providers]));
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Generate transactions at random intervals (1-5 seconds)
    const scheduleNext = () => {
      const delay = Math.random() * 4000 + 1000; // 1-5 seconds
      
      this.intervalId = setTimeout(() => {
        if (!this.isRunning) return;
        
        const transaction = this.generateTransaction();
        
        // Notify transaction listeners
        this.listeners.forEach(listener => listener(transaction));
        
        // Update provider metrics
        this.updateProviderMetrics(transaction);
        
        // Schedule next transaction
        scheduleNext();
      }, delay);
    };
    
    scheduleNext();
  }

  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }

  onTransaction(callback: (transaction: Transaction) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  onMetricsUpdate(callback: (metrics: ProviderMetrics[]) => void) {
    this.metricsListeners.push(callback);
    return () => {
      this.metricsListeners = this.metricsListeners.filter(l => l !== callback);
    };
  }

  getProviders(): ProviderMetrics[] {
    return [...this.providers];
  }

  // Simulate provider status changes
  simulateProviderDown(providerId: string) {
    const provider = this.providers.find(p => p.id === providerId);
    if (provider) {
      provider.status = 'down';
      provider.uptime = Math.max(provider.uptime - 2, 85);
      this.metricsListeners.forEach(listener => listener([...this.providers]));
    }
  }

  simulateProviderRecovery(providerId: string) {
    const provider = this.providers.find(p => p.id === providerId);
    if (provider) {
      provider.status = 'operational';
      provider.uptime = Math.min(provider.uptime + 1, 99.9);
      this.metricsListeners.forEach(listener => listener([...this.providers]));
    }
  }
}

// Export singleton instance
export const transactionSimulator = new TransactionSimulator();
