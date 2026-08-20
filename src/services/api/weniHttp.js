import axios from 'axios';
import qs from 'qs';

import env from '@/utils/env';
import { moduleStorage } from '@/utils/storage';

const weniHttp = axios.create({
  baseURL: `${env('WENI_API_URL')}/v1`,
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
});

weniHttp.interceptors.request.use((config) => {
  const token = moduleStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

weniHttp.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error.response),
);

export default weniHttp;
