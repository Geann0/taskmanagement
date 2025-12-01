export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface ProjectMember {
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'commenter' | 'viewer';
  joinedAt: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  visibility: 'private' | 'team' | 'public';
  members: ProjectMember[];
  boards?: Board[];
  settings: {
    enableCalendarSync: boolean;
    defaultAssignee?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  _id: string;
  projectId: string;
  name: string;
  columnsOrder: string[];
  columns?: Column[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  _id: string;
  boardId: string;
  name: string;
  title: string;
  order: number;
  limit?: number;
  cards?: Card[];
  createdAt: string;
  updatedAt: string;
}

export interface CardAttachment {
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface CardComment {
  authorId: string;
  body: string;
  createdAt: string;
}

export interface CardActivityLog {
  actorId: string;
  action: string;
  meta: any;
  createdAt: string;
}

export interface Card {
  _id: string;
  columnId: string;
  boardId: string;
  projectId: string;
  title: string;
  description: string;
  order: number;
  attachments: CardAttachment[];
  assignees: string[];
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  status: string;
  comments: CardComment[];
  activityLog: CardActivityLog[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: 'task_assigned' | 'task_moved' | 'comment' | 'calendar_event' | 'mention' | 'custom';
  payload: any;
  read: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
