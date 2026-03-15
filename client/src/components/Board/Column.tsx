import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import type { Task } from '@/store/slices/taskSlice';
import { Plus } from 'lucide-react';

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  columns?: string[];
  isLoading?: boolean;
  onAddTask?: (columnId: string) => void;
  onTaskClick?: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onChangeTaskPriority?: (task: Task, priority: Task['priority']) => void;
  onMoveTaskToColumn?: (task: Task, columnId: string) => void;
  onAssignTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
}

export const Column: React.FC<ColumnProps> = ({
  id,
  title,
  tasks,
  columns = [],
  isLoading = false,
  onAddTask,
  onTaskClick,
  onEditTask,
  onChangeTaskPriority,
  onMoveTaskToColumn,
  onAssignTask,
  onDeleteTask,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${id}`,
    data: {
      type: 'column',
      columnId: id,
    },
  });

  const statusColors: Record<string, string> = {
    'To Do': '#555550',
    'In Progress': '#FF9E00',
    'Done': '#00B4D8',
  };
  const isDoneColumn = id === 'done';
  const isTodoColumn = id === 'todo';

  return (
    <div className="group flex h-full w-[286px] min-w-[286px] flex-col">
      {/* Column Header */}
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span 
            className="h-1.5 w-1.5 rounded-full" 
            style={{ backgroundColor: statusColors[title] || '#555550' }} 
          />
          <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-text-secondary">
            {title}
          </span>
          <span className="ml-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-text-muted font-mono">
            {tasks.length}
          </span>
        </div>
        
        <button 
          onClick={() => onAddTask?.(id)}
          className="rounded-md p-1 text-text-muted opacity-0 transition-all duration-200 hover:bg-bg-overlay hover:text-text-primary group-hover:opacity-100"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Task List */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[150px] rounded-2xl border border-transparent p-1.5 transition-all duration-200 ${
          isOver
            ? 'border-border-strong bg-bg-elevated/40'
            : ''
        }`}
      >
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          <div className="flex h-full flex-col gap-2.5 overflow-y-auto pr-1">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`${id}-skeleton-${index}`}
                    className="rounded-lg border border-border bg-[#1C1C1C] p-3 animate-pulse"
                  >
                    <div className="h-3.5 w-3/4 rounded bg-bg-overlay" />
                    <div className="mt-2 h-3 w-full rounded bg-bg-overlay" />
                    <div className="mt-1.5 h-3 w-5/6 rounded bg-bg-overlay" />
                    <div className="mt-3 flex justify-between">
                      <div className="h-4 w-12 rounded bg-bg-overlay" />
                      <div className="h-4 w-16 rounded bg-bg-overlay" />
                    </div>
                  </div>
                ))
              : null}
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                columns={columns}
                isDoneColumn={isDoneColumn}
                onClick={() => onTaskClick?.(task)}
                onEditTask={onEditTask}
                onChangePriority={onChangeTaskPriority}
                onMoveToColumn={onMoveTaskToColumn}
                onAssignUser={onAssignTask}
                onDeleteTask={onDeleteTask}
              />
            ))}
            
            {!isLoading && tasks.length === 0 && (
              <div className="rounded-lg border border-dashed border-border px-4 py-5 text-center">
                {isTodoColumn ? (
                  <>
                    <p className="text-[12px] text-text-muted">No tasks in To Do</p>
                    <button
                      type="button"
                      onClick={() => onAddTask?.(id)}
                      className="mt-2 inline-flex items-center rounded-md border border-border px-2.5 py-1 text-[12px] text-text-secondary transition-colors hover:bg-bg-overlay hover:text-text-primary"
                    >
                      <Plus size={12} className="mr-1.5" />
                      Add task
                    </button>
                  </>
                ) : (
                  <>
                    <Plus size={16} className="mx-auto mb-2 text-text-muted" />
                    <h4 className="text-[12px] font-medium text-text-secondary">No Tasks</h4>
                    <p className="mt-1 text-[11px] text-[#555550]">Use + to add a task in this column.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};
