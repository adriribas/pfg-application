import axios from './axiosConfig';

const formatFilter = (filterData = {}, associations = {}) => ({ data: filterData, associations });

export const get = abv => axios.get(`/studies/${abv}`);

export const list = ({ params, filterData, associations } = {}) =>
  axios.post('/studies/filter', formatFilter(filterData, associations), params);

export const create = (studyData, academicCourse) => axios.post('/studies', { ...studyData, academicCourse });
