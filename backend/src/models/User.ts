import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  avatarUrl?: string;
  providers: Array<{
    provider: string;
    providerId: string;
    accessToken?: string;
    refreshToken?: string;
  }>;
  roles: Array<{
    projectId: mongoose.Types.ObjectId;
    role: 'owner' | 'admin' | 'editor' | 'commenter' | 'viewer';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
    },
    providers: [
      {
        provider: {
          type: String,
          enum: ['google', 'local'],
          required: true,
        },
        providerId: {
          type: String,
        },
        accessToken: {
          type: String,
        },
        refreshToken: {
          type: String,
        },
      },
    ],
    roles: [
      {
        projectId: {
          type: Schema.Types.ObjectId,
          ref: 'Project',
        },
        role: {
          type: String,
          enum: ['owner', 'admin', 'editor', 'commenter', 'viewer'],
          default: 'viewer',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', userSchema);
