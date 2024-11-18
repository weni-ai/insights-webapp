import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStore } from 'vuex';
import configModule from '@/store/modules/config';
import Projects from '@/services/api/resources/projects';

vi.mock('@/services/api/resources/projects', () => ({
  default: {
    verifyProjectIndexer: vi.fn(),
  },
}));

describe('config module', () => {
  let store;

  beforeEach(() => {
    store = createStore({
      modules: {
        config: configModule,
      },
    });
    localStorage.clear();
  });

  describe('Mutations', () => {
    it('should set project in state and localStorage', () => {
      const project = { uuid: '12345' };
      store.commit('config/SET_PROJECT', project);

      expect(store.state.config.project).toEqual(project);
      expect(localStorage.getItem('projectUuid')).toBe('12345');
    });

    it('should set token in state and localStorage', () => {
      const token = 'abcdef';
      store.commit('config/SET_TOKEN', token);

      expect(store.state.config.token).toBe(token);
      expect(localStorage.getItem('token')).toBe('abcdef');
    });

    it('should set enableCreateCustomDashboards in state', () => {
      store.commit('config/SET_ENABLE_CREATE_CUSTOM_DASHBOARDS', true);

      expect(store.state.config.enableCreateCustomDashboards).toBe(true);
    });
  });

  describe('Actions', () => {
    it('should commit SET_PROJECT with the correct payload', () => {
      const commit = vi.fn();
      const project = { uuid: '12345' };

      configModule.actions.setProject({ commit }, project);

      expect(commit).toHaveBeenCalledWith('SET_PROJECT', project);
    });

    it('should commit SET_TOKEN with the correct payload', () => {
      const commit = vi.fn();
      const token = 'abcdef';

      configModule.actions.setToken({ commit }, token);

      expect(commit).toHaveBeenCalledWith('SET_TOKEN', token);
    });

    it('should commit SET_ENABLE_CREATE_CUSTOM_DASHBOARDS with the correct payload based on verifyProjectIndexer result', async () => {
      const commit = vi.fn();
      Projects.verifyProjectIndexer.mockResolvedValue(true);

      await configModule.actions.checkEnableCreateCustomDashboards({ commit });

      expect(commit).toHaveBeenCalledWith(
        'SET_ENABLE_CREATE_CUSTOM_DASHBOARDS',
        true,
      );
    });

    it('should commit SET_ENABLE_CREATE_CUSTOM_DASHBOARDS with false if verifyProjectIndexer resolves to false', async () => {
      const commit = vi.fn();
      Projects.verifyProjectIndexer.mockResolvedValue(false);

      await configModule.actions.checkEnableCreateCustomDashboards({ commit });

      expect(commit).toHaveBeenCalledWith(
        'SET_ENABLE_CREATE_CUSTOM_DASHBOARDS',
        false,
      );
    });
  });
});
