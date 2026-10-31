import api from './client';

export const createConversation = (data) => api.post('/conversations', data);
export const getConversations = () => api.get('/conversations');
export const getConversation = (id) => api.get(`/conversations/${id}`);