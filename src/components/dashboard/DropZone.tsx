'use client';

import React from 'react';
import { useDrop } from 'react-dnd';
import { Plus, Grid3X3 } from 'lucide-react';

interface DropZoneProps {
  onDrop: (widgetType: string, position: { x: number; y: number }) => void;
  isEditMode: boolean;
  isEmpty?: boolean;
  position: { x: number; y: number };
  className?: string;
}

const DropZone: React.FC<DropZoneProps> = ({ 
  onDrop, 
  isEditMode, 
  isEmpty = false, 
  position,
  className = ""
}) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'widget',
    drop: (item: { id: string; type: string }) => {
      onDrop(item.type, position);
      return { moved: true };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const getDropZoneClasses = () => {
    if (!isEditMode) return '';
    
    if (isEmpty) {
      return `border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 ${isOver && canDrop ? 'border-blue-400 bg-blue-50' : ''} ${canDrop && !isOver ? 'border-gray-300' : ''}`;
    }

    return `${isOver && canDrop ? 'bg-blue-50 border-blue-200' : ''} ${canDrop && !isOver ? 'hover:bg-gray-50' : ''}`;
  };

  if (!isEditMode && isEmpty) {
    return <div className={`col-span-1 row-span-1 ${className}`} />;
  }

  return (
    <div
      ref={drop}
      className={`col-span-1 row-span-1 rounded-lg transition-all duration-200 relative ${getDropZoneClasses()} ${className}`}
      style={{
        minHeight: isEmpty ? '120px' : 'auto',
      }}
    >
      {isEmpty && isEditMode && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          {isOver && canDrop ? (
            <>
              <Grid3X3 className="h-8 w-8 text-blue-500 mb-2" />
              <p className="text-sm font-medium text-blue-700">Drop widget here</p>
              <p className="text-xs text-blue-600">Release to place</p>
            </>
          ) : (
            <>
              <Plus className="h-6 w-6 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Empty slot</p>
              <p className="text-xs text-gray-400">Drag widget here</p>
            </>
          )}
        </div>
      )}

      {!isEmpty && isEditMode && isOver && canDrop && (
        <div className="absolute inset-0 border-2 border-blue-400 bg-blue-50 bg-opacity-50 rounded-lg flex items-center justify-center pointer-events-none">
          <div className="bg-blue-100 px-3 py-1 rounded-md border border-blue-300">
            <p className="text-sm font-medium text-blue-700">Replace widget</p>
          </div>
        </div>
      )}
    </div>
  );
};

interface WidgetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWidget: (widgetType: string) => void;
  availableWidgets: Array<{
    type: string;
    title: string;
    description: string;
    icon: React.ComponentType<any>;
  }>;
}

export const WidgetSelector: React.FC<WidgetSelectorProps> = ({
  isOpen,
  onClose,
  onSelectWidget,
  availableWidgets
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Add Widget</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {availableWidgets.map((widget) => {
              const IconComponent = widget.icon;
              return (
                <button
                  key={widget.type}
                  onClick={() => {
                    onSelectWidget(widget.type);
                    onClose();
                  }}
                  className="p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="flex items-center mb-2">
                    <IconComponent className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-medium text-gray-900">{widget.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{widget.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropZone;
