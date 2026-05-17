import api from './api';

export const listUsers = async (role) => {
  const url = role ? `/api/users?role=${encodeURIComponent(role)}` : '/api/users';
  const res = await api.get(url);
  return res.data;
};
