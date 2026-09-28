import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/users/refreshToken') &&
      !originalRequest.url?.includes('/users/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => client(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await client.post('/users/refreshToken');
        processQueue(null);
        isRefreshing = false;
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;
        // Dispatch a custom event so AuthContext can clear state
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper to extract the backend `data` payload from the response envelope
export const extractData = (response) => response.data?.data;

// Helper to extract a user-friendly error message
export const extractError = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong'
  );
};

export default client;
