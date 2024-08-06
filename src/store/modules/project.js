import Projects from '@/services/api/resources/projects';

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
