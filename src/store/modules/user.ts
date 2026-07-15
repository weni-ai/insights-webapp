import { ref } from 'vue';
import { defineStore } from 'pinia';
import User from '@/services/api/resources/user';

export const useUser = defineStore('user', () => {
  const email = ref('');
  const isViewerPermission = ref(false);

  const setEmail = (value: string) => {
    email.value = value;
  };

  const verifyIsViewerPermission = async () => {
    // TODO: Remove this after testing
    isViewerPermission.value = true;
    return;
    const response = await User.verifyIsViewerPermission();
    isViewerPermission.value = response;
  };

  return { email, isViewerPermission, setEmail, verifyIsViewerPermission };
});
