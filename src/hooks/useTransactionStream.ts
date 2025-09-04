// src/hooks/useTransactionStream.ts
import { useState, useEffect, useCallback } from 'react';

export interface Transaction {
  id: string;
  timestamp: Date;
  provider: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  responseTime: number;
  errorCode?: string;
}

export interface ProviderMetrics {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: number;
  successRate: number;
  responseTime: number;
  totalTransactions: number;
  costPerTransaction: number;
}

export interface SystemMetrics {
  avgResponseTime: number;
  totalVolume: number;
  successRate: number;
  activeConnections: number;
}

export interface UseTransactionStreamReturn {
  transactions: Transaction[];
  providers: ProviderMetrics[];
  metrics: SystemMetrics;
  isRunning: boolean;
  startSimulation: () => void;
  stopSimulation: () => void;
}

export const useTransactionStream = (initialRunning: boolean = false): UseTransactionStreamReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isRunning, setIsRunning] = useState(initialRunning);

  // Provider configurations
  const providerConfigs = [
    { name: 'Stripe', successRate: 0.992, avgResponseTime: 245, cost: 0.029 },
    { name: 'PayPal', successRate: 0.988, avgResponseTime: 420, cost: 0.035 },
    { name: 'Square', successRate: 0.965, avgResponseTime: 680, cost: 0.025 }
  ];

  // Generate mock transactions
  const generateTransaction = useCallback(() => {
    const provider = providerConfigs[Math.floor(Math.random() * providerConfigs.length)];
    const isSuccess = Math.random() < provider.successRate;
    
    const transaction: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      provider: provider.name,
      amount: Math.round(Math.random() * 1000 * 100) / 100, // $0.00 - $1000.00
      status: isSuccess ? 'success' : 'failed',
      responseTime: Math.round(provider.avgResponseTime + (Math.random() - 0.5) * 200),
      errorCode: !isSuccess ? ['ERR_TIMEOUT', 'ERR_DECLINED', 'ERR_NETWORK'][Math.floor(Math.random() * 3)] : undefined
    };

    return transaction;
  }, []);

  // Calculate provider metrics
  const providers: ProviderMetrics[] = providerConfigs.map(config => {
    const providerTransactions = transactions.filter(t => t.provider === config.name);
    const successfulTransactions = providerTransactions.filter(t => t.status === 'success');
    
    return {
      name: config.name,
      status: config.successRate > 0.97 ? 'online' : config.successRate > 0.95 ? 'degraded' : 'offline',
      uptime: Math.round(config.successRate * 100 * 100) / 100,
      successRate: providerTransactions.length > 0 
        ? Math.round((successfulTransactions.length / providerTransactions.length) * 100 * 100) / 100
        : config.successRate * 100,
      responseTime: config.avgResponseTime,
      totalTransactions: providerTransactions.length,
      costPerTransaction: config.cost
    };
  });

  // Calculate system metrics
  const metrics: SystemMetrics = {
    avgResponseTime: transactions.length > 0 
      ? Math.round(transactions.reduce((sum, t) => sum + t.responseTime, 0) / transactions.length)
      : 245,
    totalVolume: transactions.reduce((sum, t) => sum + (t.status === 'success' ? t.amount : 0), 0),
    successRate: transactions.length > 0 
      ? Math.round((transactions.filter(t => t.status === 'success').length / transactions.length) * 100 * 100) / 100
      : 99.2,
    activeConnections: isRunning ? Math.floor(Math.random() * 50) + 150 : 0
  };

  // Transaction simulation effect
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const newTransaction = generateTransaction();
      setTransactions(prev => {
        // Keep only last 100 transactions for performance
        const updated = [newTransaction, ...prev].slice(0, 100);
        return updated;
      });
    }, Math.random() * 3000 + 1000); // Random interval between 1-4 seconds

    return () => clearInterval(interval);
  }, [isRunning, generateTransaction]);

  const startSimulation = useCallback(() => {
    setIsRunning(true);
    console.log('Transaction simulation started');
  }, []);

  const stopSimulation = useCallback(() => {
    setIsRunning(false);
    console.log('Transaction simulation stopped');
  }, []);

  return {
    transactions,
    providers,
    metrics,
    isRunning,
    startSimulation,
    stopSimulation
  };
};
