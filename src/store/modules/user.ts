import { ref } from 'vue';
import { defineStore } from 'pinia';
import User from '@/services/api/resources/user';
import { registerStoreHMR } from '@/utils/hmr';

export const useUser = defineStore('user', () => {
  const email = ref('');
  const isViewerPermission = ref(false);

  const setEmail = (value: string) => {
    email.value = value;
  };

  const verifyIsViewerPermission = async () => {
    const response = await User.verifyIsViewerPermission();
    isViewerPermission.value = response;
  };

  return { email, isViewerPermission, setEmail, verifyIsViewerPermission };
});

registerStoreHMR(useUser, import.meta.webpackHot);
