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
    parseValue: (value) => value,
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
    describe('getProjectFlows', () => {
      it('should set isLoadingFlows to true when getProjectFlows is dispatched', async () => {
        Projects.getProjectSource.mockResolvedValue([]);

        const promise = store.dispatch('project/getProjectFlows');
        expect(store.state.project.isLoadingFlows).toBe(true);
        await promise;
      });

      it('should commit formatted flows at SET_PROJECT_FLOWS when getProjectFlows is dispatched', async () => {
        Projects.getProjectSource.mockResolvedValue([
          {
            uuid: '1',
            name: 'Flow 1',
            metadata: { results: [{ key: '1', name: 'Result 1' }] },
          },
        ]);

        await store.dispatch('project/getProjectFlows');

        expect(store.state.project.flows).toEqual([
          {
            value: '1',
            label: 'Flow 1',
            results: [
              {
                value: '1',
                label: 'Result 1',
              },
            ],
          },
        ]);
      });

      it('should set isLoadedFlows to true when getProjectFlows is dispatched', async () => {
        Projects.getProjectSource.mockResolvedValue([]);

        await store.dispatch('project/getProjectFlows');

        expect(store.state.project.isLoadedFlows).toBe(true);
      });

      it('should set isLoadingFlows to false after getProjectFlows action is completed', async () => {
        Projects.getProjectSource.mockResolvedValue([]);
        await store.dispatch('project/getProjectFlows');

        expect(store.state.project.isLoadingFlows).toBe(false);
      });
    });
  });
});
