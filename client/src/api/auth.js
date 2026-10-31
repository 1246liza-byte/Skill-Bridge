import api from './client';

export const registerStudent = (data) => api.post('/auth/register/student', data);
export const registerClient = (data) => api.post('/auth/register/client', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const forgotPassword = (data) => api.post('/auth/forgot-password', data);
export const resetPassword = (token, data) => api.put(`/auth/reset-password/${token}`, data);
export const changePassword = (data) => api.put('/auth/change-password', data);