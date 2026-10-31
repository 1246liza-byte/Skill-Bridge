import api from './client';

export const createReview = (data) => api.post('/reviews', data);
export const getReviewsForUser = (userId) => api.get(`/reviews/user/${userId}`);