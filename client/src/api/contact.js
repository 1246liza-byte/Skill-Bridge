import api from './client';

export const submitContact = (data) => api.post('/contact', data);
export const getContactMessages = () => api.get('/contact');
export const deleteContactMessage = (id) => api.delete(`/contact/${id}`);