import { useOverlappingStore } from '@/stores';

import axios from './axiosConfig';

const refreshOverlapping = () => {
  const overlappingStore = useOverlappingStore();

  overlappingStore.refreshLabTypesOverlapping();
};

export const create = data => axios.post('/time-blocks', data);

export const update = async (id, data) => {
  const res = await axios.patch(`/time-blocks/${id}`, data);

  refreshOverlapping();

  return res;
};

export const remove = async id => {
  const res = await axios.delete(`/time-blocks/${id}`);

  refreshOverlapping();

  return res;
};
