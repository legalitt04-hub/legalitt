import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://10.0.2.2:5001/api';

export const TOKEN_KEY = 'authToken';
export const REFRESH_KEY = 'refreshToken';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_KEY);
      } catch (e) {
        console.log('Error clearing auth:', e);
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  googleAuth: (idToken) => api.post('/auth/google', { idToken }),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get('/auth/me'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  sendOTP: (phone) => api.post('/auth/send-otp', { phone }),
  verifyOTP: (phone, otp) => api.post('/auth/verify-otp', { phone, otp }),
};

export const advocateAPI = {
  getAdvocates: (params) => api.get('/advocates', { params }),
  getNearby: (params) => api.get('/advocates/nearby', { params }),
  getAdvocate: (id) => api.get('/advocates/' + id),
  getSpecializations: () => api.get('/advocates/specializations'),
  getCities: () => api.get('/advocates/cities'),
  getMyProfile: () => api.get('/advocates/me'),
  upsertProfile: (data) => api.post('/advocates/profile', data),
};

export default api;
