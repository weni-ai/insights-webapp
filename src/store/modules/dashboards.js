const mutations = {
  SET_DASHBOARDS: 'SET_DASHBOARDS',
  SET_CURRENT_DASHBOARD: 'SET_CURRENT_DASHBOARD',
  SET_CURRENT_DASHBOARD_WIDGETS: 'SET_CURRENT_DASHBOARD_WIDGETS',
};

export default {
  namespaced: true,
  state: {
    dashboards: [],
    currentDashboard: null,
    currentDashboardWidgets: null,
  },
  mutations: {
    [mutations.SET_DASHBOARDS](state, dashboards) {
      state.dashboards = dashboards;
    },
    [mutations.SET_CURRENT_DASHBOARD](state, dashboard) {
      state.currentDashboard = dashboard;
    },
    [mutations.SET_CURRENT_DASHBOARD_WIDGETS](state, widgets) {
      state.currentDashboardWidgets = widgets;
    },
  },
  actions: {
    async setDashboards({ commit }, dashboards) {
      commit(mutations.SET_DASHBOARDS, dashboards);
    },
    async setCurrentDashboard({ commit }, dashboard) {
      commit(mutations.SET_CURRENT_DASHBOARD, dashboard);
    },
    async setCurrentDashboardWidgets({ commit }, widgets) {
      commit(mutations.SET_CURRENT_DASHBOARD_WIDGETS, widgets);
    },
  },
  getters: {
    dashboardDefault(state) {
      return state.dashboards.find((dashboard) => dashboard.is_default);
    },
  },
};
