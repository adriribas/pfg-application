import axios from 'axios';

import { useAuthStore } from '@/stores';

const instance = axios.create({
  baseURL: 'http://192.168.1.37:8001/api'
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
