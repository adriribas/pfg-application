import axios from './axiosConfig';
import { formatFilter } from './apiUtil.js';

export const get = (id, params) => axios.get(`/generic-time-blocks/${id}`, { params });

export const list = ({ params, filterData, associations } = {}) =>
  axios.post('/generic-time-blocks/filter', formatFilter(filterData, associations), { params });

export const create = data => axios.create('/generic-time-blocks', data);

export const update = (id, data) => axios.patch(`/generic-time-blocks/${id}`, data);
