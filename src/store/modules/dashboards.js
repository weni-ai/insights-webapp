import Router from '@/router';
import { parseValue, stringifyValue } from '@/utils/object';
import { Dashboards, Widgets } from '@/services/api';
import { sortByKey } from '@/utils/array';

function treatFilters(filters, valueHandler, currentDashboardFilters) {
  return Object.entries(filters).reduce((acc, [key, value]) => {
    if (currentDashboardFilters.some((filter) => filter.name === key)) {
      acc[key] = valueHandler(value);
    }
    return acc;
  }, {});
}

const mutations = {
  SET_DASHBOARDS: 'SET_DASHBOARDS',
  SET_CURRENT_DASHBOARD: 'SET_CURRENT_DASHBOARD',
  SET_CURRENT_DASHBOARD_WIDGETS: 'SET_CURRENT_DASHBOARD_WIDGETS',
  RESET_CURRENT_DASHBOARD_WIDGETS: 'RESET_CURRENT_DASHBOARD_WIDGETS',
  SET_CURRENT_DASHBOARD_WIDGET_DATA: 'SET_CURRENT_DASHBOARD_WIDGET_DATA',
  UPDATE_CURRENT_DASHBOARD_WIDGET: 'UPDATE_CURRENT_DASHBOARD_WIDGET',
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
    [mutations.RESET_CURRENT_DASHBOARD_WIDGETS](state) {
      state.currentDashboardWidgets = [];
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
    [mutations.UPDATE_CURRENT_DASHBOARD_WIDGET](state, widget) {
      const widgetIndex = state.currentDashboardWidgets.findIndex(
        (mappedWidget) => mappedWidget.uuid === widget.uuid,
      );

      state.currentDashboardWidgets[widgetIndex] = widget;
    },
    [mutations.SET_CURRENT_DASHBOARD_FILTERS](state, filters) {
      state.currentDashboardFilters = filters;
    },
    [mutations.SET_APPLIED_FILTERS](state, filters) {
      state.appliedFilters = treatFilters(
        filters,
        parseValue,
        state.currentDashboardFilters,
      );
    },
    [mutations.SET_DEFAULT_DASHBOARD](state, { uuid, isDefault }) {
      state.dashboards.find((dash) => dash.uuid === uuid).is_default =
        isDefault;
    },
  },
  actions: {
    async getDashboards({ commit }) {
      const dashboards = await Dashboards.getAll();
      commit(
        mutations.SET_DASHBOARDS,
        sortByKey(dashboards, 'is_default', 'desc'),
      );
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
    async setAppliedFilters({ state, commit }, filters) {
      commit(mutations.SET_APPLIED_FILTERS, filters);

      const newQuery = Router.currentRoute.value.query;
      Router.replace({
        ...Router.currentRoute.value,
        query: {
          ...newQuery,
          ...treatFilters(
            filters,
            stringifyValue,
            state.currentDashboardFilters,
          ),
        },
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
    async getCurrentDashboardWidgetData({ state, commit }, widgetUuid) {
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
            dispatch('getCurrentDashboardWidgetData', uuid);
          }
        }),
      );
    },
    async updateWidget({ commit }, widget) {
      await Widgets.updateWidget({
        widget,
      });
      commit(mutations.UPDATE_CURRENT_DASHBOARD_WIDGET, widget);
    },
  },
  getters: {
    dashboardDefault(state) {
      return state.dashboards.find((dashboard) => dashboard.is_default);
    },
  },
};
