const mutations = {
  SET_PROJECT: 'SET_PROJECT',
};

export default {
  namespaced: true,
  state: {
    project: {
      uuid: 'b24ee4dd-d8d8-430d-990a-794586f4ceb4', // Temporary mock uuid
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
