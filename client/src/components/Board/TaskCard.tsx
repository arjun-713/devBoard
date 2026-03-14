import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '../UI/Badge';
import { MoreHorizontal, Calendar, GripVertical, User } from 'lucide-react';
import type { Task } from '@/store/slices/taskSlice';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  isDraggingOverlay?: boolean;
  isDoneColumn?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  isDraggingOverlay = false,
  isDoneColumn = false,
}) => {
  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'No date';
  const assigneeLabel = task.assigneeName?.trim() || 'Unassigned';
  const assigneeInitial = assigneeLabel.charAt(0).toUpperCase();

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
      className="group bg-bg-surface border border-border rounded-lg p-3
                 hover:border-border-strong hover:bg-bg-elevated transition-all duration-150 cursor-pointer
                 touch-none"
      data-dragging={isDragging}
      aria-disabled={isDoneColumn}
    >
      <div className={isDoneColumn ? 'opacity-80' : ''}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <button
            type="button"
            className="mt-0.5 text-text-muted/70 hover:text-text-primary cursor-grab active:cursor-grabbing"
            onClick={(event) => event.stopPropagation()}
            {...attributes}
            {...listeners}
            aria-label="Drag task"
          >
            <GripVertical size={13} />
          </button>
          <span className="text-[13px] font-medium text-text-primary leading-snug truncate">
            {task.title}
          </span>
        </div>
        <button
          type="button"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-text-primary"
          onClick={(event) => event.stopPropagation()}
          aria-label="Task actions"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>
      
      {task.description && (
        <p className="text-[12px] text-text-secondary mt-1.5 leading-[1.4] line-clamp-2">
          {task.description}
        </p>
      )}

      {task.labels && task.labels.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {task.labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className="rounded-md border border-border-strong bg-bg-elevated px-1.5 py-0.5 text-[10px] font-mono text-text-secondary"
            >
              #{label}
            </span>
          ))}
        </div>
      ) : null}

      <div
        className={`flex items-center justify-between mt-3 ${
          isDragging || isDraggingOverlay ? 'opacity-50 rotate-1 scale-[1.02]' : ''
        }`}
      >
        <Badge variant={task.priority}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </Badge>
        
        <div className={`flex items-center gap-2 text-[11px] font-mono text-text-muted ${isDoneColumn ? 'opacity-80' : ''}`}>
          <div className={`w-4 h-4 rounded-full bg-brand-blue-deep flex items-center justify-center overflow-hidden ${isDoneColumn ? 'grayscale' : ''}`}>
            {assigneeLabel === 'Unassigned' ? (
              <User size={10} className="text-white" />
            ) : (
              <span className="text-[10px] font-semibold text-white">{assigneeInitial}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={10} />
            <span>{formattedDueDate}</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
