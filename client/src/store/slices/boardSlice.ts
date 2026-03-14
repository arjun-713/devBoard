import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Board {
  id: string;
  name: string;
  columns: string[];
}

interface BoardState {
  boards: Board[];
  activeBoardId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: BoardState = {
  boards: [],
  activeBoardId: null,
  loading: false,
  error: null,
};

const boardSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setBoards: (state, action: PayloadAction<Board[]>) => {
      state.boards = action.payload;
    },
    setActiveBoard: (state, action: PayloadAction<string>) => {
      state.activeBoardId = action.payload;
    },
  },
});

export const { setBoards, setActiveBoard } = boardSlice.actions;
export default boardSlice.reducer;
