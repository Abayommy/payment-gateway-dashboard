// src/hooks/useAlerts.ts
import { useState, useEffect, useCallback } from 'react';

export interface Alert {
  id: string;
  timestamp: Date;
  severity: 'critical' | 'warning' | 'info' | 'emergency';
  provider: string;
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

export interface UseAlertsReturn {
  alerts: Alert[];
  activeAlerts: Alert[];
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'status'>) => void;
  clearAllAlerts: () => void;
}

export const useAlerts = (): UseAlertsReturn => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Initialize with some sample alerts
  useEffect(() => {
    const initialAlerts: Alert[] = [
      {
        id: 'alert_001',
        timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        severity: 'critical',
        provider: 'Stripe',
        message: 'High failure rate detected - exceeding 5% threshold',
        status: 'active'
      },
      {
        id: 'alert_002', 
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        severity: 'warning',
        provider: 'PayPal',
        message: 'Response time elevated - averaging 650ms',
        status: 'active'
      },
      {
        id: 'alert_003',
        timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        severity: 'info',
        provider: 'Square',
        message: 'Maintenance window completed successfully',
        status: 'resolved',
        resolvedAt: new Date(Date.now() - 30 * 60 * 1000)
      }
    ];

    setAlerts(initialAlerts);
  }, []);

  // Get only active alerts
  const activeAlerts = alerts.filter(alert => alert.status === 'active');

  // Acknowledge an alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'acknowledged' as const, acknowledgedAt: new Date() }
        : alert
    ));
    console.log(`Alert ${alertId} acknowledged`);
  }, []);

  // Resolve an alert
  const resolveAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'resolved' as const, resolvedAt: new Date() }
        : alert
    ));
    console.log(`Alert ${alertId} resolved`);
  }, []);

  // Add a new alert
  const addAlert = useCallback((alertData: Omit<Alert, 'id' | 'timestamp' | 'status'>) => {
    const newAlert: Alert = {
      ...alertData,
      id: `alert_${Date.now()}`,
      timestamp: new Date(),
      status: 'active'
    };
    
    setAlerts(prev => [newAlert, ...prev]);
    console.log(`New alert added: ${newAlert.message}`);
  }, []);

  // Clear all alerts
  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
    console.log('All alerts cleared');
  }, []);

  return {
    alerts,
    activeAlerts,
    acknowledgeAlert,
    resolveAlert,
    addAlert,
    clearAllAlerts
  };
};
