import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.API_URL || 'https://legalitt-api.onrender.com/api';

// Keys for secure storage
export const TOKEN_KEY = 'legalitt_access_token';
export const REFRESH_KEY = 'legalitt_refresh_token';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach access token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — auto refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(Promise.reject.bind(Promise));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefresh } = data.data;

        await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
        await SecureStore.setItemAsync(REFRESH_KEY, newRefresh);

        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear tokens and force logout
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_KEY);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleAuth: (idToken) => api.post('/auth/google', { idToken }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get('/auth/me'),
  updateFCMToken: (fcmToken) => api.patch('/auth/fcm-token', { fcmToken }),
};

// ─── Advocates ───────────────────────────────────────────────────────────────
export const advocateAPI = {
  getAll: (params) => api.get('/advocates', { params }),
  getNearby: (params) => api.get('/advocates/nearby', { params }),
  getOne: (id) => api.get(`/advocates/${id}`),
  getSpecializations: () => api.get('/advocates/specializations'),
  getCities: () => api.get('/advocates/cities'),
  getMyProfile: () => api.get('/advocates/me'),
  upsertProfile: (data) => api.post('/advocates/profile', data),
};

// ─── Bookings ────────────────────────────────────────────────────────────────
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  confirmPayment: (data) => api.post('/bookings/confirm-payment', data),
  getMy: (params) => api.get('/bookings/my', { params }),
  getAdvocate: (params) => api.get('/bookings/advocate', { params }),
  getOne: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, data) => api.patch(`/bookings/${id}/status`, data),
};

// ─── Chats ───────────────────────────────────────────────────────────────────
export const chatAPI = {
  getMyChats: () => api.get('/chats'),
  getMessages: (chatId, params) => api.get(`/chats/${chatId}/messages`, { params }),
  sendMessage: (chatId, data) => api.post(`/chats/${chatId}/messages`, data),
};

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const reviewAPI = {
  getByAdvocate: (advocateId, params) => api.get('/reviews', { params: { advocateId, ...params } }),
  create: (data) => api.post('/reviews', data),
};

// ─── Payments ────────────────────────────────────────────────────────────────
export const paymentAPI = {
  createOrder: (bookingId) => api.post('/payments/create-order', { bookingId }),
};

// ─── AI ──────────────────────────────────────────────────────────────────────
export const aiAPI = {
  legalAdvice: (question) => api.post('/ai/legal-advice', { question }),
  firDraft: (data) => api.post('/ai/fir-draft', data),
  chat: (messages) => api.post('/ai/chat', { messages }),
};

// ─── Uploads ─────────────────────────────────────────────────────────────────
export const uploadAPI = {
  avatar: (formData) => api.post('/uploads/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  document: (formData) => api.post('/uploads/document', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getPendingAdvocates: () => api.get('/admin/advocates/pending'),
  verifyAdvocate: (id, status) => api.patch(`/admin/advocates/${id}/verify`, { status }),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.patch(`/admin/users/${id}/toggle`),
};

export default api;
