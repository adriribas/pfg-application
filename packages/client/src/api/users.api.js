import axios from './axiosConfig';
import { formatFilter } from './apiUtil.js';

const resource = 'users';

export const get = code => axios.get(`/${resource}/${code}`);

export const list = ({ params, filterData, associations } = {}) =>
  axios.post(`/${resource}/filter`, formatFilter(filterData, associations), { params });

export const create = data => axios.post(`/${resource}`, data);

export const update = (code, data) => axios.patch(`/${resource}/${code}`, data);
