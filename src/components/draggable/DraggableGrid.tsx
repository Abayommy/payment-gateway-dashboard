// src/components/draggable/DraggableGrid.tsx
import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableTile } from './DraggableTile';

interface GridItem {
  id: string;
  component: React.ReactNode;
  title?: string;
}

interface DraggableGridProps {
  items: GridItem[];
  className?: string;
  onOrderChange?: (newOrder: GridItem[]) => void;
}

export const DraggableGrid: React.FC<DraggableGridProps> = ({
  items: initialItems,
  className = '',
  onOrderChange
}) => {
  const [items, setItems] = useState(initialItems);

  const moveItem = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const draggedItem = items[dragIndex];
      const newItems = [...items];
      
      // Remove dragged item and insert at new position
      newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, draggedItem);
      
      setItems(newItems);
      onOrderChange?.(newItems);
    },
    [items, onOrderChange]
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`grid gap-6 ${className}`}>
        {items.map((item, index) => (
          <DraggableTile
            key={item.id}
            id={item.id}
            index={index}
            moveItem={moveItem}
            title={item.title}
          >
            {item.component}
          </DraggableTile>
        ))}
      </div>
    </DndProvider>
  );
};
