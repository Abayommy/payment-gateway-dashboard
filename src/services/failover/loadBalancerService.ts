// src/services/failover/loadBalancerService.ts
import { LoadBalancerConfig, LoadBalancingStrategy, ProviderRoute, FailoverEvent } from '@/types/failover';
import { ProviderMetrics } from '@/services/simulator/transactionSimulator';

class LoadBalancerService {
  private config: LoadBalancerConfig = {
    strategy: 'HEALTH_BASED',
    weights: { stripe: 40, paypal: 35, square: 25 },
    healthCheckEnabled: true,
    stickySessions: false
  };

  private routes: Map<string, ProviderRoute> = new Map();
  private roundRobinIndex = 0;
  private failoverEvents: FailoverEvent[] = [];
  private listeners: ((routes: ProviderRoute[], events: FailoverEvent[]) => void)[] = [];

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const providers = ['stripe', 'paypal', 'square'];
    providers.forEach(providerId => {
      const route: ProviderRoute = {
        providerId,
        weight: this.config.weights[providerId] || 33,
        healthScore: 100,
        activeConnections: 0,
        isAvailable: true,
        avgResponseTime: 150,
        successRate: 99,
      };
      this.routes.set(providerId, route);
    });
  }

  // Select provider based on current strategy
  selectProvider(availableProviderIds: string[]): string | null {
    const availableRoutes = Array.from(this.routes.values())
      .filter(route => availableProviderIds.includes(route.providerId));

    if (availableRoutes.length === 0) return null;

    let selectedRoute: ProviderRoute;

    switch (this.config.strategy) {
      case 'ROUND_ROBIN':
        selectedRoute = this.selectRoundRobin(availableRoutes);
        break;
      case 'WEIGHTED':
        selectedRoute = this.selectWeighted(availableRoutes);
        break;
      case 'LEAST_CONNECTIONS':
        selectedRoute = this.selectLeastConnections(availableRoutes);
        break;
      case 'HEALTH_BASED':
        selectedRoute = this.selectHealthBased(availableRoutes);
        break;
      default:
        selectedRoute = availableRoutes[0];
    }

    // Update selection timestamp
    selectedRoute.lastSelectedTime = new Date();
    selectedRoute.activeConnections++;

    this.notifyListeners();
    return selectedRoute.providerId;
  }

  private selectRoundRobin(routes: ProviderRoute[]): ProviderRoute {
    const route = routes[this.roundRobinIndex % routes.length];
    this.roundRobinIndex++;
    return route;
  }

  private selectWeighted(routes: ProviderRoute[]): ProviderRoute {
    const totalWeight = routes.reduce((sum, route) => sum + route.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const route of routes) {
      random -= route.weight;
      if (random <= 0) return route;
    }
    
    return routes[0];
  }

  private selectLeastConnections(routes: ProviderRoute[]): ProviderRoute {
    return routes.reduce((min, route) => 
      route.activeConnections < min.activeConnections ? route : min
    );
  }

  private selectHealthBased(routes: ProviderRoute[]): ProviderRoute {
    // Calculate composite health score
    const routesWithScores = routes.map(route => ({
      ...route,
      compositeScore: this.calculateCompositeScore(route)
    }));

    return routesWithScores.reduce((best, route) => 
      route.compositeScore > best.compositeScore ? route : best
    );
  }

  private calculateCompositeScore(route: ProviderRoute): number {
    const healthWeight = 0.4;
    const responseTimeWeight = 0.3;
    const successRateWeight = 0.3;

    const normalizedResponseTime = Math.max(0, 100 - (route.avgResponseTime / 10));
    const normalizedHealthScore = route.healthScore;
    const normalizedSuccessRate = route.successRate;

    return (
      normalizedHealthScore * healthWeight +
      normalizedResponseTime * responseTimeWeight +
      normalizedSuccessRate * successRateWeight
    );
  }

  // Update routes from provider metrics
  updateFromMetrics(providers: ProviderMetrics[]) {
    providers.forEach(provider => {
      const route = this.routes.get(provider.id);
      if (route) {
        route.avgResponseTime = provider.avgResponseTime;
        route.successRate = provider.successRate;
        route.isAvailable = provider.status === 'operational';
        
        // Calculate health score based on multiple factors
        route.healthScore = this.calculateHealthScore(provider);
      }
    });

    this.notifyListeners();
  }

  private calculateHealthScore(provider: ProviderMetrics): number {
    let score = 100;

    // Uptime impact
    if (provider.uptime < 99) score -= (99 - provider.uptime) * 2;
    
    // Response time impact  
    if (provider.avgResponseTime > 200) {
      score -= Math.min(30, (provider.avgResponseTime - 200) / 10);
    }

    // Success rate impact
    if (provider.successRate < 99) {
      score -= (99 - provider.successRate) * 3;
    }

    // Status impact
    switch (provider.status) {
      case 'down': score = 0; break;
      case 'degraded': score *= 0.7; break;
      case 'operational': break;
    }

    return Math.max(0, Math.min(100, score));
  }

  // Handle failover
  triggerFailover(fromProviderId: string, reason: string): string | null {
    const availableRoutes = Array.from(this.routes.values())
      .filter(route => route.providerId !== fromProviderId && route.isAvailable);

    if (availableRoutes.length === 0) return null;

    const targetProvider = this.selectProvider(availableRoutes.map(r => r.providerId));
    
    if (targetProvider) {
      const failoverEvent: FailoverEvent = {
        id: `failover_${Date.now()}`,
        timestamp: new Date(),
        trigger: 'THRESHOLD_BREACH',
        fromProviderId,
        toProviderId: targetProvider,
        reason,
        successful: true,
        recoveryTimeEstimateMs: this.estimateRecoveryTime(fromProviderId)
      };

      this.failoverEvents.unshift(failoverEvent);
      if (this.failoverEvents.length > 100) {
        this.failoverEvents = this.failoverEvents.slice(0, 100);
      }

      this.notifyListeners();
    }

    return targetProvider;
  }

  private estimateRecoveryTime(providerId: string): number {
    // Simple recovery estimation based on historical data
    const recentFailovers = this.failoverEvents
      .filter(event => event.fromProviderId === providerId)
      .slice(0, 10);

    if (recentFailovers.length === 0) return 300000; // 5 minutes default

    const avgRecoveryTime = recentFailovers.reduce((sum, event) => 
      sum + (event.recoveryTimeEstimateMs || 300000), 0
    ) / recentFailovers.length;

    return avgRecoveryTime;
  }

  // Connection management
  releaseConnection(providerId: string) {
    const route = this.routes.get(providerId);
    if (route) {
      route.activeConnections = Math.max(0, route.activeConnections - 1);
      this.notifyListeners();
    }
  }

  // Configuration
  updateConfig(newConfig: Partial<LoadBalancerConfig>) {
    this.config = { ...this.config, ...newConfig };
    
    // Update route weights if provided
    if (newConfig.weights) {
      Object.entries(newConfig.weights).forEach(([providerId, weight]) => {
        const route = this.routes.get(providerId);
        if (route) route.weight = weight;
      });
    }

    this.notifyListeners();
  }

  getConfig(): LoadBalancerConfig {
    return { ...this.config };
  }

  getRoutes(): ProviderRoute[] {
    return Array.from(this.routes.values());
  }

  getFailoverEvents(): FailoverEvent[] {
    return [...this.failoverEvents];
  }

  // Listeners
  onChange(callback: (routes: ProviderRoute[], events: FailoverEvent[]) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => 
      listener(Array.from(this.routes.values()), [...this.failoverEvents])
    );
  }
}

export const loadBalancerService = new LoadBalancerService();
