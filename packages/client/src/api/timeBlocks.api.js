import { useOverlappingStore } from '@/stores';

import axios from './axiosConfig';
import { idAdapter } from './apiUtil.js';

const transformId = id => `T${id}`;
const adaptId = idAdapter(id => {
  if (isNaN(id)) {
    return +id.substring(1);
  }

  return id;
});
const refreshOverlapping = () => {
  const overlappingStore = useOverlappingStore();

  overlappingStore.refreshLabTypesOverlapping();
};

export const create = async data => {
  const res = await axios.post('/time-blocks', data);

  if (res.data.id) {
    res.data.id = transformId(res.data.id);
  }

  return res;
};

export const update = async (id, data) => {
  const res = await axios.patch(`/time-blocks/${adaptId(id)}`, data);

  refreshOverlapping();
  if (res.data.id) {
    res.data.id = transformId(res.data.id);
  }

  return res;
};

export const remove = async id => {
  const res = await axios.delete(`/time-blocks/${adaptId(id)}`);

  refreshOverlapping();

  return res;
};
