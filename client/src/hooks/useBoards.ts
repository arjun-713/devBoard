```typescript
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  LogOut,
  Layout,
  Plus,
  Search,
  Bell,
  Settings,
  ChevronRight,
  Layers
} from 'lucide-react';
import { RootState, AppDispatch } from '@/store';
import { setBoards, setActiveBoard } from '@/store/slices/boardSlice';
import client from '@/api/client';

export const useBoards = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { boards, activeBoardId, loading, error } = useSelector((state: RootState) => state.auth.isAuthenticated ? state.boards : { boards: [], activeBoardId: null, loading: false, error: null });

  const fetchBoards = async () => {
    try {
      const { data } = await client.get('/boards');
      const transformedBoards = data.map((b: any) => ({
        ...b,
        id: b._id
      }));
      dispatch(setBoards(transformedBoards));
      if (transformedBoards.length > 0 && !activeBoardId) {
        dispatch(setActiveBoard(transformedBoards[0].id));
      }
    } catch (err) {
      console.error('Failed to fetch boards', err);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  return { boards, activeBoardId, loading, error, fetchBoards, setActiveBoard: (id: string) => dispatch(setActiveBoard(id)) };
};
