import React from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import type { Task } from '@/store/slices/taskSlice';

interface BoardProps {
  columns: string[];
  tasks: Task[];
  isLoading?: boolean;
  onAddTask?: (columnId: string) => void;
  onTaskClick?: (task: Task) => void;
  onMoveTask?: (taskId: string, columnId: string, index: number) => void;
}

export const Board: React.FC<BoardProps> = ({
  columns,
  tasks,
  isLoading = false,
  onAddTask,
  onTaskClick,
  onMoveTask,
}) => {
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((item) => item.id === String(event.active.id)) ?? null;
    setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !onMoveTask) {
      return;
    }

    const activeTaskItem = tasks.find((task) => task.id === String(active.id));
    if (!activeTaskItem) {
      return;
    }

    let targetColumnId = activeTaskItem.columnId;
    let targetIndex = tasks.filter((task) => task.columnId === targetColumnId).length;

    const overData = over.data.current;
    if (overData?.type === 'column' && typeof overData.columnId === 'string') {
      targetColumnId = overData.columnId;
      targetIndex = tasks.filter((task) => task.columnId === targetColumnId).length;
    }

    if (overData?.type === 'task' && overData.task) {
      const overTask = overData.task as Task;
      targetColumnId = overTask.columnId;
      targetIndex = tasks
        .filter((task) => task.columnId === targetColumnId)
        .sort((firstTask, secondTask) => firstTask.order - secondTask.order)
        .findIndex((task) => task.id === overTask.id);
    }

    if (targetIndex < 0) {
      targetIndex = 0;
    }

    onMoveTask(activeTaskItem.id, targetColumnId, targetIndex);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full items-start overflow-x-auto pb-4 scrollbar-thin">
        {columns.map((columnName) => {
          const columnId = columnName.toLowerCase().replace(/\s+/g, '');
          const columnTasks = tasks
            .filter((task) => task.columnId === columnId)
            .sort((firstTask, secondTask) => firstTask.order - secondTask.order);
          
          return (
            <Column
              key={columnId}
              id={columnId}
              title={columnName}
              tasks={columnTasks}
              isLoading={isLoading}
              onAddTask={onAddTask}
              onTaskClick={onTaskClick}
            />
          );
        })}
      </div>
      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease-out' }}>
        {activeTask ? <TaskCard task={activeTask} isDraggingOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
};
