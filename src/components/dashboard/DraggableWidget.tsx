'use client';

import React from 'react';
import { useDrag } from 'react-dnd';
import { GripVertical } from 'lucide-react';

export interface Widget {
  id: string;
  type: 'revenue' | 'transactions' | 'success_rate' | 'active_users' | 'alerts' | 'performance';
  title: string;
  component: React.ComponentType<any>;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
}

interface DraggableWidgetProps {
  widget: Widget;
  children: React.ReactNode;
  isEditMode: boolean;
  onRemove?: (widgetId: string) => void;
}

const DraggableWidget: React.FC<DraggableWidgetProps> = ({ 
  widget, 
  children, 
  isEditMode,
  onRemove 
}) => {
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'widget',
    item: { id: widget.id, type: widget.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isEditMode,
  });

  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-2 row-span-1',
    large: 'col-span-2 row-span-2',
  };

  return (
    <div
      ref={preview}
      className={`relative bg-white rounded-lg border shadow-sm transition-all duration-200 ${sizeClasses[widget.size]} ${isDragging ? 'opacity-50 shadow-lg' : ''} ${isEditMode ? 'hover:shadow-md cursor-move' : ''}`}
      style={{
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      {isEditMode && (
        <div
          ref={drag}
          className="absolute top-2 right-2 z-10 p-1 bg-gray-100 rounded cursor-move hover:bg-gray-200 transition-colors"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-gray-500" />
        </div>
      )}

      {isEditMode && onRemove && (
        <button
          onClick={() => onRemove(widget.id)}
          className="absolute top-2 left-2 z-10 w-6 h-6 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
          title="Remove widget"
        >
          <span className="text-red-600 text-xs font-bold">×</span>
        </button>
      )}

      <div className={`h-full ${isEditMode ? 'pt-8' : 'pt-4'} px-4 pb-4`}>
        {children}
      </div>

      {isEditMode && (
        <div className="absolute inset-0 bg-blue-50 bg-opacity-30 border-2 border-blue-200 border-dashed rounded-lg flex items-center justify-center pointer-events-none">
          <div className="bg-white px-3 py-1 rounded-md shadow-sm border">
            <p className="text-sm font-medium text-blue-600">{widget.title}</p>
            <p className="text-xs text-gray-500">Drag to reposition</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraggableWidget;
