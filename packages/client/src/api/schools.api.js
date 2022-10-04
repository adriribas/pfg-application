import axios from './axiosConfig';
import { formatFilter } from './apiUtil.js';

export const get = abv => axios.get(`/schools/${abv}`);

export const list = ({ params, filterData, associations } = {}) =>
  axios.post('/schools/filter', formatFilter(filterData, associations), params);

export const update = (key, data) => axios.patch(`/schools/${key}`, data);
