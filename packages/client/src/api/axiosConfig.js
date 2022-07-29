import axios from 'axios';

import { useAuthStore } from '@/stores';

const instance = axios.create({
  baseURL: 'http://localhost:8001/api'
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

export default instance;
