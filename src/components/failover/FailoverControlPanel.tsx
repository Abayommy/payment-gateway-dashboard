// src/components/failover/FailoverControlPanel.tsx
import React, { useState, useEffect } from 'react';
import { CircuitBreaker, LoadBalancingStrategy, ProviderRoute, FailoverEvent } from '@/types/failover';
import { circuitBreakerService } from '@/services/failover/circuitBreakerService';
import { loadBalancerService } from '@/services/failover/loadBalancerService';
import { Shield, Zap, RotateCw, Settings, Activity, Clock, CheckCircle, XCircle } from 'lucide-react';

interface FailoverControlPanelProps {
  className?: string;
}

export const FailoverControlPanel: React.FC<FailoverControlPanelProps> = ({ className = '' }) => {
  const [circuitBreakers, setCircuitBreakers] = useState<CircuitBreaker[]>([]);
  const [routes, setRoutes] = useState<ProviderRoute[]>([]);
  const [failoverEvents, setFailoverEvents] = useState<FailoverEvent[]>([]);
  const [strategy, setStrategy] = useState<LoadBalancingStrategy>('HEALTH_BASED');

  useEffect(() => {
    const unsubscribeCircuit = circuitBreakerService.onChange((breakerMap) => {
      setCircuitBreakers(Array.from(breakerMap.values()));
    });

    const unsubscribeLoadBalancer = loadBalancerService.onChange((newRoutes, newEvents) => {
      setRoutes(newRoutes);
      setFailoverEvents(newEvents);
    });

    // Initialize data
    setCircuitBreakers(circuitBreakerService.getAllCircuitBreakers());
    setRoutes(loadBalancerService.getRoutes());
    setFailoverEvents(loadBalancerService.getFailoverEvents());
    setStrategy(loadBalancerService.getConfig().strategy);

    return () => {
      unsubscribeCircuit();
      unsubscribeLoadBalancer();
    };
  }, []);

  const getCircuitBreakerColor = (state: string) => {
    switch (state) {
      case 'CLOSED': return 'text-green-600 bg-green-100';
      case 'OPEN': return 'text-red-600 bg-red-100';
      case 'HALF_OPEN': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCircuitBreakerIcon = (state: string) => {
    switch (state) {
      case 'CLOSED': return <CheckCircle className="w-4 h-4" />;
      case 'OPEN': return <XCircle className="w-4 h-4" />;
      case 'HALF_OPEN': return <Clock className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const handleStrategyChange = (newStrategy: LoadBalancingStrategy) => {
    loadBalancerService.updateConfig({ strategy: newStrategy });
    setStrategy(newStrategy);
  };

  const handleCircuitBreakerAction = (providerId: string, action: 'open' | 'close' | 'half-open') => {
    switch (action) {
      case 'open':
        circuitBreakerService.openCircuit(providerId);
        break;
      case 'close':
        circuitBreakerService.closeCircuit(providerId);
        break;
      case 'half-open':
        circuitBreakerService.forceHalfOpen(providerId);
        break;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Circuit Breaker Status */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Circuit Breaker Status</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {circuitBreakers.map((breaker) => (
            <div key={breaker.providerId} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900 capitalize">
                  {breaker.providerId}
                </span>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCircuitBreakerColor(breaker.state)}`}>
                  {getCircuitBreakerIcon(breaker.state)}
                  {breaker.state}
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div>Failures: {breaker.failureCount}/{breaker.failureThreshold}</div>
                <div>Success: {breaker.successCount}</div>
                {breaker.nextAttemptTime && (
                  <div>Next Attempt: {breaker.nextAttemptTime.toLocaleTimeString()}</div>
                )}
              </div>

              <div className="flex gap-1 mt-3">
                <button
                  onClick={() => handleCircuitBreakerAction(breaker.providerId, 'close')}
                  className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200"
                  disabled={breaker.state === 'CLOSED'}
                >
                  Close
                </button>
                <button
                  onClick={() => handleCircuitBreakerAction(breaker.providerId, 'open')}
                  className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
                  disabled={breaker.state === 'OPEN'}
                >
                  Open
                </button>
                <button
                  onClick={() => handleCircuitBreakerAction(breaker.providerId, 'half-open')}
                  className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded hover:bg-yellow-200"
                  disabled={breaker.state === 'HALF_OPEN'}
                >
                  Test
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Load Balancing Strategy */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <RotateCw className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Load Balancing</h3>
          </div>
          <select
            value={strategy}
            onChange={(e) => handleStrategyChange(e.target.value as LoadBalancingStrategy)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="ROUND_ROBIN">Round Robin</option>
            <option value="WEIGHTED">Weighted</option>
            <option value="LEAST_CONNECTIONS">Least Connections</option>
            <option value="HEALTH_BASED">Health Based</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {routes.map((route) => (
            <div key={route.providerId} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900 capitalize">
                  {route.providerId}
                </span>
                <div className={`w-2 h-2 rounded-full ${route.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Weight:</span>
                  <span className="font-medium">{route.weight}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Health:</span>
                  <span className="font-medium">{Math.round(route.healthScore)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Connections:</span>
                  <span className="font-medium">{route.activeConnections}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Response:</span>
                  <span className="font-medium">{route.avgResponseTime}ms</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Failover Events */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Failover Events</h3>
        </div>

        {failoverEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Zap className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No failover events yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {failoverEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {event.fromProviderId ? `${event.fromProviderId} → ` : ''}{event.toProviderId}
                  </div>
                  <div className="text-xs text-gray-500">
                    {event.reason} • {event.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    event.successful ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {event.successful ? 'Success' : 'Failed'}
                  </span>
                  {event.recoveryTimeEstimateMs && (
                    <span className="text-xs text-gray-500">
                      {Math.round(event.recoveryTimeEstimateMs / 1000)}s est.
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
