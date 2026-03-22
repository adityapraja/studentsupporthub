import axios from 'axios';

const api = axios.create({
  baseURL: '/api' // Managed by Vite Proxy in dev
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use((response) => response, (error) => {
  if (error.response && error.response.status === 401) {
    // If not on an auth route, clear storage and trigger app logout
    if (!window.location.pathname.startsWith('/login') && 
        !window.location.pathname.startsWith('/register')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  }
  return Promise.reject(error);
});

export default api;
