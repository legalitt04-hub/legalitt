// ─── API Client ────────────────────────────────────────────────────────────────
// Use local backend to avoid CORS issues from localhost:4000
const BASE_URL = 'http://localhost:5001/api/v1';

export function getToken()     { return localStorage.getItem('legalitt_admin_token'); }
export function setToken(t)    { localStorage.setItem('legalitt_admin_token', t); }
export function clearToken()   {
  localStorage.removeItem('legalitt_admin_token');
  localStorage.removeItem('legalitt_admin_user');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  if (res.status === 401) { clearToken(); window.location.reload(); throw new Error('Session expired'); }
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  // Dashboard
  getStats:               ()        => request('/admin/stats'),
  getRevenue:             (period)  => request(`/admin/revenue?period=${period}`),
  getActivity:            ()        => request('/admin/activity'),
  getHealth:              ()        => request('/admin/health'),
  getRecentRegistrations: ()        => request('/admin/recent-registrations'),
  getLogs:                (page=1)  => request(`/admin/logs?page=${page}&limit=40`),

  // Earnings
  getPlatformEarnings:    ()  => request('/admin/earnings'),
  getAdvocateEarnings:    (id)=> request(`/admin/advocates/${id}/earnings`),

  // Users
  getUsers: (params={}) => {
    const q = new URLSearchParams(Object.fromEntries(Object.entries({ page:1, limit:20, ...params }).filter(([,v])=>v!==undefined&&v!==''))).toString();
    return request(`/admin/users?${q}`);
  },
  getUserDetail:  (id)          => request(`/admin/users/${id}`),
  toggleUser:     (id, reason)  => request(`/admin/users/${id}/toggle`, { method:'PATCH', body: JSON.stringify({ reason }) }),

  // Advocates
  getAdvocates: (params={}) => {
    const q = new URLSearchParams(Object.fromEntries(Object.entries({ page:1, limit:20, ...params }).filter(([,v])=>v!==undefined&&v!==''))).toString();
    return request(`/admin/advocates?${q}`);
  },
  getAdvocateDetail: (id)              => request(`/admin/advocates/${id}`),
  verifyAdvocate:    (id, status, note)=> request(`/admin/advocates/${id}/verify`, { method:'PATCH', body: JSON.stringify({ status, note }) }),

  // Settings
  getSettings:       ()                => request('/admin/settings'),
  updateSettings:    (data)            => request('/admin/settings', { method:'PUT', body: JSON.stringify(data) }),
};
