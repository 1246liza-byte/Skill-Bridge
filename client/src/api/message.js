import api from './client';

export const sendMessage = (conversationId, data) =>
    api.post('/messages', { ...data, conversationId });
export const getMessages = (conversationId) => api.get(`/messages/conversation/${conversationId}`);
export const markAsRead = (conversationId) => api.put(`/messages/read/${conversationId}`);