import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../services/api';

let socketInstance = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (socketInstance) {
      setSocket(socketInstance);
      setIsConnected(socketInstance.connected);
      return;
    }

    // Connect to the socket server (backend)
    const newSocket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socketInstance = newSocket;
    setSocket(newSocket);

    return () => {
      // Don't disconnect on unmount - keep the connection alive
    };
  }, []);

  return { socket, isConnected };
};
