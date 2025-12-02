import { Router } from 'express';
import { AuthRequest, authenticateJWT } from '../middleware/auth';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { Card } from '../models/Card';
import { GoogleCalendarService } from '../services/googleCalendar';

const router = Router({ mergeParams: true });

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
router.post('/sync', async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    console.log('Calendar sync request:', {
      projectId,
      userId: userId,
      reqUser: req.user,
    });

    // Verificar se o projeto existe e popular membros
    const project = await Project.findById(projectId).populate('members.userId', 'name email');
    if (!project) {
      console.log('Project not found:', projectId);
      return res.status(404).json({ message: 'Project not found' });
    }

    console.log(
      'Project members:',
      project.members.map((m: any) => ({
        userId: m.userId?._id ? m.userId._id.toString() : m.userId.toString(),
        role: m.role,
      }))
    );

    // Verificar se o usuário é membro do projeto
    const isMember = project.members.some((m: any) => {
      const memberUserId = m.userId?._id ? m.userId._id.toString() : m.userId.toString();
      return memberUserId === userId?.toString();
    });

    console.log('Is member check:', { isMember, userId: userId?.toString() });

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
    console.log('Searching for cards in project:', projectId);
    
    // Cards estão dentro do projeto como subdocumentos
    const allCards: any[] = [];
    for (const board of project.boards) {
      for (const column of board.columns) {
        for (const card of column.cards) {
          if (card.dueDate) {
            allCards.push({
              ...card.toObject(),
              boardId: board._id,
              columnId: column._id,
            });
          }
        }
      }
    }

    console.log('Cards found:', allCards.length);
    console.log('Cards with dates:', allCards.map(c => ({ id: c._id, title: c.title, dueDate: c.dueDate })));

    if (allCards.length === 0) {
      return res.json({
        message: 'No cards with due dates found in this project',
        eventsCreated: 0,
      });
    }

    // Criar eventos no Google Calendar
    let eventsCreated = 0;
    const errors: any[] = [];

    for (const card of allCards) {
      try {
        // Verificar se o card já tem um eventId (já foi sincronizado)
        if (card.calendarEventId) {
          continue;
        }

        const dueDate = new Date(card.dueDate!);
        
        // Formatar data como YYYY-MM-DD (sem hora para evitar problemas de timezone)
        const year = dueDate.getUTCFullYear();
        const month = String(dueDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(dueDate.getUTCDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        const event = {
          summary: `[Task] ${card.title}`,
          description: card.description || 'No description',
          start: {
            date: dateString, // Evento de dia inteiro sem hora específica
            timeZone: 'America/Sao_Paulo',
          },
          end: {
            date: dateString, // Mesmo dia (evento de dia inteiro)
            timeZone: 'America/Sao_Paulo',
          },
        };

        const eventId = await calendarService.createEvent(event);

        if (eventId) {
          // Salvar o eventId no card para referência futura
          const board = project.boards.id(card.boardId);
          const column = board?.columns.id(card.columnId);
          const cardToUpdate = column?.cards.id(card._id);
          
          if (cardToUpdate) {
            (cardToUpdate as any).calendarEventId = eventId;
            await project.save();
            eventsCreated++;
          }
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
      totalCards: allCards.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error syncing with Google Calendar:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
