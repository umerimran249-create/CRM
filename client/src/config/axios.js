import axios from 'axios';

// Get API URL from environment variable
// In production, this MUST be set to your deployed backend URL
// In development, empty string uses proxy from package.json
const getApiUrl = () => {
  // If REACT_APP_API_URL is explicitly set, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // In development, use proxy (empty string = relative path)
  if (process.env.NODE_ENV === 'development') {
    return '';
  }
  
  // In production without REACT_APP_API_URL, this will fail
  // This helps catch configuration errors early
  console.error('⚠️ REACT_APP_API_URL is not set! API calls will fail.');
  return '';
};

const API_URL = getApiUrl();

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    // Try Firebase token first (for CORS bypass)
    const firebaseToken = localStorage.getItem('firebaseToken');
    if (firebaseToken) {
      config.headers.Authorization = `Bearer ${firebaseToken}`;
    } else {
      // Fallback to JWT token
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

