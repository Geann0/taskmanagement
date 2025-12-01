import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type ProjectRole = 'owner' | 'admin' | 'editor' | 'commenter' | 'viewer';

export interface RolePermissions {
  canEdit: boolean;
  canDelete: boolean;
  canComment: boolean;
  canView: boolean;
  canManageMembers: boolean;
  canManageProject: boolean;
}

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
  projectRole?: ProjectRole;
  projectPermissions?: RolePermissions;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = (decoded as any).userId;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.userId = (decoded as any).userId;
      req.user = decoded;
    } catch (error) {
      // Silent fail, continue as unauthenticated
    }
  }

  next();
};
