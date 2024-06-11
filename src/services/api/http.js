import axios from 'axios';
import env from '@/utils/env';
import ConfigStore from '@/store/modules/config';

//import CustomError from './customError'; //TODO: Apply custom error to failed requests

const client = axios.create({
  baseURL: `${env('VITE_INSIGHTS_API_URL')}/v1`,
});

client.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${ConfigStore.state.token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject(error.response);
  },
);

export default client;
