import mongoose, { Schema, Document } from 'mongoose';

export interface IBoard extends Document {
  name: string;
  columns: string[];
  userId: mongoose.Types.ObjectId;
}

const BoardSchema: Schema = new Schema({
  name: { type: String, required: true },
  columns: { type: [String], default: ['To Do', 'In Progress', 'Done'] },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const Board = mongoose.model<IBoard>('Board', BoardSchema);
