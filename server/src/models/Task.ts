import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  activity: Array<{
    action: string;
    actor: string;
    timestamp: Date;
  }>;
  title: string;
  description: string;
  status: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date | null;
  assigneeName: string;
  labels: string[];
  boardId: mongoose.Types.ObjectId;
  columnId: string;
  order: number;
  userId: mongoose.Types.ObjectId;
}

const TaskSchema: Schema = new Schema({
  activity: {
    type: [
      {
        action: { type: String, required: true },
        actor: { type: String, required: true },
        timestamp: { type: Date, required: true, default: Date.now },
      },
    ],
    default: [],
  },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['todo', 'inprogress', 'done'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  dueDate: { type: Date, default: null },
  assigneeName: { type: String, default: '' },
  labels: { type: [String], default: [] },
  boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
  columnId: { type: String, required: true },
  order: { type: Number, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
