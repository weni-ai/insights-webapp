const mutations = {
  SET_CONTENT_HEIGHT: 'SET_CONTENT_HEIGHT',
};

export default {
  namespaced: true,

  state: {
    contentHeight: 0,
    contentHeightMax: 60,
  },

  mutations: {
    [mutations.SET_CONTENT_HEIGHT](state, height) {
      state.contentHeight = height;
    },
  },

  actions: {
    async setContentHeight({ state, commit }, height) {
      commit(
        mutations.SET_CONTENT_HEIGHT,
        Math.max(0, Math.min(height, state.contentHeightMax)),
      );
    },
  },
};
