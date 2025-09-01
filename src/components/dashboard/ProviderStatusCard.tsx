// src/components/dashboard/ProviderStatusCard.tsx
import React from 'react';
import { CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';

interface PaymentProvider {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: number;
  avgResponseTime: number;
  costPerTransaction: number;
  transactionsToday: number;
  successRate: number;
}

interface ProviderStatusCardProps {
  provider: PaymentProvider;
}

const ProviderStatusCard: React.FC<ProviderStatusCardProps> = ({ provider }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-500 bg-green-50 border-green-200';
      case 'degraded': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'down': return 'text-red-500 bg-red-50 border-red-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="w-5 h-5" />;
      case 'degraded': return <Clock className="w-5 h-5" />;
      case 'down': return <XCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(provider.status)}`}>
          {getStatusIcon(provider.status)}
          <span className="capitalize">{provider.status}</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{provider.uptime}%</div>
          <div className="text-sm text-gray-600">Uptime</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{provider.avgResponseTime}ms</div>
          <div className="text-sm text-gray-600">Avg Response</div>
        </div>
      </div>

      {/* Transaction Info */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="font-semibold text-gray-900">{provider.transactionsToday.toLocaleString()}</div>
          <div className="text-gray-600">Today's Txns</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900">{provider.successRate}%</div>
          <div className="text-gray-600">Success Rate</div>
        </div>
        <div className="text-center flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-gray-600 mr-1" />
          <div className="font-semibold text-gray-900">${provider.costPerTransaction}</div>
        </div>
      </div>

      {/* Action Button */}
      <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
        View Details
      </button>
    </div>
  );
};

export default ProviderStatusCard;
