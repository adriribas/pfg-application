import axios from './axiosConfig';

export const logIn = (email, password) => axios.post('/auth', { email, secret: password });

export const getCurrentUser = () => axios.get('/auth/current-user');

export const assertAccess = view => axios.get(`/auth/access/${view}`);

export const resetPassword = email => axios.post('auth/reset-password', { email });

export const newPassword = (token, password) => axios.post('/auth/new-password', { token, secret: password });
