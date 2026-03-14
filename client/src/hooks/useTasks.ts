import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { setTasks, moveTask as moveTaskAction } from '@/store/slices/taskSlice';
import type { Task } from '@/store/slices/taskSlice';
import { addTask as addTaskAction, updateTask as updateTaskAction, deleteTask as deleteTaskAction } from '@/store/slices/taskSlice';
import client from '@/api/client';

interface ApiTask extends Omit<Task, 'id'> {
  _id: string;
}

interface CreateTaskInput {
  title: string;
  description: string;
  priority: Task['priority'];
  boardId: string;
  columnId: string;
  order: number;
}

interface UpdateTaskInput {
  id: string;
  title: string;
  description: string;
  priority: Task['priority'];
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

export const useTasks = (boardId: string | null) => {
  const dispatch = useDispatch<AppDispatch>();
  const tasks = useSelector((state: RootState) => state.tasks.tasks);

  const fetchTasks = async () => {
    if (!boardId) return;

    try {
      const { data } = await client.get<ApiTask[]>(`/tasks?boardId=${boardId}`);
      dispatch(setTasks(data.map(mapTask)));
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  };

  const createTask = async (input: CreateTaskInput) => {
    const { data } = await client.post<ApiTask>('/tasks', {
      ...input,
      status: columnToStatus(input.columnId),
    });
    const createdTask = mapTask(data);
    dispatch(addTaskAction(createdTask));
    return createdTask;
  };

  const updateTask = async (input: UpdateTaskInput) => {
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
    await client.delete(`/tasks/${id}`);
    dispatch(deleteTaskAction(id));
  };

  const moveTask = async (taskId: string, columnId: string, order: number) => {
    const existingTask = tasks.find((task) => task.id === taskId);
    if (!existingTask) {
      return;
    }

    const reorderedTasks = reorderTasks(tasks, taskId, columnId, order);
    dispatch(moveTaskAction(reorderedTasks));

    try {
      await client.patch(`/tasks/${taskId}/move`, {
        fromColumnId: existingTask.columnId,
        toColumnId: columnId,
        newOrder: order,
      });
    } catch (err) {
      console.error('Failed to move task', err);
      void fetchTasks(); // Rollback
    }
  };

  useEffect(() => {
    const loadTasks = async () => {
      if (!boardId) return;

      try {
        const { data } = await client.get<ApiTask[]>(`/tasks?boardId=${boardId}`);
        dispatch(setTasks(data.map(mapTask)));
      } catch (err) {
        console.error('Failed to fetch tasks', err);
      }
    };

    if (boardId) {
      void loadTasks();
    }
  }, [boardId, dispatch]);

  return { tasks, fetchTasks, createTask, updateTask, deleteTask, moveTask };
};
