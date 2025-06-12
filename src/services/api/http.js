import axios from 'axios';
import env from '@/utils/env';
import { useConfig } from '@/store/modules/config';
import '@/utils/pinia-setup';
import qs from 'qs';
//import CustomError from './customError'; //TODO: Apply custom error to failed requests

const client = axios.create({
  baseURL: `${env('INSIGHTS_API_URL')}/v1`,
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
});

client.interceptors.request.use((config) => {
  const configStore = useConfig();
  if (configStore?.token) {
    config.headers.Authorization = `Bearer ${configStore.token}`;
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
