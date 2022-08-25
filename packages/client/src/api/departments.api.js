import axios from './axiosConfig';

const formatFilter = (filterData = {}, associations = {}) => ({ data: filterData, associations });

export const get = abv => axios.get(`/departments/${abv}`);

export const list = ({ params, filterData, associations } = {}) =>
  axios.post('/departments/filter', formatFilter(filterData, associations), params);
