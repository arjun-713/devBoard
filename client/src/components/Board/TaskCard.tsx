import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, GripVertical, MoreHorizontal, User } from 'lucide-react';
import type { Task } from '@/store/slices/taskSlice';

interface TaskCardProps {
  task: Task;
  columns?: string[];
  onClick?: () => void;
  onEditTask?: (task: Task) => void;
  onChangePriority?: (task: Task, priority: Task['priority']) => void;
  onMoveToColumn?: (task: Task, columnId: string) => void;
  onAssignUser?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
  isDraggingOverlay?: boolean;
  isDoneColumn?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  columns = [],
  onClick,
  onEditTask,
  onChangePriority,
  onMoveToColumn,
  onAssignUser,
  onDeleteTask,
  isDraggingOverlay = false,
  isDoneColumn = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!isMenuOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [isMenuOpen]);

  const tagTheme = (label: string) => {
    const normalized = label.toLowerCase();
    if (normalized === 'backend') return 'border-violet-400/20 bg-violet-500/10 text-violet-200/80';
    if (normalized === 'docs') return 'border-blue-400/20 bg-blue-500/10 text-blue-200/80';
    if (normalized === 'ux') return 'border-pink-400/20 bg-pink-500/10 text-pink-200/80';
    if (normalized === 'frontend') return 'border-cyan-400/20 bg-cyan-500/10 text-cyan-200/80';
    if (normalized === 'quality') return 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200/80';
    return 'border-border bg-bg-overlay text-text-secondary';
  };

  const priorityTheme: Record<Task['priority'], string> = {
    high: 'border-red-500/20 bg-red-500/10 text-red-300',
    medium: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    low: 'border-blue-500/20 bg-blue-500/10 text-blue-300',
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
      className="group animate-task-appear cursor-pointer touch-none rounded-lg border border-border bg-bg-surface p-3
                 transition-all duration-150 hover:-translate-y-0.5 hover:border-border-strong hover:bg-bg-elevated"
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
          <span className="text-[15px] font-medium text-text-primary leading-snug truncate">
            {task.title}
          </span>
        </div>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-text-primary"
            onClick={(event) => {
              event.stopPropagation();
              setIsMenuOpen((current) => !current);
            }}
            aria-label="Task actions"
          >
            <MoreHorizontal size={14} />
          </button>
          {isMenuOpen ? (
            <div
              className="absolute right-0 top-6 z-20 w-[190px] rounded-md border border-border bg-bg-elevated p-1"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="w-full rounded px-2 py-1.5 text-left text-[12px] text-text-secondary transition-colors hover:bg-bg-overlay hover:text-text-primary"
                onClick={() => {
                  onEditTask?.(task);
                  setIsMenuOpen(false);
                }}
              >
                Edit task
              </button>
              <div className="my-1 border-t border-border-subtle" />
              <p className="px-2 pb-1 text-[10px] uppercase tracking-[0.08em] text-text-muted">Change priority</p>
              {(['high', 'medium', 'low'] as Task['priority'][]).map((priority) => (
                <button
                  key={`${task.id}-${priority}`}
                  type="button"
                  className="w-full rounded px-2 py-1.5 text-left text-[12px] text-text-secondary transition-colors hover:bg-bg-overlay hover:text-text-primary"
                  onClick={() => {
                    onChangePriority?.(task, priority);
                    setIsMenuOpen(false);
                  }}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </button>
              ))}
              <div className="my-1 border-t border-border-subtle" />
              <p className="px-2 pb-1 text-[10px] uppercase tracking-[0.08em] text-text-muted">Move to column</p>
              {columns.map((columnName) => {
                const columnId = columnName.toLowerCase().replace(/\s+/g, '');
                return (
                  <button
                    key={`${task.id}-${columnId}`}
                    type="button"
                    className="w-full rounded px-2 py-1.5 text-left text-[12px] text-text-secondary transition-colors hover:bg-bg-overlay hover:text-text-primary"
                    onClick={() => {
                      onMoveToColumn?.(task, columnId);
                      setIsMenuOpen(false);
                    }}
                  >
                    {columnName}
                  </button>
                );
              })}
              <div className="my-1 border-t border-border-subtle" />
              <button
                type="button"
                className="w-full rounded px-2 py-1.5 text-left text-[12px] text-text-secondary transition-colors hover:bg-bg-overlay hover:text-text-primary"
                onClick={() => {
                  onAssignUser?.(task);
                  setIsMenuOpen(false);
                }}
              >
                Assign user
              </button>
              <button
                type="button"
                className="w-full rounded px-2 py-1.5 text-left text-[12px] text-red-300 transition-colors hover:bg-bg-overlay hover:text-red-200"
                onClick={() => {
                  onDeleteTask?.(task);
                  setIsMenuOpen(false);
                }}
              >
                Delete task
              </button>
            </div>
          ) : null}
        </div>
      </div>
      
      {task.description && (
        <p className="mt-1.5 text-[13px] leading-[1.45] text-text-secondary line-clamp-2">
          {task.description}
        </p>
      )}

      {task.labels && task.labels.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {task.labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium tracking-[0.01em] ${tagTheme(label)}`}
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}

      <div className={`mt-3 flex flex-wrap items-center gap-2 text-[12px] ${isDragging || isDraggingOverlay ? 'opacity-55' : ''}`}>
        <span
          className={`rounded-md border px-2 py-0.5 text-[12px] font-medium ${priorityTheme[task.priority]}`}
        >
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
        <span className="text-text-muted">-</span>
        <div className={`flex items-center gap-2 text-[12px] text-text-muted ${isDoneColumn ? 'opacity-80' : ''}`}>
          <div className={`w-4 h-4 rounded-full bg-brand-blue-deep flex items-center justify-center overflow-hidden ${isDoneColumn ? 'grayscale' : ''}`}>
            {assigneeLabel === 'Unassigned' ? (
              <User size={10} className="text-white" />
            ) : (
              <span className="text-[10px] font-semibold text-white">{assigneeInitial}</span>
            )}
          </div>
          <span>{assigneeLabel}</span>
        </div>
        <span className="text-text-muted">-</span>
        <div className="flex items-center gap-1 text-[12px] text-text-muted">
          <Calendar size={11} />
          <span>{formattedDueDate}</span>
        </div>
      </div>
      </div>
    </div>
  );
};
