import axios from './axiosConfig';
import { formatFilter } from './apiUtil.js';

export const get = code => axios.get(`/subjects/${code}`);

export const list = ({ params, filterData, associations, specialOptions } = {}) =>
  axios.post('/subjects/filter', formatFilter(filterData, associations, specialOptions), { params });

export const update = (code, data) => axios.patch(`/subjects/${code}`, data);
