import Router from '@/router';
import { parseValue, stringifyValue } from '@/utils/object';
import { Dashboards, Widgets } from '@/services/api';
import { sortByKey } from '@/utils/array';

function treatFilters(filters, valueHandler, currentDashboardFilters) {
  return Object.entries(filters).reduce((acc, [key, value]) => {
    if (
      currentDashboardFilters.some((filter) => filter.name === key) &&
      value
    ) {
      acc[key] = valueHandler(value);
    }
    return acc;
  }, {});
}

const mutations = {
  SET_DASHBOARDS: 'SET_DASHBOARDS',
  SET_LOADING_DASHBOARDS: 'SET_LOADING_DASHBOARDS',
  SET_CURRENT_DASHBOARD: 'SET_CURRENT_DASHBOARD',
  SET_CURRENT_DASHBOARD_WIDGETS: 'SET_CURRENT_DASHBOARD_WIDGETS',
  SET_LOADING_CURRENT_DASHBOARD_WIDGETS:
    'SET_LOADING_CURRENT_DASHBOARD_WIDGETS',
  SET_LOADING_CURRENT_DASHBOARD_FILTERS:
    'SET_LOADING_CURRENT_DASHBOARD_FILTERS',
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
    isLoadingDashboards: false,
    currentDashboard: {},
    currentDashboardWidgets: [],
    isLoadingCurrentDashboardWidgets: false,
    currentDashboardFilters: [],
    isLoadingCurrentDashboardFilters: false,
    appliedFilters: {},
  },
  mutations: {
    [mutations.SET_DASHBOARDS](state, dashboards) {
      state.dashboards = dashboards;
    },
    [mutations.SET_LOADING_DASHBOARDS](state, loading) {
      state.isLoadingDashboards = loading;
    },
    [mutations.SET_LOADING_CURRENT_DASHBOARD_WIDGETS](state, loading) {
      state.isLoadingCurrentDashboardWidgets = loading;
    },
    [mutations.SET_LOADING_CURRENT_DASHBOARD_FILTERS](state, loading) {
      state.isLoadingCurrentDashboardFilters = loading;
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
      commit(mutations.SET_LOADING_DASHBOARDS, true);
      const dashboards = await Dashboards.getAll();
      commit(
        mutations.SET_DASHBOARDS,
        sortByKey(dashboards, 'is_default', 'desc'),
      );
      commit(mutations.SET_LOADING_DASHBOARDS, false);
    },
    async setCurrentDashboard({ commit }, dashboard) {
      commit(mutations.SET_CURRENT_DASHBOARD, dashboard);
    },
    async getCurrentDashboardWidgets({ state, commit }) {
      commit(mutations.SET_LOADING_CURRENT_DASHBOARD_WIDGETS, true);
      const widgets = await Dashboards.getDashboardWidgets(
        state.currentDashboard.uuid,
      );
      commit(mutations.SET_CURRENT_DASHBOARD_WIDGETS, widgets);
      commit(mutations.SET_LOADING_CURRENT_DASHBOARD_WIDGETS, false);
    },
    async getCurrentDashboardFilters({ commit, state }) {
      commit(mutations.SET_LOADING_CURRENT_DASHBOARD_FILTERS, true);
      const filters = await Dashboards.getDashboardFilters(
        state.currentDashboard.uuid,
      );
      commit(mutations.SET_CURRENT_DASHBOARD_FILTERS, filters);
      commit(mutations.SET_LOADING_CURRENT_DASHBOARD_FILTERS, false);
    },
    async setAppliedFilters({ state, commit }, filters) {
      commit(mutations.SET_APPLIED_FILTERS, filters);

      const currentRoute = Router.currentRoute.value;

      const appliedFilterKeys = state.currentDashboardFilters.map(
        (filter) => filter.name,
      );

      const queryParamsNonFilters = Object.entries(currentRoute.query).reduce(
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
        query: {
          ...queryParamsNonFilters,
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
    async getCurrentDashboardWidgetData({ state, commit }, widget) {
      const { uuid, name } = widget;
      const setWidgetData = (data) =>
        commit(mutations.SET_CURRENT_DASHBOARD_WIDGET_DATA, {
          uuid,
          data,
        });

      if (!name) {
        /* This only checking if the name is not defined, since the widget may be unconfigured,
          but still have empty fields in the "config" object. */
        setWidgetData(null);
        return;
      }

      try {
        const data = await Dashboards.getDashboardWidgetData({
          dashboardUuid: state.currentDashboard.uuid,
          widgetUuid: uuid,
        });
        setWidgetData(data);
      } catch (error) {
        console.error(error);
        setWidgetData(null);
      }
    },
    async getCurrentDashboardWidgetsDatas({ state, dispatch }) {
      Promise.all(
        state.currentDashboardWidgets.map(async (widget) => {
          const { name, config } = widget;

          if (name && Object.keys(config).length) {
            dispatch('getCurrentDashboardWidgetData', widget);
          }
        }),
      );
    },
    async getWidgetGraphFunnelData(
      { state, commit },
      { uuid, widgetFunnelConfig },
    ) {
      const fetchData = async (metric) => {
        const { name } = widgetFunnelConfig[metric];
        const { value } = await Dashboards.getDashboardWidgetData({
          dashboardUuid: state.currentDashboard.uuid,
          widgetUuid: uuid,
          params: { slug: metric },
        });
        return { description: name, title: value };
      };

      const response = await Promise.all(
        Object.keys(widgetFunnelConfig).map(fetchData),
      );

      const totalValue = response.reduce((sum, item) => sum + item.title, 0);
      const formattedResponse = response
        .map((item) => {
          const percentage = ((item.title / totalValue) * 100 || 0).toFixed(2);
          return {
            description: item.description,
            title: `${percentage}% (${item.title.toLocaleString()})`,
            percentage: parseFloat(percentage), // Add percentage as a number for sorting
          };
        })
        .sort((a, b) => b.percentage - a.percentage)
        .map(({ description, title }) => ({ description, title })); // Remove the 'percentage' property

      commit(mutations.SET_CURRENT_DASHBOARD_WIDGET_DATA, {
        uuid,
        data: formattedResponse,
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
