import mongoose, { Schema, Document } from 'mongoose';

export interface IColumn extends Document {
  _id: mongoose.Types.ObjectId;
  boardId: mongoose.Types.ObjectId;
  title: string;
  order: number;
  limit?: number;
  createdAt: Date;
  updatedAt: Date;
}

const columnSchema = new Schema<IColumn>(
  {
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    limit: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export const Column = mongoose.model<IColumn>('Column', columnSchema);
