import { defineStore } from 'pinia';

export const useUser = defineStore('user', {
  state: () => ({
    email: '' as String,
  }),
  actions: {
    setEmail(email: string) {
      this.email = email;
    },
  },
});
