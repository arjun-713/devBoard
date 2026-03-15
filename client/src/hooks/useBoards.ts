import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { setBoards, setActiveBoard } from '@/store/slices/boardSlice';
import type { Board } from '@/store/slices/boardSlice';
import client from '@/api/client';
import {
  createDemoId,
  ensureDemoSeeded,
  getDemoBoards,
  getDemoTasks,
  isDemoUser,
  setDemoBoards,
  setDemoTasks,
} from '@/data/demoData';

interface ApiBoard {
  _id: string;
  name: string;
  columns?: string[];
}

const selectBoardState = (state: RootState) => state.boards;

const defaultColumns = ['To Do', 'In Progress', 'Done'];

const mapBoard = (board: ApiBoard): Board => ({
  id: board._id,
  name: board.name,
  columns: board.columns ?? defaultColumns,
});

export const useBoards = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { boards, activeBoardId, loading, error } = useSelector(selectBoardState);
  const user = useSelector((state: RootState) => state.auth.user);
  const [isLoading, setIsLoading] = useState(true);
  const inDemoMode = isDemoUser(user?.email);

  const fetchBoards = async () => {
    setIsLoading(true);
    try {
      if (inDemoMode) {
        ensureDemoSeeded();
        const demoBoards = getDemoBoards();
        dispatch(setBoards(demoBoards));
        if (demoBoards.length > 0 && !activeBoardId) {
          dispatch(setActiveBoard(demoBoards[0].id));
        }
        return;
      }

      const { data } = await client.get<ApiBoard[]>('/boards');
      const transformedBoards = data.map(mapBoard);

      dispatch(setBoards(transformedBoards));

      if (transformedBoards.length > 0 && !activeBoardId) {
        dispatch(setActiveBoard(transformedBoards[0].id));
      }
    } catch (fetchError) {
      console.error('Failed to fetch boards', fetchError);
    } finally {
      setIsLoading(false);
    }
  };

  const createBoard = async (name: string) => {
    if (inDemoMode) {
      const newBoard: Board = {
        id: createDemoId('demo-board'),
        name,
        columns: defaultColumns,
      };
      const updatedBoards = [...boards, newBoard];
      setDemoBoards(updatedBoards);
      dispatch(setBoards(updatedBoards));
      dispatch(setActiveBoard(newBoard.id));
      return newBoard;
    }

    const { data } = await client.post<ApiBoard>('/boards', {
      name,
      columns: defaultColumns,
    });
    const newBoard = mapBoard(data);
    dispatch(setBoards([...boards, newBoard]));
    dispatch(setActiveBoard(newBoard.id));
    return newBoard;
  };

  const updateBoard = async (id: string, name: string) => {
    const existingBoard = boards.find((board) => board.id === id);
    if (!existingBoard) {
      throw new Error('Board not found');
    }

    if (inDemoMode) {
      const updatedBoard: Board = { ...existingBoard, name };
      const updatedBoards = boards.map((board) =>
        board.id === updatedBoard.id ? updatedBoard : board
      );
      setDemoBoards(updatedBoards);
      dispatch(setBoards(updatedBoards));
      return updatedBoard;
    }

    const { data } = await client.put<ApiBoard>(`/boards/${id}`, {
      name,
      columns: existingBoard.columns,
    });

    const updatedBoard = mapBoard(data);
    const updatedBoards = boards.map((board) =>
      board.id === updatedBoard.id ? updatedBoard : board
    );
    dispatch(setBoards(updatedBoards));
    return updatedBoard;
  };

  const deleteBoard = async (id: string) => {
    if (inDemoMode) {
      const remainingBoards = boards.filter((board) => board.id !== id);
      setDemoBoards(remainingBoards);
      const remainingTasks = getDemoTasks().filter((task) => task.boardId !== id);
      setDemoTasks(remainingTasks);
      dispatch(setBoards(remainingBoards));
      if (activeBoardId === id) {
        if (remainingBoards.length > 0) {
          dispatch(setActiveBoard(remainingBoards[0].id));
        } else {
          dispatch(setActiveBoard(null));
        }
      }
      return;
    }

    await client.delete(`/boards/${id}`);
    const remainingBoards = boards.filter((board) => board.id !== id);
    dispatch(setBoards(remainingBoards));
    if (activeBoardId === id) {
      if (remainingBoards.length > 0) {
        dispatch(setActiveBoard(remainingBoards[0].id));
      } else {
        dispatch(setActiveBoard(null));
      }
    }
  };

  useEffect(() => {
    const loadBoards = async () => {
      setIsLoading(true);
      try {
        if (inDemoMode) {
          ensureDemoSeeded();
          const demoBoards = getDemoBoards();
          dispatch(setBoards(demoBoards));
          if (demoBoards.length > 0 && !activeBoardId) {
            dispatch(setActiveBoard(demoBoards[0].id));
          }
          return;
        }

        const { data } = await client.get<ApiBoard[]>('/boards');
        const transformedBoards = data.map(mapBoard);

        dispatch(setBoards(transformedBoards));

        if (transformedBoards.length > 0 && !activeBoardId) {
          dispatch(setActiveBoard(transformedBoards[0].id));
        }
      } catch (fetchError) {
        console.error('Failed to fetch boards', fetchError);
      } finally {
        setIsLoading(false);
      }
    };

    void loadBoards();
  }, [activeBoardId, dispatch, inDemoMode]);

  return {
    boards,
    activeBoardId,
    loading,
    error,
    isLoading,
    fetchBoards,
    createBoard,
    deleteBoard,
    updateBoard,
    setActiveBoard: (id: string | null) => dispatch(setActiveBoard(id)),
  };
};
