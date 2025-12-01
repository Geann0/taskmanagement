import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICard {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  order: number;
  assignees?: mongoose.Types.ObjectId[];
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  status?: 'active' | 'archived';
  attachments?: string[];
  comments?: any[];
  activityLog?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IColumn extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  order: number;
  cards: Types.DocumentArray<ICard>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBoard extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  columns: Types.DocumentArray<IColumn>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  visibility: 'private' | 'team' | 'public';
  boards: Types.DocumentArray<IBoard>;
  members: Array<{
    userId: mongoose.Types.ObjectId;
    role: 'owner' | 'admin' | 'editor' | 'commenter' | 'viewer';
    joinedAt: Date;
  }>;
  settings: {
    enableCalendarSync: boolean;
    defaultAssignee?: mongoose.Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const cardSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  order: { type: Number, default: 0 },
  assignees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  tags: [{ type: String }],
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: { type: Date },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  attachments: [{ type: String }],
  comments: [{ type: Schema.Types.Mixed }],
  activityLog: [{ type: Schema.Types.Mixed }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const columnSchema = new Schema({
  name: { type: String, required: true },
  order: { type: Number, default: 0 },
  cards: [cardSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const boardSchema = new Schema({
  name: { type: String, required: true },
  columns: [columnSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    visibility: {
      type: String,
      enum: ['private', 'team', 'public'],
      default: 'private',
    },
    boards: [boardSchema],
    members: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['owner', 'admin', 'editor', 'commenter', 'viewer'],
          default: 'viewer',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    settings: {
      enableCalendarSync: {
        type: Boolean,
        default: false,
      },
      defaultAssignee: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Project = mongoose.model<IProject>('Project', projectSchema);
