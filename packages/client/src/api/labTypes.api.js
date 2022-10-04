import axios from './axiosConfig';
import { formatFilter } from './apiUtil.js';

export const get = name => axios.get(`/labTypes/${name}`);

export const list = ({ params, filterData, associations } = {}) =>
  axios.post('/labTypes/filter', formatFilter(filterData, associations), { params });

export const update = (name, data) => axios.patch(`/labTypes/${name}`, data);
