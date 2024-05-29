const mutations = {
  SET_CONTENT_HEIGHT: 'SET_CONTENT_HEIGHT',
  SET_BAR_HANDLER_HEIGHT: 'SET_BAR_HANDLER_HEIGHT',
};

export default {
  namespaced: true,

  state: {
    contentHeight: 0,
    contentHeightMax: 60,
    barHandlerHeight: 0,
  },

  mutations: {
    [mutations.SET_CONTENT_HEIGHT](state, height) {
      state.contentHeight = height;
    },
    [mutations.SET_BAR_HANDLER_HEIGHT](state, height) {
      state.barHandlerHeight = height;
    },
  },

  actions: {
    async setContentHeight({ state, commit }, height) {
      commit(
        mutations.SET_CONTENT_HEIGHT,
        Math.max(0, Math.min(height, state.contentHeightMax)),
      );
    },
    async setBarHandlerHeight({ commit }, height) {
      commit(mutations.SET_BAR_HANDLER_HEIGHT, height);
    },
  },
};
