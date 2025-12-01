import { Server as SocketIOServer } from 'socket.io';

// Socket.IO instance that will be set during server initialization
let io: SocketIOServer;

export const setIO = (ioInstance: SocketIOServer) => {
  io = ioInstance;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};
