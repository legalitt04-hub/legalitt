import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Attach token on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('legalitt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.message || 'Something went wrong';
    if (err.response?.status === 401) {
      localStorage.removeItem('legalitt_token');
      localStorage.removeItem('legalitt_user');
      window.location.href = '/login';
    } else if (err.response?.status !== 404) {
      toast.error(msg);
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleAuth: (idToken) => api.post('/auth/google', { idToken }),
  sendOTP: (phone) => api.post('/auth/otp-send', { phone }),
  verifyOTP: (phone, otp, name) => api.post('/auth/otp-verify', { phone, otp, name }),
  getMe: () => api.get('/auth/me'),
};

// ── Advocates ─────────────────────────────────────────
export const advocateAPI = {
  getAll: (params) => api.get('/advocates', { params }),
  getNearby: (params) => api.get('/advocates/nearby', { params }),
  getById: (id) => api.get(`/advocates/${id}`),
  getSpecializations: () => api.get('/advocates/specializations'),
  getCities: () => api.get('/advocates/cities'),
};

// ── Reviews ───────────────────────────────────────────
export const reviewAPI = {
  add: (data) => api.post('/reviews', data),
  getForAdvocate: (advocateId) => api.get(`/reviews/${advocateId}`),
};

export default api;
