// src/components/draggable/DraggableTile.tsx
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Move, GripVertical } from 'lucide-react';

interface DraggableTileProps {
  id: string;
  index: number;
  children: React.ReactNode;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  title?: string;
  className?: string;
}

const ItemType = 'TILE';

export const DraggableTile: React.FC<DraggableTileProps> = ({
  id,
  index,
  children,
  moveItem,
  title,
  className = ''
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemType,
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover(item: { id: string; index: number }, monitor) {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      
      if (!clientOffset) return;
      
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveItem(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={preview}
      className={`relative transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95 shadow-2xl' : 'opacity-100 scale-100'
      } ${className}`}
    >
      {/* Drag Handle */}
      <div
        ref={ref}
        className="absolute top-2 left-2 z-10 cursor-move opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1 shadow-md hover:shadow-lg"
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4 text-gray-500" />
      </div>

      {/* Tile Content */}
      <div className="group relative">
        {children}
      </div>
    </div>
  );
};
