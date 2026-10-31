import api from './client';

export const getHire = (id) => api.get(`/hires/${id}`);
export const completeHire = (id) => api.put(`/hires/${id}/complete`);
export const cancelHire = (id) => api.put(`/hires/${id}/cancel`);