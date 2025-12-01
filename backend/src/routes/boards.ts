import { Router, Response } from 'express';
import { AuthRequest, authenticateJWT } from '../middleware/auth';
import { Project } from '../models/Project';
import { getIO } from '../socket/io';
import { checkProjectPermission } from '../middleware/permissions';

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /projects/{projectId}/boards:
 *   post:
 *     summary: Cria um novo board no projeto
 *     tags: [Boards]
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Board criado com sucesso
 *       400:
 *         description: Nome do board é obrigatório
 *       403:
 *         description: Sem permissão (requer canEdit)
 *       404:
 *         description: Projeto não encontrado
 */
// POST /projects/:projectId/boards - Create board
router.post(
  '/',
  authenticateJWT,
  checkProjectPermission('canEdit'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { projectId } = req.params;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Board name is required' });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const newBoard = {
        _id: new (require('mongoose').Types.ObjectId)(),
        name,
        columns: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      project.boards.push(newBoard);
      await project.save();

      // Emit socket event
      getIO().to(`project:${projectId}`).emit('board:created', newBoard);

      res.status(201).json(newBoard);
    } catch (error) {
      console.error('Error creating board:', error);
      res.status(500).json({ error: 'Failed to create board' });
    }
  }
);

/**
 * @swagger
 * /projects/{projectId}/boards:
 *   get:
 *     summary: Lista todos os boards do projeto
 *     tags: [Boards]
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
 *         description: Lista de boards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       403:
 *         description: Sem permissão (requer canView)
 *       404:
 *         description: Projeto não encontrado
 */
// GET /projects/:projectId/boards - Get all boards
router.get(
  '/',
  authenticateJWT,
  checkProjectPermission('canView'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { projectId } = req.params;

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(project.boards);
    } catch (error) {
      console.error('Error fetching boards:', error);
      res.status(500).json({ error: 'Failed to fetch boards' });
    }
  }
);

export default router;
