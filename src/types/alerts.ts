// src/types/alerts.ts
export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';
export type AlertType = 'uptime' | 'response_time' | 'success_rate' | 'provider_down' | 'transaction_volume';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  providerId?: string;
  providerName?: string;
  value: number;
  threshold: number;
  timestamp: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
}

export interface AlertRule {
  id: string;
  type: AlertType;
  providerId?: string; // undefined means applies to all providers
  severity: AlertSeverity;
  threshold: number;
  operator: 'greater_than' | 'less_than' | 'equals';
  enabled: boolean;
  title: string;
  messageTemplate: string;
}

export interface AlertThresholds {
  uptime: {
    warning: number; // < 98%
    critical: number; // < 95%
  };
  responseTime: {
    warning: number; // > 300ms
    critical: number; // > 500ms
  };
  successRate: {
    warning: number; // < 98%
    critical: number; // < 95%
  };
  transactionVolume: {
    warning: number; // sudden drop > 50%
  };
}
