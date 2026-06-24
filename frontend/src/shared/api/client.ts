import axios from 'axios';
import { getCsrfToken } from '@/shared/utils/csrf';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() ?? '')) {
    const token = getCsrfToken();
    if (token) {
      config.headers['X-CSRFToken'] = token;
    }
  }
  return config;
});

export default apiClient;