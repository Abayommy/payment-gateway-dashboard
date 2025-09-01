// src/components/charts/TransactionVolumeChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Transaction } from '@/services/simulator/transactionSimulator';
import { useMemo } from 'react';

interface TransactionVolumeChartProps {
  transactions: Transaction[];
}

interface VolumeData {
  time: string;
  stripe: number;
  paypal: number;
  square: number;
  total: number;
}

export const TransactionVolumeChart: React.FC<TransactionVolumeChartProps> = ({ transactions }) => {
  const volumeData = useMemo(() => {
    // Group transactions by minute for the last 10 minutes
    const now = new Date();
    const data: VolumeData[] = [];
    
    for (let i = 9; i >= 0; i--) {
      const timeSlot = new Date(now.getTime() - i * 60 * 1000);
      const timeKey = timeSlot.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const slotTransactions = transactions.filter(t => {
        const txTime = new Date(t.timestamp);
        return Math.abs(txTime.getTime() - timeSlot.getTime()) < 60000; // Within 1 minute
      });
      
      const stripeCount = slotTransactions.filter(t => t.provider === 'stripe').length;
      const paypalCount = slotTransactions.filter(t => t.provider === 'paypal').length;
      const squareCount = slotTransactions.filter(t => t.provider === 'square').length;
      
      data.push({
        time: timeKey,
        stripe: stripeCount,
        paypal: paypalCount,
        square: squareCount,
        total: stripeCount + paypalCount + squareCount
      });
    }
    
    return data;
  }, [transactions]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Transaction Volume (Last 10 Minutes)
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={volumeData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="time" 
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
          />
          <Legend />
          
          <Line 
            type="monotone" 
            dataKey="stripe" 
            stroke="#635bff" 
            strokeWidth={3}
            dot={{ r: 4 }}
            name="Stripe"
          />
          <Line 
            type="monotone" 
            dataKey="paypal" 
            stroke="#0070ba" 
            strokeWidth={3}
            dot={{ r: 4 }}
            name="PayPal"
          />
          <Line 
            type="monotone" 
            dataKey="square" 
            stroke="#00d924" 
            strokeWidth={3}
            dot={{ r: 4 }}
            name="Square"
          />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#6b7280" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3 }}
            name="Total"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
