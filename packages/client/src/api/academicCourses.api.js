import axios from './axiosConfig';

const formatFilter = (filterData = {}, associations = {}) => ({ data: filterData, associations });

export const get = startYear => axios.get(`/academic-courses/${startYear}`);

export const list = ({ params, filterData, associations } = {}) =>
  axios.post('/academic-courses/filter', formatFilter(filterData, associations), params);

export const create = data => axios.post('/academic-courses', data);

export const update = (key, data) => axios.patch(`/academic-courses/${key}`, data);
