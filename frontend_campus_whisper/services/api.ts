import axios from 'axios';

// In production the frontend is served by the backend on the same origin,
// so we use a relative path. In development Vite runs on a different port,
// so we point to the backend port (5002) on the same hostname.
const BACKEND_URL: string =
  (import.meta as any).env?.VITE_API_URL ||
  (import.meta.env.PROD
    ? ''  // same origin – relative path
    : `http://${window.location.hostname}:5002`);

const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cw_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authAPI = {
  register: (alias: string, passkey: string, frequency?: string) =>
    api.post('/auth/register', { alias, passkey, frequency }),
  login: (alias: string, passkey: string) =>
    api.post('/auth/login', { alias, passkey }),
  me: () => api.get('/auth/me'),
  updatePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/password', { currentPassword, newPassword }),
  deleteAccount: () => api.delete('/auth/account'),
  logout: () => api.post('/auth/logout'),
};

// Rooms
export const roomsAPI = {
  list: (category?: string, search?: string, page?: number, limit?: number) =>
    api.get('/rooms', { params: { category, search, page, limit } }),
  get: (id: string) => api.get(`/rooms/${id}`),
  create: (data: { name: string; description?: string; category?: string; tags?: string[]; isPrivate?: boolean; image?: string }) =>
    api.post('/rooms', data),
  update: (id: string, data: { name?: string; description?: string; category?: string; tags?: string[]; image?: string; isPrivate?: boolean }) =>
    api.put(`/rooms/${id}`, data),
  join: (id: string) => api.post(`/rooms/${id}/join`),
  leave: (id: string) => api.post(`/rooms/${id}/leave`),
  delete: (id: string) => api.delete(`/rooms/${id}`),
  addAdmin: (id: string, userId: string) => api.post(`/rooms/${id}/add-admin`, { userId }),
  removeAdmin: (id: string, userId: string) => api.post(`/rooms/${id}/remove-admin`, { userId }),
};

// Messages
export const messagesAPI = {
  get: (roomId: string, limit?: number, before?: string) =>
    api.get(`/messages/${roomId}`, { params: { limit, before } }),
  preview: (roomId: string) =>
    api.get(`/messages/${roomId}/preview`),
  send: (roomId: string, content: string, type?: string) =>
    api.post(`/messages/${roomId}`, { content, type }),
};

export default api;
