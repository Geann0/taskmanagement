import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyJWT } from '../utils/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const setupSocket = (io: SocketIOServer) => {
  // Middleware to authenticate socket connections
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = verifyJWT(token);
    if (!decoded || !(decoded as any).userId) {
      return next(new Error('Invalid token'));
    }

    socket.userId = (decoded as any).userId;
    next();
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.info(`User ${socket.userId} connected: ${socket.id}`);

    // Join project room
    socket.on('joinProject', (data: { projectId: string }) => {
      const room = `project:${data.projectId}`;
      socket.join(room);
      console.info(`User ${socket.userId} joined room ${room}`);
    });

    // Leave project room
    socket.on('leaveProject', (data: { projectId: string }) => {
      const room = `project:${data.projectId}`;
      socket.leave(room);
      console.info(`User ${socket.userId} left room ${room}`);
    });

    // Card events
    socket.on('cardCreate', (data: any) => {
      const room = `project:${data.projectId}`;
      io.to(room).emit('cardCreated', data);
    });

    socket.on('cardUpdate', (data: any) => {
      const room = `project:${data.projectId}`;
      io.to(room).emit('cardUpdated', data);
    });

    socket.on('cardMove', (data: any) => {
      const room = `project:${data.projectId}`;
      io.to(room).emit('cardMoved', data);
    });

    // Comment events
    socket.on('commentCreate', (data: any) => {
      const room = `project:${data.projectId}`;
      io.to(room).emit('commentCreated', data);
    });

    socket.on('disconnect', () => {
      console.info(`User ${socket.userId} disconnected: ${socket.id}`);
    });
  });
};
