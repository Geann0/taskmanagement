import { Router } from 'express';
import { AuthRequest, authenticateJWT } from '../middleware/auth';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { Card } from '../models/Card';
import { GoogleCalendarService } from '../services/googleCalendar';

const router = Router();

/**
 * @swagger
 * /projects/{projectId}/calendar/sync:
 *   post:
 *     summary: Sincroniza cards com Google Calendar
 *     tags: [Calendar]
 *     description: Cria eventos no Google Calendar para todos os cards com dueDate
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do projeto
 *     responses:
 *       200:
 *         description: Sincronização concluída
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 eventsCreated:
 *                   type: number
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Não autorizado ou sem credenciais Google
 *       403:
 *         description: Sem permissão no projeto
 *       404:
 *         description: Projeto não encontrado
 */
router.post(
  '/projects/:projectId/calendar/sync',
  authenticateJWT,
  async (req: AuthRequest, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user?._id;

      // Verificar se o projeto existe
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Verificar se o usuário é membro do projeto
      const isMember = project.members.some((m: any) => m.userId.toString() === userId?.toString());
      if (!isMember) {
        return res.status(403).json({ message: 'You are not a member of this project' });
      }

      // Buscar credenciais Google do usuário
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const googleProvider = user.providers.find((p) => p.provider === 'google');
      if (!googleProvider || !googleProvider.accessToken || !googleProvider.refreshToken) {
        return res.status(401).json({
          message: 'Google Calendar not connected. Please authenticate with Google first.',
        });
      }

      // Inicializar serviço do Google Calendar
      const calendarService = new GoogleCalendarService(
        googleProvider.accessToken,
        googleProvider.refreshToken
      );

      // Buscar todos os cards do projeto com dueDate
      const cards = await Card.find({
        projectId: projectId,
        dueDate: { $exists: true, $ne: null },
      });

      if (cards.length === 0) {
        return res.json({
          message: 'No cards with due dates found in this project',
          eventsCreated: 0,
        });
      }

      // Criar eventos no Google Calendar
      let eventsCreated = 0;
      const errors: any[] = [];

      for (const card of cards) {
        try {
          // Verificar se o card já tem um eventId (já foi sincronizado)
          if ((card as any).calendarEventId) {
            continue;
          }

          const dueDate = new Date(card.dueDate!);
          
          // Criar evento com 1 hora de duração
          const startDateTime = dueDate.toISOString();
          const endDate = new Date(dueDate.getTime() + 60 * 60 * 1000); // +1 hora
          const endDateTime = endDate.toISOString();

          const event = {
            summary: `[Task] ${card.title}`,
            description: card.description || 'No description',
            start: {
              dateTime: startDateTime,
              timeZone: 'America/Sao_Paulo',
            },
            end: {
              dateTime: endDateTime,
              timeZone: 'America/Sao_Paulo',
            },
          };

          const eventId = await calendarService.createEvent(event);
          
          if (eventId) {
            // Salvar o eventId no card para referência futura
            (card as any).calendarEventId = eventId;
            await card.save();
            eventsCreated++;
          }
        } catch (error) {
          console.error(`Error creating event for card ${card._id}:`, error);
          errors.push({
            cardId: card._id,
            cardTitle: card.title,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      res.json({
        message: `Successfully synced ${eventsCreated} cards to Google Calendar`,
        eventsCreated,
        totalCards: cards.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      console.error('Error syncing with Google Calendar:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
