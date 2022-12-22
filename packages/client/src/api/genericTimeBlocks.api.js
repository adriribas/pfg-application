import axios from './axiosConfig';
import { formatFilter, idAdapter } from './apiUtil.js';

const transformId = id => `G${id}`;
const adaptId = idAdapter(id => {
  if (isNaN(id)) {
    return +id.substring(1);
  }

  return id;
});

export const get = async (id, params) => {
  const res = await axios.get(`/generic-time-blocks/${adaptId(id)}`, { params });

  if (res.data.id) {
    res.data.id = transformId(res.data.id);
  }

  return res;
};

export const list = async ({ params, filterData, associations } = {}) => {
  const formattedFilter = formatFilter(filterData, associations);

  if (formattedFilter.data.id) {
    formattedFilter.data.id = adaptId(formattedFilter.data.id);
  }

  const res = await axios.post('/generic-time-blocks/filter', formattedFilter, { params });

  res.data.forEach(timeBlock => {
    if (timeBlock.id) {
      timeBlock.id = transformId(timeBlock.id);
    }
  });

  return res;
};

export const create = async data => {
  const res = await axios.post('/generic-time-blocks', data);

  if (res.data.id) {
    res.data.id = transformId(res.data.id);
  }

  return res;
};

export const update = async (id, data) => {
  const res = await axios.patch(`/generic-time-blocks/${adaptId(id)}`, data);

  if (res.data.id) {
    res.data.id = transformId(res.data.id);
  }

  return res;
};

export const remove = id => axios.delete(`/generic-time-blocks/${adaptId(id)}`);
