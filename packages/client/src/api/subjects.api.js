import axios from './axiosConfig';

const formatFilter = (filterData = {}, associations = {}) => ({ data: filterData, associations });

export const get = code => axios.get(`/subjects/${code}`);

export const list = ({ params, filterData, associations } = {}) =>
  axios.post('/subjects/filter', formatFilter(filterData, associations), { params });

export const update = (code, data) => axios.patch(`/subjects/${code}`, data);
