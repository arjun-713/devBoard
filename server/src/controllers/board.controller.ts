import { Response } from 'express';
import { Board } from '../models/Board';
import { AuthRequest } from '../middleware/auth.middleware';

export const getBoards = async (req: AuthRequest, res: Response) => {
  try {
    const boards = await Board.find({ userId: req.user?.id });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createBoard = async (req: AuthRequest, res: Response) => {
  const { name, columns } = req.body;
  try {
    const board = new Board({
      name,
      columns: columns || ['To Do', 'In Progress', 'Done'],
      userId: req.user?.id
    });
    await board.save();
    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateBoard = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, columns } = req.body;
  try {
    const board = await Board.findOneAndUpdate(
      { _id: id, userId: req.user?.id },
      { name, columns },
      { new: true }
    );
    if (!board) return res.status(404).json({ message: 'Board not found' });
    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteBoard = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const board = await Board.findOneAndDelete({ _id: id, userId: req.user?.id });
    if (!board) return res.status(404).json({ message: 'Board not found' });
    res.json({ message: 'Board deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
