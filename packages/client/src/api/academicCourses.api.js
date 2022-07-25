import axios from './axiosConfig';

export const getAll = () => axios.get('/academic-courses');
