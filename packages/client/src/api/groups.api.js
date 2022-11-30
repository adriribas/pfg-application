import axios from './axiosConfig';

export const update = (id, data) => axios.patch(`/groups/${id}`, data);
