import { Response } from 'express';
import { Task } from '../models/Task';
import { AuthRequest } from '../middleware/auth.middleware';

const columnToStatus = (columnId: string) => {
  switch (columnId) {
    case 'inprogress':
      return 'inprogress';
    case 'done':
      return 'done';
    default:
      return 'todo';
  }
};

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
    if (typeof updates.columnId === 'string' && !updates.status) {
      updates.status = columnToStatus(updates.columnId);
    }

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
  const { fromColumnId, toColumnId, newOrder } = req.body as {
    fromColumnId?: string;
    toColumnId?: string;
    newOrder?: number;
  };

  if (typeof toColumnId !== 'string' || typeof newOrder !== 'number') {
    return res.status(400).json({ message: 'Invalid move payload' });
  }

  try {
    const task = await Task.findOne({ _id: id, userId: req.user?.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const sourceColumnId = fromColumnId ?? task.columnId;
    const targetColumnId = toColumnId;

    const sourceTasks = await Task.find({
      userId: req.user?.id,
      boardId: task.boardId,
      columnId: sourceColumnId,
      _id: { $ne: task._id },
    }).sort({ order: 1 });

    const targetTasks =
      sourceColumnId === targetColumnId
        ? sourceTasks
        : await Task.find({
            userId: req.user?.id,
            boardId: task.boardId,
            columnId: targetColumnId,
            _id: { $ne: task._id },
          }).sort({ order: 1 });

    const boundedOrder = Math.max(0, Math.min(newOrder, targetTasks.length));

    if (sourceColumnId === targetColumnId) {
      const reorderedTasks = [...sourceTasks];
      reorderedTasks.splice(boundedOrder, 0, task);

      await Promise.all(
        reorderedTasks.map((columnTask, index) =>
          Task.updateOne(
            { _id: columnTask._id, userId: req.user?.id },
            {
              columnId: targetColumnId,
              status: columnToStatus(targetColumnId),
              order: index,
            }
          )
        )
      );
    } else {
      const targetWithMovedTask = [...targetTasks];
      targetWithMovedTask.splice(boundedOrder, 0, task);

      await Promise.all([
        ...sourceTasks.map((columnTask, index) =>
          Task.updateOne(
            { _id: columnTask._id, userId: req.user?.id },
            { order: index }
          )
        ),
        ...targetWithMovedTask.map((columnTask, index) =>
          Task.updateOne(
            { _id: columnTask._id, userId: req.user?.id },
            {
              columnId: targetColumnId,
              status: columnToStatus(targetColumnId),
              order: index,
            }
          )
        ),
      ]);
    }

    const updatedTask = await Task.findOne({ _id: id, userId: req.user?.id });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
