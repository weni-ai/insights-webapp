import Router from '@/router';

const mutations = {
  SET_DASHBOARDS: 'SET_DASHBOARDS',
  SET_CURRENT_DASHBOARD: 'SET_CURRENT_DASHBOARD',
  SET_CURRENT_DASHBOARD_WIDGETS: 'SET_CURRENT_DASHBOARD_WIDGETS',
  SET_CURRENT_DASHBOARD_WIDGET_DATA: 'SET_CURRENT_DASHBOARD_WIDGET_DATA',
  SET_CURRENT_DASHBOARD_FILTERS: 'SET_CURRENT_DASHBOARD_FILTERS',
  SET_APPLIED_FILTERS: 'SET_APPLIED_FILTERS',
};

export default {
  namespaced: true,
  state: {
    dashboards: [],
    currentDashboard: {},
    currentDashboardWidgets: [],
    currentDashboardFilters: [],
    appliedFilters: {},
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
    [mutations.SET_CURRENT_DASHBOARD_WIDGET_DATA](state, { uuid, data }) {
      const widgetIndex = state.currentDashboardWidgets.findIndex(
        (widget) => widget.uuid === uuid,
      );
      const isValidWidgetIndex = widgetIndex !== -1;

      if (isValidWidgetIndex) {
        state.currentDashboardWidgets[widgetIndex] = {
          ...state.currentDashboardWidgets[widgetIndex],
          data,
        };
      }
    },
    [mutations.SET_CURRENT_DASHBOARD_FILTERS](state, filters) {
      state.currentDashboardFilters = filters;
    },
    [mutations.SET_APPLIED_FILTERS](state, filters) {
      state.appliedFilters = filters;
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
    async setCurrentDashboardWidgetData({ commit }, { uuid, data }) {
      commit(mutations.SET_CURRENT_DASHBOARD_WIDGET_DATA, { uuid, data });
    },
    async setCurrentDashboardFilters({ commit }, filters) {
      commit(mutations.SET_CURRENT_DASHBOARD_FILTERS, filters);
    },
    async setAppliedFilters({ commit }, filters) {
      commit(mutations.SET_APPLIED_FILTERS, filters);

      const newFilters = [];
      Object.entries(filters).forEach(([filterKey, filterValue]) => {
        if (typeof filterValue === 'object') {
          Object.entries(filterValue).forEach(
            ([subFilterKey, subFilterValue]) => {
              newFilters.push({ [subFilterKey]: subFilterValue });
            },
          );
          return;
        }

        newFilters.push({ [filterKey]: filterValue });
      });

      const query = Object.assign({}, ...newFilters);

      Router.replace({
        name: Router.currentRoute._value.name,
        query,
      });
    },
  },
  getters: {
    dashboardDefault(state) {
      return state.dashboards.find((dashboard) => dashboard.is_default);
    },
  },
};
