import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

import { connectDB } from './utils/db';
import { initializeRedis } from './utils/redis';
import { setupSocket } from './sockets/setup';
import { setIO } from './socket/io';
import { setupSwagger } from './config/swagger';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import boardRoutes from './routes/boards';
import columnRoutes from './routes/columns';
import cardRoutes from './routes/cards';
import memberRoutes from './routes/members';
import notificationRoutes from './routes/notifications';
import pdfRoutes from './routes/pdf';
import calendarRoutes from './routes/calendar';
import { errorHandler } from './middleware/errorHandler';
import { authenticateJWT } from './middleware/auth';

const app: Express = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
setupSwagger(app);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/projects/:projectId/calendar', authenticateJWT, calendarRoutes);
app.use('/projects', authenticateJWT, projectRoutes);
// Nested routes for boards, columns, and cards
app.use('/projects/:projectId/boards', authenticateJWT, boardRoutes);
app.use('/projects/:projectId/boards/:boardId/columns', authenticateJWT, columnRoutes);
app.use(
  '/projects/:projectId/boards/:boardId/columns/:columnId/cards',
  authenticateJWT,
  cardRoutes
);
// Card move route (without columnId in path)
app.use('/projects/:projectId/boards/:boardId/cards', authenticateJWT, cardRoutes);
app.use('/projects/:projectId/members', authenticateJWT, memberRoutes);
app.use('/projects/:projectId/export/pdf', authenticateJWT, pdfRoutes);
app.use('/notifications', authenticateJWT, notificationRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use(errorHandler);

// Setup Swagger documentation
setupSwagger(app);

// Initialize Socket.IO
setIO(io);
setupSocket(io);

// Initialize Database and Server
const startServer = async () => {
  try {
    // Try to connect to MongoDB (optional in dev mode)
    try {
      await connectDB();
      console.info('✅ Connected to MongoDB');
    } catch (dbError) {
      console.warn('⚠️  MongoDB not available - running without database');
      console.warn('   Install Docker and run: docker-compose up -d');
    }

    // Try to connect to Redis (optional in dev mode)
    try {
      await initializeRedis();
      console.info('✅ Connected to Redis');
    } catch (redisError) {
      console.warn('⚠️  Redis not available - running without cache');
    }

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.info(`🚀 Server running on port ${PORT}`);
      console.info(`📍 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app, server, io };
