import Projects from '@/services/api/resources/projects';
import { parseValue } from '@/utils/object';

const mutations = {
  SET_PROJECT_FLOWS: 'SET_PROJECT_FLOWS',
};

export default {
  namespaced: true,
  state: {
    isLoadedFlows: false,
    isLoadingFlows: false,
    flows: [],
  },
  mutations: {
    [mutations.SET_PROJECT_FLOWS](state, flows) {
      state.flows = flows;
    },
  },
  actions: {
    getProjectFlows({ state, commit }) {
      state.isLoadingFlows = true;

      Projects.getProjectSource('flows')
        .then((response) => {
          const flows = response.map((source) => ({
            value: source.uuid,
            label: source.name,
            results: parseValue(source.metadata)?.results.map((result) => ({
              value: result.key,
              label: result.name,
            })),
          }));

          commit('SET_PROJECT_FLOWS', flows);
          state.isLoadedFlows = true;
        })
        .finally(() => {
          state.isLoadingFlows = false;
        });
    },
  },
};
