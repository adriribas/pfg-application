import axios from './axiosConfig';

export const logIn = authData => axios.post('/auth', authData);

export const getCurrentUser = () => axios.get('/auth/current-user');

export const assertAccess = view => axios.get(`/auth/access/${view}`);
