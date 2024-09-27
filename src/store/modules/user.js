export default {
  namespaced: true,
  state: {
    email: '',
  },
  mutations: {
    SET_EMAIL(state, email) {
      state.email = email;
    },
  },
  actions: {
    setEmail({ commit }, email) {
      commit('SET_EMAIL', email);
    },
  },
  getters: {
    getEmail(state) {
      return state.email;
    },
  },
};
