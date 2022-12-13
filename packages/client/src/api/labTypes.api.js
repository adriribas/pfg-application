import axios from './axiosConfig';
import { formatFilter } from './apiUtil.js';

export const get = name => axios.get(`/lab-types/${name}`);

export const list = ({ params, filterData, associations } = {}) =>
  axios.post('/lab-types/filter', formatFilter(filterData, associations), { params });

export const create = data => axios.post('/lab-types', data);

export const update = (name, data) => axios.patch(`/lab-types/${name}`, data);
