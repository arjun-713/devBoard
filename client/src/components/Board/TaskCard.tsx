import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  const tagTheme = (label: string) => {
    const normalized = label.toLowerCase();
    if (normalized === 'backend') return 'border-violet-400/30 bg-violet-500/15 text-violet-200';
    if (normalized === 'docs') return 'border-blue-400/30 bg-blue-500/15 text-blue-200';
    if (normalized === 'ux') return 'border-pink-400/30 bg-pink-500/15 text-pink-200';
    if (normalized === 'frontend') return 'border-cyan-400/30 bg-cyan-500/15 text-cyan-200';
    if (normalized === 'quality') return 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200';
    return 'border-border-strong bg-bg-overlay text-text-secondary';
  };

  const priorityTheme: Record<Task['priority'], string> = {
    high: 'border-red-500/30 bg-red-500/15 text-red-300',
    medium: 'border-amber-500/30 bg-amber-500/15 text-amber-300',
    low: 'border-blue-500/30 bg-blue-500/15 text-blue-300',
  };

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
      className="group rounded-xl border border-[#2A2A2E] bg-[#18181B] p-3.5 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]
                 transition-all duration-200 cursor-pointer touch-none
                 hover:-translate-y-0.5 hover:border-[#3A3A40] hover:shadow-[0_12px_28px_rgba(0,0,0,0.35),0_1px_0_rgba(255,255,255,0.06)_inset]"
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
          <span className="text-[15px] font-semibold text-text-primary leading-snug truncate">
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
        <p className="text-[13px] text-text-secondary mt-2 leading-[1.45] line-clamp-2">
          {task.description}
        </p>
      )}

      {task.labels && task.labels.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {task.labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className={`rounded-full border px-2 py-0.5 text-[11px] font-medium transition-all duration-200 hover:brightness-110 ${tagTheme(label)}`}
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}

      <div
        className={`flex items-center justify-between mt-3 ${
          isDragging || isDraggingOverlay ? 'opacity-50 rotate-1 scale-[1.02]' : ''
        }`}
      >
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[12px] font-medium transition-all duration-200 hover:shadow-[0_0_12px_rgba(255,255,255,0.12)] ${priorityTheme[task.priority]}`}
        >
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
        
        <div className={`flex items-center gap-2 text-[12px] font-mono text-text-muted ${isDoneColumn ? 'opacity-80' : ''}`}>
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
