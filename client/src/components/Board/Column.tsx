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
  isLoading?: boolean;
  onAddTask?: (columnId: string) => void;
  onTaskClick?: (task: Task) => void;
}

export const Column: React.FC<ColumnProps> = ({
  id,
  title,
  tasks,
  isLoading = false,
  onAddTask,
  onTaskClick,
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
  const isInProgressColumn = id === 'inprogress';

  return (
    <div className="w-[280px] min-w-[280px] flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2">
          <span 
            className="w-1.5 h-1.5 rounded-full" 
            style={{ backgroundColor: statusColors[title] || '#555550' }} 
          />
          <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-text-secondary">
            {title}
          </span>
          <span className="text-[11px] text-text-muted font-mono bg-bg-surface px-1.5 py-0.5 rounded ml-1">
            {tasks.length}
          </span>
        </div>
        
        <button 
          onClick={() => onAddTask?.(id)}
          className="text-text-muted hover:text-text-primary transition-colors p-1"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Task List */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[150px] rounded-xl border border-transparent transition-all duration-150 ${
          isOver
            ? `bg-bg-elevated/40 ${isInProgressColumn ? 'border-[#FF9E00]/20' : 'border-border-strong'}`
            : ''
        }`}
      >
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          <div className="flex h-full flex-col gap-2 overflow-y-auto pr-1">
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
                isDoneColumn={isDoneColumn}
                onClick={() => onTaskClick?.(task)}
              />
            ))}
            
            {!isLoading && tasks.length === 0 && (
              <div className="border border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center text-center">
                <Plus size={16} className="text-text-muted mb-2" />
                <h4 className="text-[12px] font-medium text-text-secondary">No Tasks</h4>
                <p className="text-[11px] text-[#555550] mt-1">Use + to add a task in this column.</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};
