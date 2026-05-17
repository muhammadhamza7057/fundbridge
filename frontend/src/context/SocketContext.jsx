import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from '../hooks/useSocket';
import { getUnreadMap } from '../services/chatService';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [unreadMap, setUnreadMap] = useState({}); // { otherUserId: count }
  const [currentOpenChatId, setCurrentOpenChatId] = useState(null);

  // Join as user when connected and authenticated
  useEffect(() => {
    if (socket && isConnected && user) {
      const id = user._id || user.uid || user.id;
      socket.emit('user:join', id, user.name, user.role);
      console.log(`Socket: User ${id} joined`);

      // Fetch initial unread counts from server
      (async () => {
        try {
          const map = await getUnreadMap();
          setUnreadMap(map || {});
        } catch (e) {
          console.error('Failed to load unread map', e);
        }
      })();

      // Listen for global incoming messages to show unread counts/notifications
      const handleIncoming = (msg) => {
        try {
          const chatId = msg.chatId;
          const senderId = msg.sender?._id;
          if (!chatId || !senderId) return;
          // if the user is viewing this chat, ignore
          if (currentOpenChatId && String(currentOpenChatId) === String(chatId)) return;
          setUnreadMap((prev) => ({ ...(prev || {}), [senderId]: ((prev && prev[senderId]) || 0) + 1 }));
          // also optional: show browser notification or in-app toast
        } catch (e) {
          console.error('Error handling incoming message', e);
        }
      };

      const handleChatRead = async (data) => {
        try {
          // refresh unread map from server to stay consistent
          const map = await getUnreadMap();
          setUnreadMap(map || {});
        } catch (e) {
          console.error('Failed to refresh unread map on chat:read', e);
        }
      };

      socket.on('message:received', handleIncoming);
      socket.on('chat:read', handleChatRead);

      return () => {
        socket.off('message:received', handleIncoming);
        socket.off('chat:read', handleChatRead);
      };
    }
  }, [socket, isConnected, user]);

  const markChatReadForUser = (otherUserId) => {
    setUnreadMap((prev) => {
      if (!prev || !prev[otherUserId]) return prev || {};
      const next = { ...(prev || {}) };
      next[otherUserId] = 0;
      return next;
    });
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, unreadMap, setUnreadMap, currentOpenChatId, setCurrentOpenChatId, markChatReadForUser }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within SocketProvider');
  }
  return context;
}
