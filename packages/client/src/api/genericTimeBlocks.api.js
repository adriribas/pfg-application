import axios from './axiosConfig';
import { formatFilter } from './apiUtil.js';

// Ficar-li una g danvat de l'id als responses i treure-li als requests.

export const get = (id, params) => axios.get(`/generic-time-blocks/${id}`, { params });

export const list = ({ params, filterData, associations } = {}) =>
  axios.post('/generic-time-blocks/filter', formatFilter(filterData, associations), { params });

export const create = data => axios.post('/generic-time-blocks', data);

export const update = (id, data) => axios.patch(`/generic-time-blocks/${id}`, data);

export const remove = id => axios.delete(`/generic-time-blocks/${id}`);
