import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useSocket } from '@/configurations/SocketContext';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import {
  MoreVertical,
  Send,
  Paperclip
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MailDisplayProps {
  mail: {
    id: string;
    name: string;
  } | null;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  receiver?: string;
  timestamp: Date;
}

export function MailDisplay({ mail }: MailDisplayProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserIsTyping, setCurrentUserIsTyping] = useState(false);
  const { socket, isTyping } = useSocket();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch message history when conversation changes
  useEffect(() => {
    if (!mail?.id) return;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/messages/conversations/${mail.id}`,
          {
            headers: {
              'x-auth-token': token
            }
          }
        );

        // Transform the messages to match our local format
        const formattedMessages = response.data.map((msg: any) => ({
          id: msg._id,
          content: msg.content,
          sender: msg.sender,
          receiver: msg.receiver,
          timestamp: new Date(msg.createdAt)
        }));

        setMessages(formattedMessages);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [mail?.id]);

  // Set up socket listeners
  useEffect(() => {
    if (!socket || !mail?.id) return;

    // Listen for new messages
    const handleMessageReceived = (message: any) => {
      // Only add message if it's relevant to current conversation
      if (message.sender === mail.id || message.receiver === mail.id) {
        setMessages(prev => [...prev, {
          ...message,
          timestamp: new Date(message.timestamp)
        }]);
      }
    };

    // Listen for message confirmation
    const handleMessageSent = (message: any) => {
      // Add message to state if not already there
      setMessages(prev => {
        // Check if message already exists
        if (prev.some(msg => msg.id === message.id)) return prev;

        return [...prev, {
          ...message,
          timestamp: new Date(message.timestamp)
        }];
      });
    };

    // Listen for error messages
    const handleMessageError = (error: any) => {
      console.error('Message error:', error);
      // Could show an error toast here
    };

    socket.on('receive_message', handleMessageReceived);
    socket.on('message_sent', handleMessageSent);
    socket.on('message_error', handleMessageError);

    return () => {
      socket.off('receive_message', handleMessageReceived);
      socket.off('message_sent', handleMessageSent);
      socket.off('message_error', handleMessageError);
    };
  }, [socket, mail?.id]);

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !mail?.id) return;

    // Emit message to socket
    socket?.emit('send_message', {
      receiverId: mail.id,
      content: inputMessage
    });

    // Reset typing status
    handleStopTyping();

    // Clear input
    setInputMessage('');
  };

  // Handle typing indicators
  const handleTyping = () => {
    if (!currentUserIsTyping && mail?.id) {
      setCurrentUserIsTyping(true);
      socket?.emit('typing', { receiverId: mail.id, isTyping: true });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set a new timeout to indicate when user stops typing
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  };

  const handleStopTyping = () => {
    if (currentUserIsTyping && mail?.id) {
      setCurrentUserIsTyping(false);
      socket?.emit('typing', { receiverId: mail.id, isTyping: false });
    }
  };

  // Format message timestamp
  const formatTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Get authenticated user ID
  const currentUserId = (() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
    return null;
  })();

  return (
    <div className="flex h-full flex-col max-h-screen overflow-hidden">
      <div className="flex items-center p-3 border-b">
        {mail ? (
          <div className="flex items-start gap-4 text-sm">
            <Avatar>
              <AvatarImage alt={mail.name} />
              <AvatarFallback>
                {mail.name
                  .split(" ")
                  .map((chunk) => chunk[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <div className="font-semibold">{mail.name}</div>
              <div className="line-clamp-1 text-xs">
                {isTyping[mail.id] ? (
                  <span className="text-green-500">typing...</span>
                ) : (
                  <span>Online</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No conversation selected
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
        </div>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!mail}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Mute notifications</DropdownMenuItem>
            <DropdownMenuItem>Add to favorites</DropdownMenuItem>
            <DropdownMenuItem>View profile</DropdownMenuItem>
            <DropdownMenuItem>Block user</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      {mail ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === currentUserId ? 'justify-end' : 'justify-start'}`}>
                  {/* Message bubble */}
                  <div className={`max-w-[80%] rounded-lg px-4 py-2 ${message.sender === currentUserId ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                    <div>{message.content}</div>
                    <div className="text-xs opacity-70 mt-1">{formatTime(message.timestamp)}</div>
                  </div>
                </div>
              ))
            )}
            {isTyping[mail.id] && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                  <div className="flex space-x-1">
                    <span className="animate-bounce">•</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>•</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>•</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="border-t p-4 flex gap-2">
              <Textarea
                placeholder={`Message ${mail.name}...`}
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                onBlur={handleStopTyping}
                className="resize-none min-h-[3rem] max-h-[6rem]"
              />
              <div className="flex gap-1">
                <Button type="button" size="icon" variant="ghost">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button type="submit" size="icon" disabled={!inputMessage.trim()}>
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground flex-1 flex items-center justify-center">
          <div>
            <h3 className="text-lg font-medium">No conversation selected</h3>
            <p className="text-sm">Choose a conversation from the sidebar to start chatting</p>
          </div>
        </div>
      )}
    </div>
  );
}