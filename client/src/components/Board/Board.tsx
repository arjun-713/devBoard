import React from 'react';
import { Column } from './Column';
import { Task } from '@/store/slices/taskSlice';

interface BoardProps {
  columns: string[];
  tasks: Task[];
  onAddTask?: (columnId: string) => void;
}

export const Board: React.FC<BoardProps> = ({ columns, tasks, onAddTask }) => {
  return (
    <div className="flex gap-4 h-full items-start overflow-x-auto pb-4 scrollbar-thin">
      {columns.map((columnName) => {
        // Map display name to internal columnId (simplified for now)
        const columnId = columnName.toLowerCase().replace(/\s+/g, '');
        const columnTasks = tasks.filter(t => t.columnId === columnId);
        
        return (
          <Column
            key={columnId}
            id={columnId}
            title={columnName}
            tasks={columnTasks}
            onAddTask={onAddTask}
          />
        );
      })}
    </div>
  );
};
