import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';

export const setupSocket = (io: SocketIOServer) => {
  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    console.log(`✅ User connected: ${socket.id}`);

    // Join project room
    socket.on('join:project', (projectId: string) => {
      socket.join(`project:${projectId}`);
      // eslint-disable-next-line no-console
      console.log(`User ${socket.id} joined project ${projectId}`);
    });

    // Leave project room
    socket.on('leave:project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      // eslint-disable-next-line no-console
      console.log(`User ${socket.id} left project ${projectId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });
};

// Helper function to emit to project room
export const emitToProject = (io: SocketIOServer, projectId: string, event: string, data: any) => {
  io.to(`project:${projectId}`).emit(event, data);
};
