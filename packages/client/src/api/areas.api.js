import axios from './axiosConfig';

const formatFilter = (filterData = {}, associations = {}) => ({ data: filterData, associations });

export const get = abv => axios.get(`/areas/${abv}`);

export const list = ({ params, filterData, associations } = {}) =>
  axios.post('/areas/filter', formatFilter(filterData, associations), params);
