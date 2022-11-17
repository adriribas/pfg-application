import axios from 'axios';

import { useAuthStore } from '@/stores';

const instance = axios.create({
  baseURL: 'http://192.168.1.34:8001/api'
});

instance.interceptors.request.use(config => {
  const token = useAuthStore().authToken;
  if (!token) {
    delete config.headers['Authorization'];
  } else {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  response => response,
  error => {
    if (error.code !== 'ERR_NETWORK') {
      const {
        response: {
          status,
          data: { code }
        }
      } = error;

      if (
        (status === 400 && code === 'ERR_NOT_ACTIVE_USER') ||
        (status === 401 && code === 'ERR_DELETED_USER')
      ) {
        useAuthStore().logout();
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
