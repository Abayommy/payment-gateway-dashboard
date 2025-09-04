// src/types/failover.ts
export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';
export type LoadBalancingStrategy = 'ROUND_ROBIN' | 'WEIGHTED' | 'LEAST_CONNECTIONS' | 'HEALTH_BASED';
export type FailoverTrigger = 'MANUAL' | 'CIRCUIT_BREAKER' | 'HEALTH_CHECK' | 'THRESHOLD_BREACH';

export interface CircuitBreaker {
  providerId: string;
  state: CircuitBreakerState;
  failureCount: number;
  successCount: number;
  lastFailureTime?: Date;
  lastSuccessTime?: Date;
  nextAttemptTime?: Date;
  failureThreshold: number;
  recoveryTimeoutMs: number;
  halfOpenMaxCalls: number;
  halfOpenSuccessThreshold: number;
  windowSizeMs: number;
}

export interface LoadBalancerConfig {
  strategy: LoadBalancingStrategy;
  weights: Record<string, number>; // providerId -> weight
  healthCheckEnabled: boolean;
  stickySessions: boolean;
}

export interface ProviderRoute {
  providerId: string;
  weight: number;
  healthScore: number;
  activeConnections: number;
  isAvailable: boolean;
  avgResponseTime: number;
  successRate: number;
  lastSelectedTime?: Date;
}

export interface FailoverEvent {
  id: string;
  timestamp: Date;
  trigger: FailoverTrigger;
  fromProviderId?: string;
  toProviderId: string;
  reason: string;
  recoveryTimeEstimateMs?: number;
  successful: boolean;
  transactionId?: string;
}

export interface RecoveryEstimate {
  providerId: string;
  estimatedRecoveryTime: Date;
  confidence: number; // 0-100%
  basedOnHistoricalData: boolean;
  factors: {
    historicalRecoveryTime: number;
    currentDowntimeDuration: number;
    failureType: string;
    timeOfDay: string;
    dayOfWeek: string;
  };
}

export interface FailoverMetrics {
  totalFailovers: number;
  successfulFailovers: number;
  averageFailoverTimeMs: number;
  currentActiveRoutes: ProviderRoute[];
  circuitBreakerStates: Record<string, CircuitBreakerState>;
  recoveryEstimates: RecoveryEstimate[];
  recentEvents: FailoverEvent[];
}
