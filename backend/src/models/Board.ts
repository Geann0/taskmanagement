import mongoose, { Schema, Document } from 'mongoose';

export interface IBoard extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  name: string;
  columnsOrder: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const boardSchema = new Schema<IBoard>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    columnsOrder: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Column',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Board = mongoose.model<IBoard>('Board', boardSchema);
