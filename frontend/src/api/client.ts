import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

// Extend AxiosRequestConfig to include _retry flag
interface RetryAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Create Axios instance
const api = axios.create({
  baseURL: 'https://inventory-production-full.fly.dev/api/v1',
  withCredentials: true
});

// Request interceptor to add Authorization header
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 errors and token refresh
let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

// Function to process queued requests
function processQueue(token: string) {
  queue.forEach(cb => cb(token));
  queue = [];
}

// Response interceptor
api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config as RetryAxiosRequestConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise(resolve => {
          queue.push(token => {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;
// Attempt to refresh token
      try {
        const res = await api.post('/auth/refresh');
        const newToken = res.data.accessToken;

        localStorage.setItem('access_token', newToken);
        processQueue(newToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);

      } catch (err) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return Promise.reject(err);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
