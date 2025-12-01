import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Project } from '../models/Project';
import { memoryStore } from '../utils/memoryStore';
import mongoose from 'mongoose';
import { checkProjectPermission, requireProjectOwner } from '../middleware/permissions';

const router = Router();

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Lista todos os projetos do usuário
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de projetos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Não autenticado
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (isMongoConnected()) {
      const projects = await Project.find({
        'members.userId': req.userId,
      }).populate('members.userId', 'email name');
      res.json(projects);
    } else {
      // Use memory store
      const projects = memoryStore.getAllProjects(req.userId!);
      res.json(projects);
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Cria um novo projeto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
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
 *               description:
 *                 type: string
 *               visibility:
 *                 type: string
 *                 enum: [private, team, public]
 *     responses:
 *       201:
 *         description: Projeto criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, visibility } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (isMongoConnected()) {
      const project = new Project({
        name,
        description: description || '',
        visibility: visibility || 'private',
        members: [
          {
            userId: req.userId,
            role: 'owner',
          },
        ],
      });
      await project.save();
      res.status(201).json(project);
    } else {
      // Use memory store
      const project = {
        _id: Date.now().toString(),
        name,
        description: description || '',
        visibility: visibility || 'private',
        members: [{ userId: req.userId, role: 'owner' }],
        createdBy: req.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.saveProject(project._id, project);
      res.status(201).json(project);
    }
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

/**
 * @swagger
 * /projects/{projectId}:
 *   get:
 *     summary: Busca um projeto específico por ID
 *     tags: [Projects]
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
 *         description: Dados do projeto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       403:
 *         description: Sem permissão (requer canView)
 *       404:
 *         description: Projeto não encontrado
 */
// GET /projects/:projectId
router.get(
  '/:projectId',
  checkProjectPermission('canView'),
  async (req: AuthRequest, res: Response) => {
    try {
      const project = await Project.findById(req.params.projectId).populate(
        'members.userId',
        'email name avatarUrl'
      );

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(project);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  }
);

export default router;
