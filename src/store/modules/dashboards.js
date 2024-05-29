const mutations = {
  SET_DASHBOARDS: 'SET_DASHBOARDS',
};

export default {
  namespaced: true,
  state: {
    dashboards: [],
  },
  mutations: {
    [mutations.SET_DASHBOARDS](state, dashboards) {
      state.dashboards = dashboards;
    },
  },
  actions: {
    async setDashboards({ commit }, dashboards) {
      commit(mutations.SET_DASHBOARDS, dashboards);
    },
  },
  getters: {
    dashboardDefault(state) {
      return state.dashboards.find((dashboard) => dashboard.is_default);
    },
  },
};
