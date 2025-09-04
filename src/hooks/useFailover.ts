// src/hooks/useFailover.ts
import { useState, useCallback } from 'react';

export interface CircuitBreaker {
  provider: string;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  successCount: number;
  failureCount: number;
  lastFailureTime?: Date;
  tripCount: number;
}

export interface LoadBalancerConfig {
  strategy: 'ROUND_ROBIN' | 'WEIGHTED' | 'HEALTH_BASED';
  providers: {
    name: string;
    weight: number;
    healthy: boolean;
    connections: number;
    avgResponseTime: number;
  }[];
}

export interface UseFailoverReturn {
  circuitBreakers: CircuitBreaker[];
  loadBalancer: LoadBalancerConfig;
  toggleCircuitBreaker: (provider: string) => void;
  updateLoadBalancer: (strategy: LoadBalancerConfig['strategy']) => void;
  resetCircuitBreaker: (provider: string) => void;
}

export const useFailover = (): UseFailoverReturn => {
  const [circuitBreakers, setCircuitBreakers] = useState<CircuitBreaker[]>([
    {
      provider: 'Stripe',
      state: 'CLOSED',
      successCount: 5,
      failureCount: 1,
      tripCount: 0
    },
    {
      provider: 'PayPal', 
      state: 'CLOSED',
      successCount: 9,
      failureCount: 0,
      tripCount: 0
    },
    {
      provider: 'Square',
      state: 'HALF_OPEN',
      successCount: 2,
      failureCount: 3,
      lastFailureTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      tripCount: 1
    }
  ]);

  const [loadBalancer, setLoadBalancer] = useState<LoadBalancerConfig>({
    strategy: 'HEALTH_BASED',
    providers: [
      {
        name: 'Stripe',
        weight: 45,
        healthy: true,
        connections: 118,
        avgResponseTime: 245
      },
      {
        name: 'PayPal',
        weight: 35,
        healthy: true, 
        connections: 85,
        avgResponseTime: 420
      },
      {
        name: 'Square',
        weight: 20,
        healthy: false,
        connections: 42,
        avgResponseTime: 680
      }
    ]
  });

  const toggleCircuitBreaker = useCallback((provider: string) => {
    setCircuitBreakers(prev => prev.map(cb => {
      if (cb.provider === provider) {
        const newState = cb.state === 'CLOSED' ? 'OPEN' : 'CLOSED';
        return {
          ...cb,
          state: newState,
          lastFailureTime: newState === 'OPEN' ? new Date() : cb.lastFailureTime
        };
      }
      return cb;
    }));
    console.log(`Circuit breaker for ${provider} toggled`);
  }, []);

  const updateLoadBalancer = useCallback((strategy: LoadBalancerConfig['strategy']) => {
    setLoadBalancer(prev => ({
      ...prev,
      strategy
    }));
    console.log(`Load balancer strategy updated to ${strategy}`);
  }, []);

  const resetCircuitBreaker = useCallback((provider: string) => {
    setCircuitBreakers(prev => prev.map(cb => {
      if (cb.provider === provider) {
        return {
          ...cb,
          state: 'CLOSED',
          successCount: 0,
          failureCount: 0,
          tripCount: 0,
          lastFailureTime: undefined
        };
      }
      return cb;
    }));
    console.log(`Circuit breaker for ${provider} reset`);
  }, []);

  return {
    circuitBreakers,
    loadBalancer,
    toggleCircuitBreaker,
    updateLoadBalancer,
    resetCircuitBreaker
  };
};
