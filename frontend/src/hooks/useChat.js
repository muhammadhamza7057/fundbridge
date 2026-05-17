import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './useSocket';
import { useAuth } from '../context/AuthContext';

export const useChat = (chatId) => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Join chat room and load history
  useEffect(() => {
    if (!socket || !isConnected || !chatId || !user) return;

    setLoading(true);
    // ensure server knows who this socket belongs to (avoid race where chat:join arrives before user:join)
    try {
      const senderId = user._id || user.uid || user.id;
      socket.emit('user:join', senderId, user.name, user.role);
    } catch (e) {
      // ignore
    }
    socket.emit('chat:join', chatId);

    // Listen for chat history
    const handleChatHistory = (data) => {
      setMessages(data.messages || []);
      setParticipants(data.participants || []);
      setLoading(false);
    };

    // Listen for new messages
    const handleMessageReceived = (message) => {
      // ignore messages for other chats
      if (message.chatId && String(message.chatId) !== String(chatId)) return;
      setMessages((prev) => [...prev, message]);
    };

    // Listen for typing indicators
    const handleTypingIndicator = (data) => {
      if (data.isTyping) {
        setTypingUsers((prev) =>
          prev.find((u) => u.userId === data.userId)
            ? prev
            : [...prev, { userId: data.userId, userName: data.userName }]
        );
      } else {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      }
    };

    // Listen for online users
    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    // Listen for errors
    const handleChatError = (errorMsg) => {
      setError(errorMsg);
    };

    socket.on('chat:history', handleChatHistory);
    socket.on('message:received', handleMessageReceived);
    socket.on('typing:indicator', handleTypingIndicator);
    socket.on('users:online', handleOnlineUsers);
    socket.on('chat:error', handleChatError);

    return () => {
      socket.off('chat:history', handleChatHistory);
      socket.off('message:received', handleMessageReceived);
      socket.off('typing:indicator', handleTypingIndicator);
      socket.off('users:online', handleOnlineUsers);
      socket.off('chat:error', handleChatError);
    };
  }, [socket, isConnected, chatId, user]);

  // Send message
  const sendMessage = useCallback(
    (content, attachments = []) => {
      if (!socket || !isConnected || !chatId || !user) return;

      const senderId = user._id || user.uid || user.id;

      socket.emit('message:send', {
        chatId,
        content,
        senderId,
        attachments: Array.isArray(attachments) ? attachments : [],
      });
    },
    [socket, isConnected, chatId, user]
  );

  // Start typing
  const startTyping = useCallback(() => {
    if (!socket || !isConnected || !chatId) return;
    socket.emit('typing:start', chatId);
  }, [socket, isConnected, chatId]);

  // Stop typing
  const stopTyping = useCallback(() => {
    if (!socket || !isConnected || !chatId) return;
    socket.emit('typing:stop', chatId);
  }, [socket, isConnected, chatId]);

  return {
    messages,
    participants,
    onlineUsers,
    typingUsers,
    loading,
    error,
    sendMessage,
    startTyping,
    stopTyping,
    isConnected,
  };
};
