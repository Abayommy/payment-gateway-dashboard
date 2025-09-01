import { useState, useEffect, useCallback } from 'react';
import { transactionSimulator, Transaction, ProviderMetrics } from '@/services/simulator/transactionSimulator';

export const useTransactionStream = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [providers, setProviders] = useState<ProviderMetrics[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleNewTransaction = useCallback((transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev.slice(0, 99)]);
  }, []);

  const handleMetricsUpdate = useCallback((metrics: ProviderMetrics[]) => {
    setProviders(metrics);
  }, []);

  const startSimulation = useCallback(() => {
    if (!isSimulating) {
      transactionSimulator.start();
      setIsSimulating(true);
    }
  }, [isSimulating]);

  const stopSimulation = useCallback(() => {
    if (isSimulating) {
      transactionSimulator.stop();
      setIsSimulating(false);
    }
  }, [isSimulating]);

  const simulateProviderDown = useCallback((providerId: string) => {
    transactionSimulator.simulateProviderDown(providerId);
  }, []);

  const simulateProviderRecovery = useCallback((providerId: string) => {
    transactionSimulator.simulateProviderRecovery(providerId);
  }, []);

  useEffect(() => {
    const unsubscribeTransaction = transactionSimulator.onTransaction(handleNewTransaction);
    const unsubscribeMetrics = transactionSimulator.onMetricsUpdate(handleMetricsUpdate);

    setProviders(transactionSimulator.getProviders());

    return () => {
      unsubscribeTransaction();
      unsubscribeMetrics();
    };
  }, [handleNewTransaction, handleMetricsUpdate]);

  useEffect(() => {
    return () => {
      transactionSimulator.stop();
    };
  }, []);

  return {
    transactions,
    providers,
    isSimulating,
    startSimulation,
    stopSimulation,
    simulateProviderDown,
    simulateProviderRecovery
  };
};
