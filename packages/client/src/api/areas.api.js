import axios from './axiosConfig';
import { formatFilter } from './apiUtil.js';

export const get = abv => axios.get(`/areas/${abv}`);

export const list = ({ params, filterData, associations } = {}) =>
  axios.post('/areas/filter', formatFilter(filterData, associations), params);
