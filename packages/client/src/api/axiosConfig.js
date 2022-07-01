import axios from 'axios';

import { useAuthStore } from '@/stores';

const instance = axios.create({
  baseURL: 'http://localhost:8000/api'
});

instance.interceptors.request.use(config => {
  const token = useAuthStore().authToken;
  if (!token) {
    delete config.headers['X-auth-token'];
  } else {
    config.headers['X-auth-token'] = token;
  }
  return config;
});

export default instance;
