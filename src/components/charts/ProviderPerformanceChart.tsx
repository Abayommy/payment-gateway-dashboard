// src/components/charts/ProviderPerformanceChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ProviderMetrics } from '@/services/simulator/transactionSimulator';

interface ProviderPerformanceChartProps {
  providers: ProviderMetrics[];
}

export const ProviderPerformanceChart: React.FC<ProviderPerformanceChartProps> = ({ providers }) => {
  const performanceData = providers.map(provider => ({
    name: provider.name,
    successRate: provider.successRate,
    uptime: provider.uptime,
    avgResponseTime: provider.avgResponseTime,
    status: provider.status
  }));

  const getBarColor = (status: string) => {
    switch (status) {
      case 'operational': return '#10b981';
      case 'degraded': return '#f59e0b';
      case 'down': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Provider Performance Comparison
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Success Rate Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Success Rate (%)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                domain={[90, 100]}
                stroke="#666"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [`${value}%`, 'Success Rate']}
              />
              <Bar dataKey="successRate" radius={[4, 4, 0, 0]}>
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Response Time Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Avg Response Time (ms)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [`${value}ms`, 'Response Time']}
              />
              <Bar dataKey="avgResponseTime" radius={[4, 4, 0, 0]}>
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Legend */}
      <div className="mt-4 flex justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600">Operational</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-sm text-gray-600">Degraded</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-sm text-gray-600">Down</span>
        </div>
      </div>
    </div>
  );
};
