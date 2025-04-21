import { Server, Socket } from 'socket.io';
import Message from '../models/MessageSchema'
import User from '../models/UserSchema';

// Define interface for authenticated socket
interface AuthenticatedSocket extends Socket {
  userId?: string;
}

// Map to track online users: { userId: socketId }
const onlineUsers = new Map<string, string>();

export default function(io: Server): void {
  const chatNamespace = io.of('/chat');
  
  chatNamespace.on('connection', (socket: AuthenticatedSocket) => {
    console.log('User connected to chat:', socket.id);
    
    // Authenticate user (assuming token is passed)
    socket.on('authenticate', async (userData: { userId: string }) => {
      try {
        // In a real app, verify JWT token here
        const userId = userData.userId;
        
        // Store user connection
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        
        // Notify others that user is online
        socket.broadcast.emit('user_status', { 
          userId: userId, 
          status: 'online' 
        });
        
        console.log('User authenticated:', userId);
      } catch (err) {
        console.error('Authentication error:', err);
      }
    });
    
    // Handle new message
    socket.on('send_message', async (messageData: { receiverId: string, content: string }) => {
      try {
        const { receiverId, content } = messageData;
        
        if (!socket.userId) {
          socket.emit('message_error', { error: 'Not authenticated' });
          return;
        }
        
        // Create a new message document
        const newMessage = new Message({
          sender: socket.userId,
          receiver: receiverId,
          content: content
        });
        
        // Save to database
        await newMessage.save();
        
        // Format for frontend display
        const messageToSend = {
          id: newMessage._id,
          content: newMessage.content,
          sender: newMessage.sender,
          receiver: newMessage.receiver,
          timestamp: newMessage.createdAt
        };
        
        // Send to recipient if online
        if (onlineUsers.has(receiverId)) {
          chatNamespace.to(onlineUsers.get(receiverId)!).emit('receive_message', messageToSend);
        }
        
        // Also send back to sender for confirmation
        socket.emit('message_sent', messageToSend);
        
      } catch (err) {
        console.error('Error sending message:', err);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });
    
    // Handle typing indicator
    socket.on('typing', ({ receiverId, isTyping }: { receiverId: string, isTyping: boolean }) => {
      if (!socket.userId) return;
      
      if (onlineUsers.has(receiverId)) {
        chatNamespace.to(onlineUsers.get(receiverId)!).emit('user_typing', {
          userId: socket.userId,
          isTyping: isTyping
        });
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        
        // Notify others user is offline
        socket.broadcast.emit('user_status', { 
          userId: socket.userId, 
          status: 'offline' 
        });
        
        console.log('User disconnected:', socket.userId);
      }
    });
  });
}