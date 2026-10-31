import api from './client';

export const createReport = (data) => api.post('/reports', data);
export const getReports = () => api.get('/reports');
export const updateReportStatus = (id, data) => api.put(`/reports/${id}`, data);