import React from 'react';
import { TaskCard } from './TaskCard';
import { Task } from '@/store/slices/taskSlice';
import { Plus } from 'lucide-react';

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onAddTask?: (columnId: string) => void;
}

export const Column: React.FC<ColumnProps> = ({ id, title, tasks, onAddTask }) => {
  const statusColors: Record<string, string> = {
    'To Do': '#555550',
    'In Progress': '#FF9E00',
    'Done': '#00B4D8',
  };

  const statusKey = title === 'To Do' ? 'todo' : title === 'In Progress' ? 'inprogress' : 'done';

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
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto min-h-[150px] pr-1">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        
        {tasks.length === 0 && (
          <div className="border border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center text-center">
            <p className="text-[11px] text-text-muted italic">No tasks yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
