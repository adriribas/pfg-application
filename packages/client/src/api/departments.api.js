import axios from './axiosConfig';
import { formatFilter } from './apiUtil.js';

export const get = abv => axios.get(`/departments/${abv}`);

export const list = ({ params, filterData, associations } = {}) =>
  axios.post('/departments/filter', formatFilter(filterData, associations), params);

export const update = (abv, data) => axios.patch(`/departments/${abv}`, data);
