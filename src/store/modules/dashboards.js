import Router from '@/router';
import { parseValue, stringifyValue } from '@/utils/object';

function treatFilters(filters, valueHandler) {
  return Object.entries(filters).reduce((acc, [key, value]) => {
    acc[key] = valueHandler(value);
    return acc;
  }, {});
}

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
      state.appliedFilters = treatFilters(filters, parseValue);
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

      Router.replace({
        name: Router.currentRoute.value.name,
        query: treatFilters(filters, stringifyValue),
      });
    },
  },
  getters: {
    dashboardDefault(state) {
      return state.dashboards.find((dashboard) => dashboard.is_default);
    },
    appliedFilters: (state) => state.appliedFilters,
  },
};
