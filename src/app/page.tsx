// src/app/page.tsx
'use client';
import { useState } from 'react';
import ProviderStatusCard from '@/components/dashboard/ProviderStatusCard';
import { TransactionVolumeChart } from '@/components/charts/TransactionVolumeChart';
import { ProviderPerformanceChart } from '@/components/charts/ProviderPerformanceChart';
import { DraggableGrid } from '@/components/draggable/DraggableGrid';
import { useTransactionStream } from '@/hooks/useTransactionStream';
import { Play, Pause, AlertTriangle, TrendingUp, BarChart3, Activity } from 'lucide-react';

export default function Dashboard() {
  const {
    transactions,
    providers,
    isSimulating,
    startSimulation,
    stopSimulation,
    simulateProviderDown,
    simulateProviderRecovery
  } = useTransactionStream();

  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  const totalTransactions = providers.reduce((sum, p) => sum + p.transactionsToday, 0);
  const averageUptime = providers.reduce((sum, p) => sum + p.uptime, 0) / providers.length;
  const averageCost = providers.reduce((sum, p) => sum + p.costPerTransaction, 0) / providers.length;
  const operationalCount = providers.filter(p => p.status === 'operational').length;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Controls */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Gateway Dashboard</h1>
              <p className="text-gray-600 mt-2">Monitor and manage multiple payment providers</p>
              <div className="mt-4 text-sm text-gray-500">
                Project Manager: Abayomi Ajayi | Last Updated: {new Date().toLocaleDateString()}
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={isSimulating ? stopSimulation : startSimulation}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  isSimulating 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
              </button>
              
              {isSimulating && (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Live</span>
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Overview
                </div>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Key Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{operationalCount}</div>
                    <div className="text-gray-600">Operational</div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {totalTransactions.toLocaleString()}
                    </div>
                    <div className="text-gray-600">Total Transactions Today</div>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-xs font-bold">TX</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {averageUptime.toFixed(1)}%
                    </div>
                    <div className="text-gray-600">Average Uptime</div>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-xs font-bold">UP</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      ${averageCost.toFixed(3)}
                    </div>
                    <div className="text-gray-600">Avg Cost per Transaction</div>
                  </div>
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-xs font-bold">$</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Draggable Provider Cards */}
            <div className="mb-8">
              <DraggableGrid
                items={providers.map(provider => ({
                  id: provider.id,
                  component: (
                    <div className="relative">
                      <ProviderStatusCard provider={provider} />
                      
                      {/* Provider Control Overlay */}
                      <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <button
                            onClick={() => simulateProviderDown(provider.id)}
                            className="p-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            title="Simulate Downtime"
                          >
                            <AlertTriangle className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => simulateProviderRecovery(provider.id)}
                            className="p-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                            title="Simulate Recovery"
                          >
                            <TrendingUp className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ),
                  title: provider.name
                }))}
                className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              />
            </div>

            {/* Live Transaction Feed */}
            {isSimulating && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Live Transaction Feed
                  <span className="ml-2 text-sm text-gray-500">({transactions.length} recent)</span>
                </h3>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {transactions.slice(0, 20).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          transaction.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div className="text-sm">
                          <span className="font-medium">{transaction.provider}</span>
                          <span className="text-gray-500 ml-2">
                            ${transaction.amount} {transaction.currency}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{transaction.responseTime}ms</span>
                        <span className={
                          transaction.status === 'completed' ? 'text-green-600' : 'text-red-600'
                        }>
                          {transaction.status}
                        </span>
                        <span>{new Date(transaction.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <TransactionVolumeChart transactions={transactions} />
            <ProviderPerformanceChart providers={providers} />
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Multi-Provider Payment Gateway Dashboard - Built with Next.js & TypeScript</p>
          <p>Showcasing Project Management Skills in Fintech Integration</p>
        </div>
      </div>
    </main>
  );
}}
