import { Router, Response } from 'express';
import { AuthRequest, authenticateJWT } from '../middleware/auth';
import { Project } from '../models/Project';
import { getIO } from '../socket/io';
import { checkProjectPermission } from '../middleware/permissions';

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /projects/{projectId}/boards/{boardId}/columns:
 *   post:
 *     summary: Cria uma nova coluna no board
 *     tags: [Columns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: boardId
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
 *               order:
 *                 type: number
 *     responses:
 *       201:
 *         description: Coluna criada com sucesso
 *       400:
 *         description: Nome da coluna é obrigatório
 *       403:
 *         description: Sem permissão (requer canEdit)
 *       404:
 *         description: Projeto ou board não encontrado
 */
// POST /projects/:projectId/boards/:boardId/columns - Create column
router.post(
  '/',
  authenticateJWT,
  checkProjectPermission('canEdit'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { projectId, boardId } = req.params;
      const { name, order } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Column name is required' });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const board = project.boards.id(boardId);
      if (!board) {
        return res.status(404).json({ error: 'Board not found' });
      }

      const newColumn = {
        _id: new (require('mongoose').Types.ObjectId)(),
        name,
        order: order ?? board.columns.length,
        cards: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      board.columns.push(newColumn);
      await project.save();

      // Emit socket event
      getIO().to(`project:${projectId}`).emit('column:created', { boardId, column: newColumn });

      res.status(201).json(newColumn);
    } catch (error) {
      console.error('Error creating column:', error);
      res.status(500).json({ error: 'Failed to create column' });
    }
  }
);

/**
 * @swagger
 * /projects/{projectId}/boards/{boardId}/columns/{columnId}:
 *   delete:
 *     summary: Deleta uma coluna do board
 *     tags: [Columns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: columnId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coluna deletada com sucesso
 *       403:
 *         description: Sem permissão (requer canDelete)
 *       404:
 *         description: Projeto, board ou coluna não encontrado
 */
// DELETE /projects/:projectId/boards/:boardId/columns/:columnId
router.delete(
  '/:columnId',
  authenticateJWT,
  checkProjectPermission('canDelete'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { projectId, boardId, columnId } = req.params;

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const board = (project.boards as any).id(boardId);
      if (!board) {
        return res.status(404).json({ error: 'Board not found' });
      }

      const column = (board.columns as any).id(columnId);
      if (!column) {
        return res.status(404).json({ error: 'Column not found' });
      }

      column.deleteOne();
      await project.save();

      // Emit socket event
      getIO().to(`project:${projectId}`).emit('column:deleted', { boardId, columnId });

      res.json({ message: 'Column deleted' });
    } catch (error) {
      console.error('Error deleting column:', error);
      res.status(500).json({ error: 'Failed to delete column' });
    }
  }
);

export default router;
