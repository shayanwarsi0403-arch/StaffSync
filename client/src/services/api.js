import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const hadToken = !!localStorage.getItem('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const publicPaths = ['/login', '/register', '/'];
      if (hadToken && !publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login?sessionExpired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
