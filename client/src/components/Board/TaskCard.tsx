import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '../UI/Badge';
import { MoreHorizontal, Calendar, User } from 'lucide-react';
import type { Task } from '@/store/slices/taskSlice';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  isDraggingOverlay?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, isDraggingOverlay = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
    disabled: isDraggingOverlay,
  });

  const style = isDraggingOverlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      {...attributes}
      {...listeners}
      className="group bg-bg-surface border border-border rounded-lg p-3
                 hover:border-border-strong hover:bg-bg-elevated transition-all duration-150 cursor-pointer
                 touch-none"
      data-dragging={isDragging}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-medium text-text-primary leading-snug">
          {task.title}
        </span>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-text-primary">
          <MoreHorizontal size={14} />
        </button>
      </div>
      
      {task.description && (
        <p className="text-[12px] text-text-secondary mt-1.5 leading-[1.4] line-clamp-2">
          {task.description}
        </p>
      )}

      <div className={`flex items-center justify-between mt-3 ${isDragging ? 'opacity-50 rotate-1 scale-[1.02]' : ''}`}>
        <Badge variant={task.priority}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </Badge>
        
        <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted">
          <div className="w-4 h-4 rounded-full bg-brand-blue-deep flex items-center justify-center overflow-hidden">
            <User size={10} className="text-white" />
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={10} />
            <span>Apr 12</span>
          </div>
        </div>
      </div>
    </div>
  );
};
