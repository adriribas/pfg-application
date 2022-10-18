import axios from './axiosConfig';
import { formatFilter } from './apiUtil.js';

const resource = 'users';

export const get = id => axios.get(`/${resource}/${id}`);

export const list = ({ params, filterData, associations } = {}) =>
  axios.post(`/${resource}/filter`, formatFilter(filterData, associations), { params });

export const create = data => axios.post(`/${resource}`, data);

export const update = (id, data) => axios.patch(`/${resource}/${id}`, data);

export const remove = id => axios.delete(`/${resource}/${id}`);
