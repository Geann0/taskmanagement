import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { Project } from '../models/Project';

export type ProjectRole = 'owner' | 'admin' | 'editor' | 'commenter' | 'viewer';

interface RolePermissions {
  canEdit: boolean;
  canDelete: boolean;
  canComment: boolean;
  canView: boolean;
  canManageMembers: boolean;
  canManageProject: boolean;
}

const rolePermissions: Record<ProjectRole, RolePermissions> = {
  owner: {
    canEdit: true,
    canDelete: true,
    canComment: true,
    canView: true,
    canManageMembers: true,
    canManageProject: true,
  },
  admin: {
    canEdit: true,
    canDelete: true,
    canComment: true,
    canView: true,
    canManageMembers: true,
    canManageProject: false,
  },
  editor: {
    canEdit: true,
    canDelete: false,
    canComment: true,
    canView: true,
    canManageMembers: false,
    canManageProject: false,
  },
  commenter: {
    canEdit: false,
    canDelete: false,
    canComment: true,
    canView: true,
    canManageMembers: false,
    canManageProject: false,
  },
  viewer: {
    canEdit: false,
    canDelete: false,
    canComment: false,
    canView: true,
    canManageMembers: false,
    canManageProject: false,
  },
};

export const checkProjectPermission = (requiredPermission: keyof RolePermissions) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.params;

      if (!projectId) {
        return res.status(400).json({ error: 'Project ID required' });
      }

      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const member = project.members.find((m) => m.userId.toString() === req.userId);

      if (!member) {
        return res.status(403).json({ error: 'Not a project member' });
      }

      const permissions = rolePermissions[member.role];

      if (!permissions[requiredPermission]) {
        return res.status(403).json({
          error: `Insufficient permissions. Required: ${requiredPermission}`,
          yourRole: member.role,
        });
      }

      // Attach role and permissions to request for later use
      req.projectRole = member.role;
      req.projectPermissions = permissions;

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Middleware para verificar se é owner do projeto
export const requireProjectOwner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const member = project.members.find((m) => m.userId.toString() === req.userId);

    if (!member || member.role !== 'owner') {
      return res.status(403).json({
        error: 'Only project owner can perform this action',
      });
    }

    next();
  } catch (error) {
    console.error('Owner check error:', error);
    res.status(500).json({ error: 'Authorization check failed' });
  }
};
