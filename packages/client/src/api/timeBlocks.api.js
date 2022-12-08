import axios from './axiosConfig';

export const create = data => axios.post('/time-blocks', data);

export const update = (id, data) => axios.patch(`/time-blocks/${id}`, data);

export const remove = id => axios.delete(`/time-blocks/${id}`);
