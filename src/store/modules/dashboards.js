import Router from '@/router';
import { parseValue, stringifyValue } from '@/utils/object';
import { Dashboards } from '@/services/api';

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
  SET_DEFAULT_DASHBOARD: 'SET_DEFAULT_DASHBOARD',
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
    [mutations.SET_DEFAULT_DASHBOARD](state, { uuid, isDefault }) {
      state.dashboards.find((dash) => dash.uuid === uuid).is_default =
        isDefault;
    },
  },
  actions: {
    async getDashboards({ commit }) {
      const dashboard = await Dashboards.getAll();
      commit(mutations.SET_DASHBOARDS, dashboard);
    },
    async setCurrentDashboard({ commit }, dashboard) {
      commit(mutations.SET_CURRENT_DASHBOARD, dashboard);
    },
    async getCurrentDashboardWidgets({ state, commit }) {
      const widgets = await Dashboards.getDashboardWidgets(
        state.currentDashboard.uuid,
      );
      commit(mutations.SET_CURRENT_DASHBOARD_WIDGETS, widgets);
    },
    async getCurrentDashboardFilters({ commit, state }) {
      const filters = await Dashboards.getDashboardFilters(
        state.currentDashboard.uuid,
      );
      commit(mutations.SET_CURRENT_DASHBOARD_FILTERS, filters);
    },
    async setAppliedFilters({ commit }, filters) {
      commit(mutations.SET_APPLIED_FILTERS, filters);

      Router.replace({
        name: Router.currentRoute.value.name,
        query: treatFilters(filters, stringifyValue),
      });
    },
    async setDefaultDashboard({ getters, commit }, uuid) {
      const oldDefaultDashboardUuid = getters.dashboardDefault.uuid;
      const updateDefaultDashboard = async (dashboardUuid, isDefault) => {
        await Dashboards.setDefaultDashboard({
          dashboardUuid,
          isDefault,
        });
        commit(mutations.SET_DEFAULT_DASHBOARD, {
          uuid: dashboardUuid,
          isDefault,
        });
      };

      await updateDefaultDashboard(oldDefaultDashboardUuid, false);
      await updateDefaultDashboard(uuid, true);
    },
    async fetchWidgetData({ state, commit }, widgetUuid) {
      try {
        const data = await Dashboards.getDashboardWidgetData({
          dashboardUuid: state.currentDashboard.uuid,
          widgetUuid: widgetUuid,
        });
        commit(mutations.SET_CURRENT_DASHBOARD_WIDGET_DATA, {
          uuid: widgetUuid,
          data,
        });
      } catch (error) {
        console.error(error);
        commit(mutations.SET_CURRENT_DASHBOARD_WIDGET_DATA, {
          uuid: widgetUuid,
          data: null,
        });
      }
    },
    async getCurrentDashboardWidgetsDatas({ state, dispatch }) {
      Promise.all(
        state.currentDashboardWidgets.map(async ({ uuid, name, config }) => {
          if (name && Object.keys(config).length) {
            dispatch('fetchWidgetData', uuid);
          }
        }),
      );
    },
  },
  getters: {
    dashboardDefault(state) {
      return state.dashboards.find((dashboard) => dashboard.is_default);
    },
  },
};
