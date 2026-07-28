import api from './api';

export const profileAPI = {
  getMe: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/profile', data),
  updateAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getCompleteness: () => api.get('/users/profile/completeness'),
  toggleSavedAdvocate: (advocateId) => api.post('/users/saved-advocates', { advocateId }),
  getSavedAdvocates: () => api.get('/users/saved-advocates'),
};

export default profileAPI;
