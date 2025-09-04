// src/services/alerts/alertService.ts
import { Alert, AlertRule, AlertSeverity, AlertThresholds, AlertType } from '@/types/alerts';
import { ProviderMetrics } from '@/services/simulator/transactionSimulator';

class AlertService {
  private alerts: Alert[] = [];
  private alertRules: AlertRule[] = [];
  private alertListeners: ((alerts: Alert[]) => void)[] = [];
  
  // Default alert thresholds
  private thresholds: AlertThresholds = {
    uptime: {
      warning: 98,
      critical: 95
    },
    responseTime: {
      warning: 300,
      critical: 500
    },
    successRate: {
      warning: 98,
      critical: 95
    },
    transactionVolume: {
      warning: 50 // percentage drop
    }
  };

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules() {
    this.alertRules = [
      // Uptime alerts
      {
        id: 'uptime_critical',
        type: 'uptime',
        severity: 'critical',
        threshold: this.thresholds.uptime.critical,
        operator: 'less_than',
        enabled: true,
        title: 'Critical Uptime Alert',
        messageTemplate: 'Provider {providerName} uptime has dropped to {value}% (below {threshold}%)'
      },
      {
        id: 'uptime_warning',
        type: 'uptime',
        severity: 'warning',
        threshold: this.thresholds.uptime.warning,
        operator: 'less_than',
        enabled: true,
        title: 'Uptime Warning',
        messageTemplate: 'Provider {providerName} uptime is {value}% (below {threshold}%)'
      },
      // Response time alerts
      {
        id: 'response_time_critical',
        type: 'response_time',
        severity: 'critical',
        threshold: this.thresholds.responseTime.critical,
        operator: 'greater_than',
        enabled: true,
        title: 'Critical Response Time',
        messageTemplate: 'Provider {providerName} response time is {value}ms (above {threshold}ms)'
      },
      {
        id: 'response_time_warning',
        type: 'response_time',
        severity: 'warning',
        threshold: this.thresholds.responseTime.warning,
        operator: 'greater_than',
        enabled: true,
        title: 'High Response Time',
        messageTemplate: 'Provider {providerName} response time is {value}ms (above {threshold}ms)'
      },
      // Success rate alerts
      {
        id: 'success_rate_critical',
        type: 'success_rate',
        severity: 'critical',
        threshold: this.thresholds.successRate.critical,
        operator: 'less_than',
        enabled: true,
        title: 'Critical Success Rate',
        messageTemplate: 'Provider {providerName} success rate has dropped to {value}% (below {threshold}%)'
      },
      // Provider down alert
      {
        id: 'provider_down',
        type: 'provider_down',
        severity: 'emergency',
        threshold: 0,
        operator: 'equals',
        enabled: true,
        title: 'Provider Down',
        messageTemplate: 'Provider {providerName} is currently down'
      }
    ];
  }

  checkMetrics(providers: ProviderMetrics[]) {
    const newAlerts: Alert[] = [];
    const now = new Date();

    providers.forEach(provider => {
      this.alertRules.forEach(rule => {
        if (!rule.enabled) return;
        if (rule.providerId && rule.providerId !== provider.id) return;

        let value: number;
        let shouldAlert = false;

        switch (rule.type) {
          case 'uptime':
            value = provider.uptime;
            shouldAlert = rule.operator === 'less_than' ? value < rule.threshold : value > rule.threshold;
            break;
          case 'response_time':
            value = provider.avgResponseTime;
            shouldAlert = rule.operator === 'greater_than' ? value > rule.threshold : value < rule.threshold;
            break;
          case 'success_rate':
            value = provider.successRate;
            shouldAlert = rule.operator === 'less_than' ? value < rule.threshold : value > rule.threshold;
            break;
          case 'provider_down':
            shouldAlert = provider.status === 'down';
            value = provider.status === 'down' ? 1 : 0;
            break;
          default:
            return;
        }

        if (shouldAlert) {
          // Check if similar alert already exists and is active
          const existingAlert = this.alerts.find(alert => 
            alert.type === rule.type &&
            alert.providerId === provider.id &&
            alert.status === 'active' &&
            alert.severity === rule.severity
          );

          if (!existingAlert) {
            const alert: Alert = {
              id: `${rule.type}_${provider.id}_${now.getTime()}`,
              type: rule.type,
              severity: rule.severity,
              status: 'active',
              title: rule.title,
              message: rule.messageTemplate
                .replace('{providerName}', provider.name)
                .replace('{value}', value.toString())
                .replace('{threshold}', rule.threshold.toString()),
              providerId: provider.id,
              providerName: provider.name,
              value,
              threshold: rule.threshold,
              timestamp: now
            };

            newAlerts.push(alert);
            this.alerts.unshift(alert); // Add to beginning of array
          }
        } else {
          // Auto-resolve alerts that are no longer triggering
          const activeAlerts = this.alerts.filter(alert => 
            alert.type === rule.type &&
            alert.providerId === provider.id &&
            alert.status === 'active'
          );

          activeAlerts.forEach(alert => {
            alert.status = 'resolved';
            alert.resolvedAt = now;
          });
        }
      });
    });

    // Notify listeners if there are new alerts
    if (newAlerts.length > 0) {
      this.notifyListeners();
    }

    return newAlerts;
  }

  acknowledgeAlert(alertId: string, acknowledgedBy: string = 'System Admin') {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && alert.status === 'active') {
      alert.status = 'acknowledged';
      alert.acknowledgedAt = new Date();
      alert.acknowledgedBy = acknowledgedBy;
      this.notifyListeners();
    }
  }

  resolveAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'resolved';
      alert.resolvedAt = new Date();
      this.notifyListeners();
    }
  }

  getAlerts(limit?: number) {
    return limit ? this.alerts.slice(0, limit) : this.alerts;
  }

  getActiveAlerts() {
    return this.alerts.filter(alert => alert.status === 'active');
  }

  getAlertsByProvider(providerId: string) {
    return this.alerts.filter(alert => alert.providerId === providerId);
  }

  getAlertsBySeverity(severity: AlertSeverity) {
    return this.alerts.filter(alert => alert.severity === severity);
  }

  onAlertsChange(callback: (alerts: Alert[]) => void) {
    this.alertListeners.push(callback);
    return () => {
      this.alertListeners = this.alertListeners.filter(l => l !== callback);
    };
  }

  private notifyListeners() {
    this.alertListeners.forEach(listener => listener([...this.alerts]));
  }

  // Configuration methods
  updateThresholds(newThresholds: Partial<AlertThresholds>) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    this.initializeDefaultRules(); // Reinitialize rules with new thresholds
  }

  getThresholds(): AlertThresholds {
    return { ...this.thresholds };
  }

  enableRule(ruleId: string) {
    const rule = this.alertRules.find(r => r.id === ruleId);
    if (rule) rule.enabled = true;
  }

  disableRule(ruleId: string) {
    const rule = this.alertRules.find(r => r.id === ruleId);
    if (rule) rule.enabled = false;
  }

  getRules(): AlertRule[] {
    return [...this.alertRules];
  }

  clearOldAlerts(hoursOld: number = 24) {
    const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
    const initialLength = this.alerts.length;
    
    this.alerts = this.alerts.filter(alert => 
      alert.timestamp > cutoffTime || alert.status === 'active'
    );
    
    if (this.alerts.length !== initialLength) {
      this.notifyListeners();
    }
  }
}

// Export singleton instance
export const alertService = new AlertService();
