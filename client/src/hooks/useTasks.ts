import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { setTasks, moveTask as moveTaskAction } from '@/store/slices/taskSlice';
import type { Task } from '@/store/slices/taskSlice';
import { addTask as addTaskAction, updateTask as updateTaskAction, deleteTask as deleteTaskAction } from '@/store/slices/taskSlice';
import client from '@/api/client';
import {
  createDemoId,
  ensureDemoSeeded,
  getDemoTasks,
  isDemoUser,
  setDemoTasks,
} from '@/data/demoData';

interface ApiTask extends Omit<Task, 'id'> {
  _id: string;
}

interface CreateTaskInput {
  title: string;
  description: string;
  priority: Task['priority'];
  dueDate?: string | null;
  assigneeName?: string;
  labels?: string[];
  boardId: string;
  columnId: string;
  order: number;
}

interface UpdateTaskInput {
  id: string;
  title: string;
  description: string;
  priority: Task['priority'];
  dueDate?: string | null;
  assigneeName?: string;
  labels?: string[];
  columnId: string;
}

const mapTask = (task: ApiTask): Task => ({
  ...task,
  id: task._id,
});

const columnToStatus = (columnId: string): Task['status'] => {
  switch (columnId) {
    case 'inprogress':
      return 'inprogress';
    case 'done':
      return 'done';
    default:
      return 'todo';
  }
};

const reorderTasks = (
  tasks: Task[],
  taskId: string,
  destinationColumnId: string,
  destinationIndex: number
) => {
  const movingTask = tasks.find((task) => task.id === taskId);
  if (!movingTask) {
    return tasks;
  }

  const sourceColumnTasks = tasks
    .filter((task) => task.columnId === movingTask.columnId && task.id !== taskId)
    .sort((firstTask, secondTask) => firstTask.order - secondTask.order);

  const targetColumnTasks =
    movingTask.columnId === destinationColumnId
      ? [...sourceColumnTasks]
      : tasks
          .filter((task) => task.columnId === destinationColumnId && task.id !== taskId)
          .sort((firstTask, secondTask) => firstTask.order - secondTask.order);

  const movedTask: Task = {
    ...movingTask,
    columnId: destinationColumnId,
    status: columnToStatus(destinationColumnId),
  };

  const boundedIndex = Math.max(0, Math.min(destinationIndex, targetColumnTasks.length));
  targetColumnTasks.splice(boundedIndex, 0, movedTask);

  const reorderedSourceTasks =
    movingTask.columnId === destinationColumnId ? targetColumnTasks : sourceColumnTasks;

  const sourceUpdates = reorderedSourceTasks.map((task, index) => ({
    ...task,
    order: index,
    columnId: movingTask.columnId === destinationColumnId ? destinationColumnId : task.columnId,
    status:
      movingTask.columnId === destinationColumnId
        ? columnToStatus(destinationColumnId)
        : task.status,
  }));

  const targetUpdates =
    movingTask.columnId === destinationColumnId
      ? sourceUpdates
      : targetColumnTasks.map((task, index) => ({
          ...task,
          order: index,
          columnId: destinationColumnId,
          status: columnToStatus(destinationColumnId),
        }));

  return tasks
    .filter(
      (task) =>
        task.columnId !== movingTask.columnId &&
        task.columnId !== destinationColumnId
    )
    .concat(
      movingTask.columnId === destinationColumnId ? sourceUpdates : [...sourceUpdates, ...targetUpdates]
    );
};

/**
 * Task data hook for board-scoped CRUD and optimistic drag-and-drop moves.
 * Orchestrates API calls while keeping Redux task state in sync.
 */
export const useTasks = (boardId: string | null) => {
  const dispatch = useDispatch<AppDispatch>();
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const user = useSelector((state: RootState) => state.auth.user);
  const [isLoading, setIsLoading] = useState(false);
  const inDemoMode = isDemoUser(user?.email);

  const persistDemoBoardTasks = (nextBoardTasks: Task[]) => {
    if (!boardId) return;
    const existingTasks = getDemoTasks();
    const otherBoardTasks = existingTasks.filter((task) => task.boardId !== boardId);
    setDemoTasks([...otherBoardTasks, ...nextBoardTasks]);
  };

  const fetchTasks = async () => {
    if (!boardId) return;
    setIsLoading(true);

    try {
      if (inDemoMode) {
        ensureDemoSeeded();
        const demoTasks = getDemoTasks()
          .filter((task) => task.boardId === boardId)
          .sort((firstTask, secondTask) => firstTask.order - secondTask.order);
        dispatch(setTasks(demoTasks));
        return;
      }

      const { data } = await client.get<ApiTask[]>(`/tasks?boardId=${boardId}`);
      dispatch(setTasks(data.map(mapTask)));
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (input: CreateTaskInput) => {
    if (inDemoMode) {
      const createdTask: Task = {
        id: createDemoId('demo-task'),
        title: input.title,
        description: input.description,
        priority: input.priority,
        dueDate: input.dueDate ?? null,
        assigneeName: input.assigneeName,
        labels: input.labels ?? [],
        boardId: input.boardId,
        columnId: input.columnId,
        order: input.order,
        status: columnToStatus(input.columnId),
      };
      const nextBoardTasks = [...tasks, createdTask];
      dispatch(addTaskAction(createdTask));
      persistDemoBoardTasks(nextBoardTasks);
      return createdTask;
    }

    const { data } = await client.post<ApiTask>('/tasks', {
      ...input,
      status: columnToStatus(input.columnId),
    });
    const createdTask = mapTask(data);
    dispatch(addTaskAction(createdTask));
    return createdTask;
  };

  const updateTask = async (input: UpdateTaskInput) => {
    if (inDemoMode) {
      const existingTask = tasks.find((task) => task.id === input.id);
      if (!existingTask) {
        throw new Error('Task not found');
      }

      const updatedTask: Task = {
        ...existingTask,
        ...input,
        status: columnToStatus(input.columnId),
        dueDate: input.dueDate ?? null,
      };

      const updatedBoardTasks = tasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      );
      dispatch(updateTaskAction(updatedTask));
      persistDemoBoardTasks(updatedBoardTasks);
      return updatedTask;
    }

    const { id, ...rest } = input;
    const { data } = await client.patch<ApiTask>(`/tasks/${id}`, {
      ...rest,
      status: columnToStatus(input.columnId),
    });
    const updatedTask = mapTask(data);
    dispatch(updateTaskAction(updatedTask));
    return updatedTask;
  };

  const deleteTask = async (id: string) => {
    if (inDemoMode) {
      const remainingTasks = tasks.filter((task) => task.id !== id);
      dispatch(deleteTaskAction(id));
      persistDemoBoardTasks(remainingTasks);
      return;
    }

    await client.delete(`/tasks/${id}`);
    dispatch(deleteTaskAction(id));
  };

  const moveTask = async (taskId: string, columnId: string, order: number) => {
    const existingTask = tasks.find((task) => task.id === taskId);
    if (!existingTask) {
      return;
    }

    const previousTasks = tasks;
    const reorderedTasks = reorderTasks(tasks, taskId, columnId, order);
    dispatch(moveTaskAction(reorderedTasks));

    if (inDemoMode) {
      persistDemoBoardTasks(reorderedTasks);
      return;
    }

    try {
      await client.patch(`/tasks/${taskId}/move`, {
        fromColumnId: existingTask.columnId,
        toColumnId: columnId,
        newOrder: order,
      });
    } catch (err) {
      console.error('Failed to move task', err);
      dispatch(moveTaskAction(previousTasks));
      void fetchTasks();
    }
  };

  useEffect(() => {
    const loadTasks = async () => {
      if (!boardId) return;
      setIsLoading(true);

      try {
        if (inDemoMode) {
          ensureDemoSeeded();
          const demoTasks = getDemoTasks()
            .filter((task) => task.boardId === boardId)
            .sort((firstTask, secondTask) => firstTask.order - secondTask.order);
          dispatch(setTasks(demoTasks));
          return;
        }

        const { data } = await client.get<ApiTask[]>(`/tasks?boardId=${boardId}`);
        dispatch(setTasks(data.map(mapTask)));
      } catch (err) {
        console.error('Failed to fetch tasks', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (boardId) {
      void loadTasks();
    } else {
      setIsLoading(false);
    }
  }, [boardId, dispatch, inDemoMode]);

  return { tasks, isLoading, fetchTasks, createTask, updateTask, deleteTask, moveTask };
};
