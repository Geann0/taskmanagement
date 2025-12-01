import { Router, Response } from 'express';
import { AuthRequest, authenticateJWT } from '../middleware/auth';
import { Project } from '../models/Project';
import { checkProjectPermission, requireProjectOwner } from '../middleware/permissions';
import { User } from '../models/User';

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /projects/{projectId}/members:
 *   get:
 *     summary: Lista todos os membros do projeto
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de membros
 *       404:
 *         description: Projeto não encontrado
 */
router.get(
  '/',
  authenticateJWT,
  checkProjectPermission('canView'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { projectId } = req.params;

      const project = await Project.findById(projectId).populate(
        'members.userId',
        'email name avatarUrl'
      );

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(project.members);
    } catch (error) {
      console.error('Error fetching members:', error);
      res.status(500).json({ error: 'Failed to fetch members' });
    }
  }
);

/**
 * @swagger
 * /projects/{projectId}/members:
 *   post:
 *     summary: Adiciona um membro ao projeto
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, editor, commenter, viewer]
 *                 default: viewer
 *     responses:
 *       201:
 *         description: Membro adicionado
 *       400:
 *         description: Email obrigatório ou membro já existe
 *       404:
 *         description: Usuário não encontrado
 */
router.post(
  '/',
  authenticateJWT,
  checkProjectPermission('canManageMembers'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { projectId } = req.params;
      const { email, role = 'viewer' } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Validate role
      const validRoles = ['admin', 'editor', 'commenter', 'viewer'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if already member
      const existingMember = project.members.find(
        (m) => m.userId.toString() === user._id.toString()
      );

      if (existingMember) {
        return res.status(400).json({ error: 'User is already a member' });
      }

      project.members.push({
        userId: user._id,
        role,
        joinedAt: new Date(),
      });

      await project.save();

      const populatedProject = await Project.findById(projectId).populate(
        'members.userId',
        'email name avatarUrl'
      );

      res.status(201).json(populatedProject!.members);
    } catch (error) {
      console.error('Error adding member:', error);
      res.status(500).json({ error: 'Failed to add member' });
    }
  }
);

/**
 * @swagger
 * /projects/{projectId}/members/{memberId}:
 *   patch:
 *     summary: Atualiza o role de um membro
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, editor, commenter, viewer]
 *     responses:
 *       200:
 *         description: Role atualizado
 *       400:
 *         description: Role inválido
 *       404:
 *         description: Projeto ou membro não encontrado
 */
router.patch(
  '/:memberId',
  authenticateJWT,
  checkProjectPermission('canManageMembers'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { projectId, memberId } = req.params;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({ error: 'Role is required' });
      }

      // Validate role
      const validRoles = ['admin', 'editor', 'commenter', 'viewer'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const member = project.members.find((m) => m.userId.toString() === memberId);

      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }

      // Cannot change owner role
      if (member.role === 'owner') {
        return res.status(400).json({ error: 'Cannot change owner role' });
      }

      member.role = role;
      await project.save();

      const populatedProject = await Project.findById(projectId).populate(
        'members.userId',
        'email name avatarUrl'
      );
      res.json(populatedProject!.members);
    } catch (error) {
      console.error('Error updating member:', error);
      res.status(500).json({ error: 'Failed to update member' });
    }
  }
);

/**
 * @swagger
 * /projects/{projectId}/members/{memberId}:
 *   delete:
 *     summary: Remove um membro do projeto
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Membro removido
 *       400:
 *         description: Não é possível remover o owner
 *       404:
 *         description: Projeto ou membro não encontrado
 */
router.delete(
  '/:memberId',
  authenticateJWT,
  checkProjectPermission('canManageMembers'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { projectId, memberId } = req.params;

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const memberIndex = project.members.findIndex((m) => m.userId.toString() === memberId);

      if (memberIndex === -1) {
        return res.status(404).json({ error: 'Member not found' });
      }

      // Cannot remove owner
      if (project.members[memberIndex].role === 'owner') {
        return res.status(400).json({ error: 'Cannot remove project owner' });
      }

      project.members.splice(memberIndex, 1);
      await project.save();

      res.json({ message: 'Member removed successfully' });
    } catch (error) {
      console.error('Error removing member:', error);
      res.status(500).json({ error: 'Failed to remove member' });
    }
  }
);

/**
 * @swagger
 * /projects/{projectId}/members/transfer:
 *   post:
 *     summary: Transfere a propriedade do projeto (somente owner)
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newOwnerId
 *             properties:
 *               newOwnerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Propriedade transferida
 *       404:
 *         description: Projeto ou novo owner não encontrado
 */
router.post(
  '/transfer',
  authenticateJWT,
  requireProjectOwner,
  async (req: AuthRequest, res: Response) => {
    try {
      const { projectId } = req.params;
      const { newOwnerId } = req.body;

      if (!newOwnerId) {
        return res.status(400).json({ error: 'New owner ID is required' });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const newOwner = project.members.find((m) => m.userId.toString() === newOwnerId);
      if (!newOwner) {
        return res.status(404).json({ error: 'New owner not found in project members' });
      }

      const currentOwner = project.members.find((m) => m.userId.toString() === req.userId);
      if (currentOwner) {
        currentOwner.role = 'admin'; // Downgrade current owner to admin
      }

      newOwner.role = 'owner'; // Upgrade new owner
      await project.save();

      const populatedProject = await Project.findById(projectId).populate(
        'members.userId',
        'email name avatarUrl'
      );
      res.json(populatedProject!.members);
    } catch (error) {
      console.error('Error transferring ownership:', error);
      res.status(500).json({ error: 'Failed to transfer ownership' });
    }
  }
);

export default router;
