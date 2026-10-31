import api from './client';

export const getClientDashboard = () => api.get('/clients/dashboard/stats');
export const getMyClientProfile = () => api.get('/clients/profile/me');
export const updateClientProfile = (data) => api.put('/clients/profile/me', data);
export const saveStudent = (studentId) => api.put(`/clients/save-student/${studentId}`);
export const getSavedStudents = () => api.get('/clients/saved-students');
export const getMyProjects = () => api.get('/clients/projects/mine');
export const getProjectProposals = (projectId) => api.get(`/clients/projects/${projectId}/proposals`);
export const getMyOffers = () => api.get('/clients/offers/mine');
export const getMyHires = () => api.get('/clients/hires/mine');