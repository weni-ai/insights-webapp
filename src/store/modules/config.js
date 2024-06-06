const mutations = {
  SET_PROJECT: 'SET_PROJECT',
  SET_TOKEN: 'SET_TOKEN',
};

export default {
  namespaced: true,
  state: {
    project: {
      uuid: '',
    },
    token: '',
  },
  mutations: {
    [mutations.SET_PROJECT](state, project) {
      state.project = project;
    },
    [mutations.SET_TOKEN](state, token) {
      state.token = token;
    },
  },
  actions: {
    async setProject({ commit }, project) {
      commit(mutations.SET_PROJECT, project);
    },
    setToken({ commit }, token) {
      commit(mutations.SET_TOKEN, token);
    },
  },
};
