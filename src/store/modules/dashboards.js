import Router from '@/router';
import { parseValue, stringifyValue } from '@/utils/object';
import { Dashboards, Widgets } from '@/services/api';
import { sortByKey } from '@/utils/array';
import i18n from '@/utils/plugins/i18n';

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

      const currentRoute = Router.currentRoute.value;

      Router.replace({
        ...currentRoute,
        query: {
          ...currentRoute.query,
          ...treatFilters(
            filters,
            stringifyValue,
            state.currentDashboardFilters,
          ),
        },
      });
    },
    async resetAppliedFilters({ state, commit }) {
      commit(mutations.SET_APPLIED_FILTERS, {});

      const currentRoute = Router.currentRoute.value;
      const appliedFilterKeys = state.currentDashboardFilters.map(
        (filter) => filter.name,
      );

      const newQuery = Object.entries(currentRoute.query).reduce(
        (acc, [key, value]) => {
          if (!appliedFilterKeys.includes(key)) {
            acc[key] = value;
          }
          return acc;
        },
        {},
      );

      Router.replace({
        ...currentRoute,
        query: newQuery,
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
    async getCurrentDashboardWidgetData({ state, commit }, uuid) {
      try {
        const data = await Dashboards.getDashboardWidgetData({
          dashboardUuid: state.currentDashboard.uuid,
          widgetUuid: uuid,
        });
        commit(mutations.SET_CURRENT_DASHBOARD_WIDGET_DATA, {
          uuid,
          data,
        });
      } catch (error) {
        console.error(error);
        commit(mutations.SET_CURRENT_DASHBOARD_WIDGET_DATA, {
          uuid,
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
    async getWidgetGraphFunnelData(
      { state, commit },
      { uuid, widgetFunnelConfig },
    ) {
      const responsePromise = await Promise.all(
        Object.keys(widgetFunnelConfig).map(async (metric) => {
          const response = await Dashboards.getDashboardWidgetData({
            dashboardUuid: state.currentDashboard.uuid,
            widgetUuid: uuid,
            params: {
              slug: metric,
            },
          });
          return {
            description: i18n.global.t('widgets.graph_funnel.flow_executions'),
            title: response.value,
          };
        }),
      );

      commit(mutations.SET_CURRENT_DASHBOARD_WIDGET_DATA, {
        uuid,
        data: responsePromise,
      });
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
