import axios from './axiosConfig';

const formatFilter = (filterData = {}, associations = {}) => ({ data: filterData, associations });

export const get = name => axios.get(`/labTypes/${name}`);

export const list = ({ params, filterData, associations } = {}) =>
  axios.post('/labTypes/filter', formatFilter(filterData, associations), { params });

export const update = (name, data) => axios.patch(`/labTypes/${name}`, data);
