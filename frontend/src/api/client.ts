import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle 401 Unauthorized errors (expired/invalid tokens)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid tokens so subsequent public requests don't fail
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // Optional: dispatch a custom event if you want the auth context to update immediately
      window.dispatchEvent(new Event('auth-token-expired'));
    }
    return Promise.reject(error);
  }
);

export default client;
