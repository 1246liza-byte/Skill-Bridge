import api from './client';

export const getStudentDashboard = () => api.get('/students/dashboard/stats');
export const getMyStudentProfile = () => api.get('/students/profile/me');
export const updateStudentProfile = (data) => api.put('/students/profile/me', data);
export const addPortfolio = (data) => api.post('/students/portfolio', data);
export const updatePortfolio = (id, data) => api.put(`/students/portfolio/${id}`, data);
export const deletePortfolio = (id) => api.delete(`/students/portfolio/${id}`);
export const getMyProposals = () => api.get('/students/proposals/mine');
export const getMyOffers = () => api.get('/students/offers/mine');
export const getMyHires = () => api.get('/students/hires/mine');
export const getPublicStudentProfile = (id) => api.get(`/students/${id}`);
export const getAllStudents = (params) => api.get('/students', { params });