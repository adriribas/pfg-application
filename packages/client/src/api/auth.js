import { mande, defaults } from 'mande';

const auth = mande('http://localhost:8000/api/auth');

export const login = authData => auth.post(authData);

export const setToken = token => (defaults.headers['X-auth-token'] = token);

export const clearToken = () => delete defaults.headers['X-auth-token'];
