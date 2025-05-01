import { defineStore } from 'pinia';

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

export const useDashboards = defineStore('dashboards', {
  state: () => ({
    nextDashboards: '',
    dashboards: [],
    isLoadingDashboards: false,
    currentDashboard: {} as { [key: string]: any },
    currentDashboardFilters: [],
    isLoadingCurrentDashboardFilters: false,
    appliedFilters: {},
    showDashboardConfig: false,
    last_updated_request: null,
  }),
  actions: {
    setShowDashboardConfig(payload: Boolean) {
      this.showDashboardConfig = payload;
    },
    async getDashboards() {
      try {
        this.isLoadingDashboards = true;

        const { dashboards, next } = await Dashboards.getAll({
          nextReq: this.nextDashboards,
        });

        this.nextDashboards = next;

        let treatedDashboards = removeDuplicatedItems(
          this.dashboards.concat(dashboards),
          'uuid',
        );

        // Temporary adjustment to translate the Atendimento humano dashboard name
        treatedDashboards = dashboards.map((dash) => {
          if (dash.name === 'Atendimento humano') {
            return { ...dash, name: 'human_service_dashboard.title' };
          }
          return dash;
        });

        this.dashboards = sortByKey(treatedDashboards, 'is_default', 'desc');
      } catch (error) {
        console.log(error);
      } finally {
        if (this.nextDashboards) this.getDashboards();
        else this.isLoadingDashboards = false;
      }
    },
    async setCurrentDashboard(dashboard) {
      this.currentDashboard = dashboard;
    },
    async getCurrentDashboardFilters() {
      this.isLoadingCurrentDashboardFilters = true;

      const filters = await Dashboards.getDashboardFilters(
        this.currentDashboard.uuid,
      );
      this.setCurrentDashboardFilters(filters);
      this.isLoadingCurrentDashboardFilters = false;
    },
    setCurrentDashboardFilters(filters) {
      this.currentDashboardFilters = filters;
    },
    async setAppliedFilters(filters) {
      this.appliedFilters = treatFilters(
        filters,
        parseValue,
        this.currentDashboardFilters,
      );

      const currentRoute = Router.currentRoute.value;

      const appliedFilterKeys = this.currentDashboardFilters.map(
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
            this.currentDashboardFilters,
          ),
        },
      });
    },
    async resetAppliedFilters() {
      this.appliedFilters = {};

      const currentRoute = Router.currentRoute.value;

      const appliedFilterKeys = this.currentDashboardFilters.map(
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
    handleSetDefaultDashboard({ uuid, isDefault }) {
      this.dashboards.find((dash) => dash.uuid === uuid).is_default = isDefault;
    },
    async setDefaultDashboard(uuid) {
      const oldDefaultDashboardUuid = this.dashboardDefault.uuid;

      await Dashboards.setDefaultDashboard({
        dashboardUuid: uuid,
        isDefault: true,
      });

      this.handleSetDefaultDashboard({ uuid, isDefault: true });

      this.handleSetDefaultDashboard({
        uuid: oldDefaultDashboardUuid,
        isDefault: false,
      });
    },
    updateLastUpdatedRequest() {
      this.last_updated_request = new Date();
    },
  },
  getters: {
    lastUpdatedAt: (state) => state.last_updated_request,
    dashboardDefault: (state) => {
      return (
        state.dashboards.find((dashboard) => dashboard.is_default) ||
        state.dashboards.find(
          (dashboard) => dashboard.name === 'human_service_dashboard.title',
        )
      );
    },
  },
});
