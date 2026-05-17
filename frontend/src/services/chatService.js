import api from './api';

// Get user's chats
export const getUserChats = async () => {
  const response = await api.get('/api/chat');
  return response.data;
};

// Get a specific chat
export const getChat = async (chatId) => {
  const response = await api.get(`/api/chat/${chatId}`);
  return response.data;
};

// Create or get chat with another user
export const getOrCreateChat = async (otherUserId) => {
  const response = await api.post('/api/chat/create', { otherUserId });
  return response.data;
};

export const getUnreadMap = async () => {
  const response = await api.get('/api/chat/unread-map');
  return response.data;
};

export const uploadAttachment = async (chatId, file) => {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post(`/api/chat/${chatId}/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};
