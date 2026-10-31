import api from './client';

export const getAdminDashboard = () => api.get('/admin/dashboard');
export const getUsers = (params) => api.get('/admin/users', { params });
export const getUser = (id) => api.get(`/admin/users/${id}`);
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const suspendUser = (id) => api.put(`/admin/users/${id}/suspend`);
export const restoreUser = (id) => api.put(`/admin/users/${id}/restore`);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const getAdminProjects = (params) => api.get('/admin/projects', { params });
export const updateAdminProject = (id, data) => api.put(`/admin/projects/${id}`, data);
export const deleteAdminProject = (id) => api.delete(`/admin/projects/${id}`);
export const getAdminProposals = () => api.get('/admin/proposals');
export const getAdminHires = () => api.get('/admin/hires');
export const getAuditLogs = () => api.get('/admin/audit-logs');