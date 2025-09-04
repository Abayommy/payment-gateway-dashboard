'use client';

import { useState, useCallback } from 'react';

export interface Widget {
  id: string;
  type: string;
  title: string;
  component: React.ComponentType<any>;
  size: string;
  position: { x: number; y: number };
}

// Simple Widget Components
const RevenueWidget = ({ data }: any) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-gray-600">Today</span>
        <span className="font-semibold text-green-600">${(data?.today || 0).toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">This Month</span>
        <span className="font-semibold">${(data?.month || 0).toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Growth</span>
        <span className="font-semibold text-green-600">+{data?.growth || 0}%</span>
      </div>
    </div>
  </div>
);

const TransactionWidget = ({ data }: any) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Transactions</h3>
    <div className="text-center">
      <div className="text-3xl font-bold text-blue-600 mb-2">{data?.transactions || 0}</div>
      <div className="text-sm text-gray-600">Total Today</div>
    </div>
  </div>
);

// Default widgets
const defaultWidgets: Widget[] = [
  {
    id: 'revenue-1',
    type: 'revenue',
    title: 'Revenue Overview',
    component: RevenueWidget,
    size: 'large',
    position: { x: 0, y: 0 }
  },
  {
    id: 'transactions-1',
    type: 'transactions', 
    title: 'Transactions',
    component: TransactionWidget,
    size: 'medium',
    position: { x: 2, y: 0 }
  }
];

// Widget component mapping
const widgetComponents: Record<string, React.ComponentType<any>> = {
  revenue: RevenueWidget,
  transactions: TransactionWidget,
  success_rate: TransactionWidget,
  active_users: TransactionWidget,
  alerts: TransactionWidget,
  performance: TransactionWidget,
};

export const useDragAndDrop = () => {
  const [widgets, setWidgets] = useState<Widget[]>(defaultWidgets);

  const moveWidget = useCallback((draggedId: string, targetPosition: { x: number; y: number }) => {
    setWidgets(prev => {
      const draggedWidget = prev.find(w => w.id === draggedId);
      if (!draggedWidget) return prev;

      return prev.map(widget => {
        if (widget.id === draggedId) {
          return { ...widget, position: targetPosition };
        }
        return widget;
      });
    });
  }, []);

  const removeWidget = useCallback((widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  }, []);

  const addWidget = useCallback((widgetType: string, position: { x: number; y: number }) => {
    const componentMap = widgetComponents[widgetType];
    if (!componentMap) return;

    const newWidget: Widget = {
      id: `${widgetType}-${Date.now()}`,
      type: widgetType,
      title: widgetType.charAt(0).toUpperCase() + widgetType.slice(1),
      component: componentMap,
      size: 'medium',
      position
    };

    setWidgets(prev => {
      const filtered = prev.filter(w => !(w.position.x === position.x && w.position.y === position.y));
      return [...filtered, newWidget];
    });
  }, []);

  const resetLayout = useCallback(() => {
    setWidgets(defaultWidgets);
  }, []);

  return {
    widgets,
    moveWidget,
    removeWidget,
    addWidget,
    resetLayout
  };
};
