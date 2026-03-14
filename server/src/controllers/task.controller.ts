import { Response } from 'express';
import { Task } from '../models/Task';
import { AuthRequest } from '../middleware/auth.middleware';

export const getTasks = async (req: AuthRequest, res: Response) => {
  const { boardId } = req.query;
  try {
    const tasks = await Task.find({ 
      userId: req.user?.id,
      boardId: boardId as string 
    }).sort({ order: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  const { title, description, status, priority, boardId, columnId, order } = req.body;
  try {
    const task = new Task({
      title,
      description,
      status,
      priority,
      boardId,
      columnId,
      order,
      userId: req.user?.id
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user?.id },
      updates,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const task = await Task.findOneAndDelete({ _id: id, userId: req.user?.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const moveTask = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { columnId, order } = req.body;
    try {
        const task = await Task.findOneAndUpdate(
            { _id: id, userId: req.user?.id },
            { columnId, order },
            { new: true }
        );
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
