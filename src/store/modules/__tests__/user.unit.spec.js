import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from 'vuex';
import userModule from '@/store/modules/user';

describe('User Vuex Module', () => {
  let store;

  beforeEach(() => {
    store = createStore({
      modules: {
        user: {
          ...userModule,
          namespaced: true,
        },
      },
    });
  });

  describe('State', () => {
    it('should have an initial state with an empty email', () => {
      expect(store.state.user.email).toBe('');
    });
  });

  describe('Mutations', () => {
    it('should set email when SET_EMAIL is committed', () => {
      const email = 'test@example.com';
      store.commit('user/SET_EMAIL', email);

      expect(store.state.user.email).toBe(email);
    });
  });

  describe('Actions', () => {
    it('should commit SET_EMAIL when setEmail action is dispatched', async () => {
      const email = 'test@example.com';
      await store.dispatch('user/setEmail', email);

      expect(store.state.user.email).toBe(email);
    });
  });

  describe('Getters', () => {
    it('should return the correct email with getEmail getter', () => {
      const email = 'test@example.com';
      store.commit('user/SET_EMAIL', email);

      const result = store.getters['user/getEmail'];
      expect(result).toBe(email);
    });
  });

  describe('Functional Coverage', () => {
    it('should handle setting an empty email', async () => {
      await store.dispatch('user/setEmail', '');

      expect(store.state.user.email).toBe('');
    });

    it('should correctly update email state multiple times', async () => {
      const email1 = 'first@example.com';
      const email2 = 'second@example.com';

      await store.dispatch('user/setEmail', email1);
      expect(store.state.user.email).toBe(email1);

      await store.dispatch('user/setEmail', email2);
      expect(store.state.user.email).toBe(email2);
    });
  });
});
