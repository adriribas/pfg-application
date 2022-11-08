import axios from './axiosConfig';
import { formatFilter } from './apiUtil.js';

export const get = (abv, params) => axios.get(`/studies/${abv}`, { params });

export const list = ({ params, filterData, associations } = {}) =>
  axios.post('/studies/filter', formatFilter(filterData, associations), { params });

export const create = studyData => axios.post('/studies', { ...studyData });

export const update = (abv, data) => axios.patch(`/studies/${abv}`, data);
