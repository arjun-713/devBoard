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
    <div className="group w-[300px] min-w-[300px] flex flex-col h-full">
      {/* Column Header */}
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span 
            className="h-2 w-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.28)]" 
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
            ? `bg-bg-elevated/50 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] ${isInProgressColumn ? 'border-[#FF9E00]/40' : 'border-border-strong'}`
            : ''
        }`}
      >
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          <div className="flex h-full flex-col gap-3 overflow-y-auto pr-1">
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
