import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = (): Socket => {
  if (!socket) {
    socket = io('http://localhost:5000', {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket']
    });
    
    socket.on('connect', () => {
      console.log('Connected to socket server with ID:', socket?.id);
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }
  
  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};