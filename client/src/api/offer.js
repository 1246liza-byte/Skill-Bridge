import api from './client';

export const createOffer = (data) => api.post('/hiring-offers', data);
export const acceptOffer = (id) => api.put(`/hiring-offers/${id}/accept`);
export const rejectOffer = (id) => api.put(`/hiring-offers/${id}/reject`);
export const withdrawOffer = (id) => api.put(`/hiring-offers/${id}/withdraw`);