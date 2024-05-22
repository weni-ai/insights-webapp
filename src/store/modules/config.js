const mutations = {
  SET_PROJECT: 'SET_PROJECT',
};

export default {
  namespaced: true,
  state: {
    project: {
      uuid: '',
    },
  },
  mutations: {
    [mutations.SET_PROJECT](state, project) {
      state.project = project;
    },
  },
  actions: {
    async setProject({ commit }, project) {
      commit(mutations.SET_PROJECT, project);
    },
  },
};
