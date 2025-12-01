import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(WS_URL, {
      auth: {
        token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.info('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.warn('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Project room management
  joinProject(projectId: string) {
    this.socket?.emit('joinProject', { projectId });
  }

  leaveProject(projectId: string) {
    this.socket?.emit('leaveProject', { projectId });
  }

  // Card events
  onCardCreated(callback: (data: any) => void) {
    this.socket?.on('cardCreated', callback);
  }

  onCardUpdated(callback: (data: any) => void) {
    this.socket?.on('cardUpdated', callback);
  }

  onCardMoved(callback: (data: any) => void) {
    this.socket?.on('cardMoved', callback);
  }

  emitCardMove(data: any) {
    this.socket?.emit('cardMove', data);
  }

  // Comment events
  onCommentCreated(callback: (data: any) => void) {
    this.socket?.on('commentCreated', callback);
  }

  // Cleanup
  offCardCreated() {
    this.socket?.off('cardCreated');
  }

  offCardUpdated() {
    this.socket?.off('cardUpdated');
  }

  offCardMoved() {
    this.socket?.off('cardMoved');
  }

  offCommentCreated() {
    this.socket?.off('commentCreated');
  }
}

export const socketService = new SocketService();
