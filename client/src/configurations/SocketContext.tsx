import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Define types for the context
interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  isTyping: { [userId: string]: boolean };
  userStatus: { [userId: string]: 'online' | 'offline' };
}

const SocketContext = createContext<SocketContextType>({ 
  socket: null, 
  connected: false,
  isTyping: {},
  userStatus: {}
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [isTyping, setIsTyping] = useState<{ [userId: string]: boolean }>({});
  const [userStatus, setUserStatus] = useState<{ [userId: string]: 'online' | 'offline' }>({});
  
  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/chat`, {
      autoConnect: true,
      withCredentials: true
    });
    
    // Setup event handlers
    socketInstance.on('connect', () => {
      console.log('Socket connected!');
      setConnected(true);
      
      // Get user from localStorage and authenticate
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.id) {
            socketInstance.emit('authenticate', { userId: user.id });
          }
        }
      } catch (err) {
        console.error('Error authenticating socket:', err);
      }
    });
    
    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });
    
    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setConnected(false);
    });
    
    // User typing indicators
    socketInstance.on('user_typing', ({ userId, isTyping: typing }) => {
      setIsTyping(prev => ({
        ...prev,
        [userId]: typing
      }));
    });
    
    // User online status
    socketInstance.on('user_status', ({ userId, status }) => {
      setUserStatus(prev => ({
        ...prev,
        [userId]: status
      }));
    });
    
    setSocket(socketInstance);
    
    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);
  
  return (
    <SocketContext.Provider value={{ socket, connected, isTyping, userStatus }}>
      {children}
    </SocketContext.Provider>
  );
};