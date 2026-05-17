import api from './api';

export const createDeal = async (payload) => {
  const res = await api.post('/api/deal/create', payload);
  return res.data;
};

export const updateDeal = async (id, updates) => {
  // prefer PATCH /update/:id
  const res = await api.patch(`/api/deal/update/${id}`, updates);
  return res.data;
};

export const getDeal = async (id) => {
  const res = await api.get(`/api/deal/${id}`);
  return res.data;
};

export const listDeals = async () => {
  const res = await api.get('/api/deal');
  return res.data;
};

export default { createDeal, updateDeal, getDeal };
