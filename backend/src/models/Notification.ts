import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'task_assigned' | 'task_moved' | 'comment' | 'calendar_event' | 'mention' | 'custom';
  payload: any;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['task_assigned', 'task_moved', 'comment', 'calendar_event', 'mention', 'custom'],
      required: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
