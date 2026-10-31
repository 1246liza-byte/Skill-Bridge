import api from './client';

export const uploadImage = (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const getSiteSettings = () => api.get('/site-settings');
export const updateSiteSettings = (data) => api.put('/site-settings', data);
export const updateSiteSetting = (key, value) => api.put(`/site-settings/${key}`, { value });
export const getBanners = () => api.get('/banners');
export const createBanner = (data) => api.post('/banners', data);
export const updateBanner = (id, data) => api.put(`/banners/${id}`, data);
export const deleteBanner = (id) => api.delete(`/banners/${id}`);