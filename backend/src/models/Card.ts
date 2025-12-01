import mongoose, { Schema, Document } from 'mongoose';

export interface ICard extends Document {
  _id: mongoose.Types.ObjectId;
  columnId: mongoose.Types.ObjectId;
  boardId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  attachments: Array<{
    url: string;
    name: string;
    size: number;
    mimeType: string;
  }>;
  assignees: mongoose.Types.ObjectId[];
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  status: string;
  comments: Array<{
    authorId: mongoose.Types.ObjectId;
    body: string;
    createdAt: Date;
  }>;
  activityLog: Array<{
    actorId: mongoose.Types.ObjectId;
    action: string;
    meta: any;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const cardSchema = new Schema<ICard>(
  {
    columnId: {
      type: Schema.Types.ObjectId,
      ref: 'Column',
      required: true,
      index: true,
    },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    attachments: [
      {
        url: String,
        name: String,
        size: Number,
        mimeType: String,
      },
    ],
    assignees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    tags: [String],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    dueDate: Date,
    status: {
      type: String,
      default: 'open',
    },
    comments: [
      {
        authorId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        body: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    activityLog: [
      {
        actorId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        action: String,
        meta: Schema.Types.Mixed,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Card = mongoose.model<ICard>('Card', cardSchema);
