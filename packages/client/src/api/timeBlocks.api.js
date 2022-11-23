import axios from './axiosConfig';

export const update = (id, data) => axios.patch(`/time-blocks/${id}`, data);
