import axios from 'axios';
import { useConfig } from '@/store/modules/config';
import { moduleStorage } from '@/utils/storage';
import '@/utils/pinia-setup';
import qs from 'qs';
//import CustomError from './customError'; //TODO: Apply custom error to failed requests

function setupClient(baseURL) {
  const client = axios.create({
    baseURL,
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: 'repeat' }),
  });

  client.interceptors.request.use((config) => {
    const configStore = useConfig();

    const token = configStore?.token || moduleStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      return Promise.reject(error.response);
    },
  );

  return client;
}

export default setupClient;
