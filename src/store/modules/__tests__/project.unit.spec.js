import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createStore } from 'vuex';
import projectModule from '@/store/modules/project';
import Projects from '@/services/api/resources/projects';

vi.mock('@/services/api/resources/projects', () => ({
  default: {
    getProjectSource: vi.fn(),
  },
}));

vi.mock('@/utils/object', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    parseValue: vi.fn(),
  };
});

describe('Project store', () => {
  let store;

  beforeEach(() => {
    store = createStore({
      modules: {
        project: {
          ...projectModule,
          namespaced: true,
        },
      },
    });
    store.state.project.isLoadingFlows = false;
    store.state.project.isLoadedFlows = false;
    store.state.project.flows = [];

    vi.clearAllMocks();
  });

  describe('mutations', () => {
    it('should set project flows with SET_PROJECT_FLOWS mutation', () => {
      const flows = [{ value: '1', label: 'Flow 1' }];
      store.commit('project/SET_PROJECT_FLOWS', flows);

      expect(store.state.project.flows).toEqual(flows);
    });
  });

  describe('actions', () => {
    it('should set isLoadingFlows to true when getProjectFlows is dispatched', async () => {
      Projects.getProjectSource.mockResolvedValue([]);

      const promise = store.dispatch('project/getProjectFlows');
      expect(store.state.project.isLoadingFlows).toBe(true);
      await promise;
    });

    it('should set isLoadingFlows to false after getProjectFlows action is completed', async () => {
      Projects.getProjectSource.mockResolvedValue([]);
      await store.dispatch('project/getProjectFlows');

      expect(store.state.project.isLoadingFlows).toBe(false);
    });
  });
});
