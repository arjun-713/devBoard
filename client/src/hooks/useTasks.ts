import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setTasks, moveTask as moveTaskAction } from '@/store/slices/taskSlice';
import client from '@/api/client';

export const useTasks = (boardId: string | null) => {
  const dispatch = useDispatch<AppDispatch>();
  const tasks = useSelector((state: RootState) => state.tasks.tasks);

  const fetchTasks = async () => {
    if (!boardId) return;
    try {
      const { data } = await client.get(`/tasks?boardId=${boardId}`);
      // Simple transform from API _id to UI id
      const transformedTasks = data.map((t: any) => ({
        ...t,
        id: t._id
      }));
      dispatch(setTasks(transformedTasks));
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  };

  const moveTask = async (taskId: string, columnId: string, order: number) => {
    // Optimistic update
    dispatch(moveTaskAction({ taskId, columnId, order }));
    try {
      await client.patch(`/tasks/${taskId}/move`, { columnId, order });
    } catch (err) {
      console.error('Failed to move task', err);
      fetchTasks(); // Rollback
    }
  };

  useEffect(() => {
    if (boardId) fetchTasks();
  }, [boardId]);

  return { tasks, fetchTasks, moveTask };
};
