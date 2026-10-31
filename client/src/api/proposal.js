import api from './client';

export const createProposal = (data) => api.post('/proposals', data);
export const getProjectProposals = (projectId) => api.get(`/proposals/project/${projectId}`);
export const acceptProposal = (id) => api.put(`/proposals/${id}/accept`);
export const rejectProposal = (id) => api.put(`/proposals/${id}/reject`);
export const withdrawProposal = (id) => api.put(`/proposals/${id}/withdraw`);