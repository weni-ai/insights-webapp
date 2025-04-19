import axios from 'axios';
import env from '@/utils/env';
import ConfigStore from '@/store/modules/config';
import qs from 'qs';
//import CustomError from './customError'; //TODO: Apply custom error to failed requests

const client = axios.create({
  baseURL: `${env('INSIGHTS_API_URL')}/v1`,
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
});

client.interceptors.request.use((config) => {
  if (ConfigStore.state?.token) {
    config.headers.Authorization = `Bearer ${ConfigStore.state.token}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject(error.response);
  },
);

export default client;
