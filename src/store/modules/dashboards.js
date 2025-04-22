import Router from '@/router';
import { parseValue, stringifyValue } from '@/utils/object';
import { Dashboards } from '@/services/api';
import { removeDuplicatedItems, sortByKey } from '@/utils/array';

export function treatFilters(filters, valueHandler, currentDashboardFilters) {
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
  SET_LOADING_CURRENT_DASHBOARD_FILTERS:
    'SET_LOADING_CURRENT_DASHBOARD_FILTERS',
  SET_CURRENT_DASHBOARD_FILTERS: 'SET_CURRENT_DASHBOARD_FILTERS',
  SET_APPLIED_FILTERS: 'SET_APPLIED_FILTERS',
  SET_DEFAULT_DASHBOARD: 'SET_DEFAULT_DASHBOARD',
  SET_SHOW_DASHBOARD_CONFIG: 'SET_SHOW_DASHBOARD_CONFIG',
};

export default {
  namespaced: true,
  state: {
    nextDashboards: '',
    dashboards: [],
    isLoadingDashboards: false,
    currentDashboard: {},
    currentDashboardFilters: [],
    isLoadingCurrentDashboardFilters: false,
    appliedFilters: {},
    showDashboardConfig: false,
  },
  mutations: {
    [mutations.SET_SHOW_DASHBOARD_CONFIG](state, show) {
      state.showDashboardConfig = show;
    },
    [mutations.SET_DASHBOARDS](state, dashboards) {
      // Temporary adjustment to translate the Atendimento humano dashboard name
      state.dashboards = dashboards.map((dash) => {
        if (dash.name === 'Atendimento humano') {
          return { ...dash, name: 'human_service_dashboard.title' };
        }
        return dash;
      });
    },
    [mutations.SET_LOADING_DASHBOARDS](state, loading) {
      state.isLoadingDashboards = loading;
    },
    [mutations.SET_LOADING_CURRENT_DASHBOARD_FILTERS](state, loading) {
      state.isLoadingCurrentDashboardFilters = loading;
    },
    [mutations.SET_CURRENT_DASHBOARD](state, dashboard) {
      state.currentDashboard = dashboard;
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
    async getDashboards({ commit, state, dispatch }) {
      try {
        commit(mutations.SET_LOADING_DASHBOARDS, true);
        const { dashboards, next } = await Dashboards.getAll({
          nextReq: state.nextDashboards,
        });
        state.nextDashboards = next;

        const treatedDashboards = removeDuplicatedItems(
          state.dashboards.concat(dashboards),
          'uuid',
        );

        commit(
          mutations.SET_DASHBOARDS,
          sortByKey(treatedDashboards, 'is_default', 'desc'),
        );
      } catch (error) {
        console.log(error);
      } finally {
        if (state.nextDashboards) dispatch('getDashboards');
        else commit(mutations.SET_LOADING_DASHBOARDS, false);
      }
    },
    async setCurrentDashboard({ commit }, dashboard) {
      commit(mutations.SET_CURRENT_DASHBOARD, dashboard);
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

      await Dashboards.setDefaultDashboard({
        dashboardUuid: uuid,
        isDefault: true,
      });

      commit(mutations.SET_DEFAULT_DASHBOARD, {
        uuid,
        isDefault: true,
      });

      commit(mutations.SET_DEFAULT_DASHBOARD, {
        uuid: oldDefaultDashboardUuid,
        isDefault: false,
      });
    },
  },
  getters: {
    dashboardDefault(state) {
      return (
        state.dashboards.find((dashboard) => dashboard.is_default) ||
        state.dashboards.find(
          (dashboard) => dashboard.name === 'human_service_dashboard.title',
        )
      );
    },
  },
};
