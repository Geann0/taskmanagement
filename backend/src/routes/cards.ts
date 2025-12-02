import { Router, Response } from 'express';
import { AuthRequest, authenticateJWT } from '../middleware/auth';
import { Project } from '../models/Project';
import { getIO } from '../socket/io';
import { checkProjectPermission } from '../middleware/permissions';

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /projects/{projectId}/boards/{boardId}/columns/{columnId}/cards:
 *   post:
 *     summary: Cria um novo card na coluna
 *     tags: [Cards]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               order:
 *                 type: number
 *     responses:
 *       201:
 *         description: Card criado com sucesso
 *       400:
 *         description: Título do card é obrigatório
 *       403:
 *         description: Sem permissão (requer canEdit)
 *       404:
 *         description: Projeto, board ou coluna não encontrado
 */
// POST /projects/:projectId/boards/:boardId/columns/:columnId/cards - Create card
router.post(
  '/',
  authenticateJWT,
  checkProjectPermission('canEdit'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { projectId, boardId, columnId } = req.params;
      const { title, description, dueDate, order } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Card title is required' });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const board = project.boards.id(boardId);
      if (!board) {
        return res.status(404).json({ error: 'Board not found' });
      }

      const column = board.columns.id(columnId);
      if (!column) {
        return res.status(404).json({ error: 'Column not found' });
      }

      const newCard = {
        _id: new (require('mongoose').Types.ObjectId)(),
        title,
        description: description || '',
        dueDate: dueDate ? new Date(dueDate) : undefined,
        order: order ?? column.cards.length,
        assignees: [],
        tags: [],
        priority: 'medium',
        status: 'active',
        comments: [],
        activityLog: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      column.cards.push(newCard);
      await project.save();

      // Emit socket event
      getIO().to(`project:${projectId}`).emit('card:created', { boardId, columnId, card: newCard });

      res.status(201).json(newCard);
    } catch (error) {
      console.error('Error creating card:', error);
      res.status(500).json({ error: 'Failed to create card' });
    }
  }
);

/**
 * @swagger
 * /projects/{projectId}/boards/{boardId}/columns/{columnId}/cards/{cardId}:
 *   put:
 *     summary: Atualiza um card existente
 *     tags: [Cards]
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
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Card atualizado com sucesso
 *       403:
 *         description: Sem permissão (requer canEdit)
 *       404:
 *         description: Projeto, board, coluna ou card não encontrado
 */
// PUT /projects/:projectId/boards/:boardId/columns/:columnId/cards/:cardId
router.put(
  '/:cardId',
  authenticateJWT,
  checkProjectPermission('canEdit'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { projectId, boardId, columnId, cardId } = req.params;
      const { title, description, dueDate } = req.body;

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

      const card = (column.cards as any).id(cardId);
      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }

      if (title !== undefined) card.title = title;
      if (description !== undefined) card.description = description;
      if (dueDate !== undefined) card.dueDate = dueDate ? new Date(dueDate) : null;
      card.updatedAt = new Date();

      await project.save();

      // Emit socket event
      getIO().to(`project:${projectId}`).emit('card:updated', { boardId, columnId, card });

      res.json(card);
    } catch (error) {
      console.error('Error updating card:', error);
      res.status(500).json({ error: 'Failed to update card' });
    }
  }
);

/**
 * @swagger
 * /projects/{projectId}/boards/{boardId}/columns/{columnId}/cards/{cardId}:
 *   delete:
 *     summary: Deleta um card da coluna
 *     tags: [Cards]
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
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Card deletado com sucesso
 *       403:
 *         description: Sem permissão (requer canDelete)
 *       404:
 *         description: Projeto, board, coluna ou card não encontrado
 */
// DELETE /projects/:projectId/boards/:boardId/columns/:columnId/cards/:cardId
router.delete(
  '/:cardId',
  authenticateJWT,
  checkProjectPermission('canDelete'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { projectId, boardId, columnId, cardId } = req.params;

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

      const cardIndex = column.cards.findIndex((c: any) => c._id.toString() === cardId);
      if (cardIndex === -1) {
        return res.status(404).json({ error: 'Card not found' });
      }

      column.cards.splice(cardIndex, 1);
      await project.save();

      // Emit socket event
      getIO().to(`project:${projectId}`).emit('card:deleted', { boardId, columnId, cardId });

      res.json({ message: 'Card deleted' });
    } catch (error) {
      console.error('Error deleting card:', error);
      res.status(500).json({ error: 'Failed to delete card' });
    }
  }
);

/**
 * @swagger
 * /projects/{projectId}/boards/{boardId}/cards/{cardId}/move:
 *   put:
 *     summary: Move um card entre colunas (drag-and-drop)
 *     tags: [Cards]
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
 *         name: cardId
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
 *               - sourceColumnId
 *               - targetColumnId
 *             properties:
 *               sourceColumnId:
 *                 type: string
 *               targetColumnId:
 *                 type: string
 *               newOrder:
 *                 type: number
 *     responses:
 *       200:
 *         description: Card movido com sucesso
 *       400:
 *         description: Parâmetros inválidos
 *       403:
 *         description: Sem permissão (requer canEdit)
 *       404:
 *         description: Projeto, board, coluna ou card não encontrado
 */
// PUT /projects/:projectId/boards/:boardId/cards/:cardId/move
router.put(
  '/:cardId/move',
  authenticateJWT,
  checkProjectPermission('canEdit'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { projectId, boardId, cardId } = req.params;
      const { sourceColumnId, targetColumnId, newOrder } = req.body;

      if (!sourceColumnId || !targetColumnId) {
        return res.status(400).json({ error: 'Source and target column IDs are required' });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const board = (project.boards as any).id(boardId);
      if (!board) {
        return res.status(404).json({ error: 'Board not found' });
      }

      const sourceColumn = (board.columns as any).id(sourceColumnId);
      if (!sourceColumn) {
        return res.status(404).json({ error: 'Source column not found' });
      }

      const targetColumn = (board.columns as any).id(targetColumnId);
      if (!targetColumn) {
        return res.status(404).json({ error: 'Target column not found' });
      }

      // Find and remove card from source column
      const cardIndex = sourceColumn.cards.findIndex((c: any) => c._id.toString() === cardId);
      if (cardIndex === -1) {
        return res.status(404).json({ error: 'Card not found in source column' });
      }

      const [movedCard] = sourceColumn.cards.splice(cardIndex, 1);

      // Add card to target column at the specified position
      const insertIndex =
        newOrder !== undefined
          ? Math.min(newOrder, targetColumn.cards.length)
          : targetColumn.cards.length;
      targetColumn.cards.splice(insertIndex, 0, movedCard);

      // Update order property for all cards in target column
      targetColumn.cards.forEach((card: any, index: number) => {
        card.order = index;
      });

      // If different columns, update source column card orders too
      if (sourceColumnId !== targetColumnId) {
        sourceColumn.cards.forEach((card: any, index: number) => {
          card.order = index;
        });
      }

      // Update timestamps
      movedCard.updatedAt = new Date();
      board.updatedAt = new Date();

      await project.save();

      // Emit socket event
      getIO().to(`project:${projectId}`).emit('card:moved', {
        boardId,
        cardId,
        sourceColumnId,
        targetColumnId,
        card: movedCard,
      });

      res.json({ message: 'Card moved successfully', card: movedCard });
    } catch (error) {
      console.error('Error moving card:', error);
      res.status(500).json({ error: 'Failed to move card' });
    }
  }
);

export default router;
