import { beforeEach, describe, it, vi } from 'vitest';
import { createStore } from 'vuex';

import dashboards, { treatFilters } from '@/store/modules/dashboards';
import { Dashboards } from '@/services/api';
import Router from '@/router';

vi.mock('@/services/api', () => ({
  Dashboards: {
    getAll: vi.fn(),
    getDashboardFilters: vi.fn(),
    setDefaultDashboard: vi.fn(),
  },
}));

vi.mock('@/router', () => ({
  default: {
    currentRoute: {
      value: {
        params: {
          dashboardUuid: 'dashboard-uuid',
          widgetUuid: 'widget-uuid',
        },
        query: {
          slug: 'report-slug',
        },
      },
    },
    replace: vi.fn(),
  },
}));

describe('Dashboards Store', () => {
  let store;

  beforeEach(() => {
    store = createStore({
      modules: {
        dashboards: {
          namespaced: true,
          ...dashboards,
        },
      },
    });
  });

  it('initial state', () => {
    expect(store.state.dashboards.dashboards).toEqual([]);
    expect(store.state.dashboards.isLoadingDashboards).toBe(false);
    expect(store.state.dashboards.currentDashboard).toEqual({});
    expect(store.state.dashboards.currentDashboardFilters).toEqual([]);
    expect(store.state.dashboards.isLoadingCurrentDashboardFilters).toBe(false);
    expect(store.state.dashboards.appliedFilters).toEqual({});
    expect(store.state.dashboards.showDashboardConfig).toBe(false);
  });

  describe('treatFilters function', () => {
    const currentDashboardFilters = [{ name: 'filter1' }, { name: 'filter2' }];

    it('should return an empty object when filters are empty', () => {
      const filters = {};
      const result = treatFilters(
        filters,
        (value) => value,
        currentDashboardFilters,
      );

      expect(result).toEqual({});
    });

    it('should return an object with filtered values when filters are present', () => {
      const filters = { filter1: 'value1', filter2: 'value2' };
      const result = treatFilters(
        filters,
        (value) => value,
        currentDashboardFilters,
      );

      expect(result).toEqual(filters);
    });

    it('should ignore filters that are not present in currentDashboardFilters', () => {
      const filters = { filter1: 'value1', filter3: 'value3' };
      const result = treatFilters(
        filters,
        (value) => value,
        currentDashboardFilters,
      );

      expect(result).toEqual({ filter1: 'value1' });
    });

    it('should apply the valueHandler function to each filter value', () => {
      const filters = { filter1: 'value1', filter2: 'value2' };
      const valueHandler = (value) => JSON.stringify(value);
      const result = treatFilters(
        filters,
        valueHandler,
        currentDashboardFilters,
      );

      expect(result).toEqual({
        filter1: JSON.stringify('value1'),
        filter2: JSON.stringify('value2'),
      });
    });
  });

  describe('mutations', () => {
    it('SET_DASHBOARDS', () => {
      const dashboards = [
        { id: 1, name: 'Atendimento humano' },
        { id: 2, name: 'Dashboard 2' },
      ];
      store.commit('dashboards/SET_DASHBOARDS', dashboards);
      expect(store.state.dashboards.dashboards).toEqual([
        { id: 1, name: 'human_service_dashboard.title' },
        { id: 2, name: 'Dashboard 2' },
      ]);
    });

    it('SET_LOADING_DASHBOARDS', () => {
      store.commit('dashboards/SET_LOADING_DASHBOARDS', true);
      expect(store.state.dashboards.isLoadingDashboards).toBe(true);
      store.commit('dashboards/SET_LOADING_DASHBOARDS', false);
      expect(store.state.dashboards.isLoadingDashboards).toBe(false);
    });

    it('SET_CURRENT_DASHBOARD', () => {
      const dashboard = { id: 1, name: 'Dashboard 1' };
      store.commit('dashboards/SET_CURRENT_DASHBOARD', dashboard);
      expect(store.state.dashboards.currentDashboard).toEqual(dashboard);
    });

    it('SET_LOADING_CURRENT_DASHBOARD_FILTERS', () => {
      store.commit('dashboards/SET_LOADING_CURRENT_DASHBOARD_FILTERS', true);
      expect(store.state.dashboards.isLoadingCurrentDashboardFilters).toBe(
        true,
      );
      store.commit('dashboards/SET_LOADING_CURRENT_DASHBOARD_FILTERS', false);
      expect(store.state.dashboards.isLoadingCurrentDashboardFilters).toBe(
        false,
      );
    });

    it('SET_CURRENT_DASHBOARD_FILTERS', () => {
      const filters = [
        { id: 1, name: 'Filter 1' },
        { id: 2, name: 'Filter 2' },
      ];
      store.commit('dashboards/SET_CURRENT_DASHBOARD_FILTERS', filters);
      expect(store.state.dashboards.currentDashboardFilters).toEqual(filters);
    });

    it('SET_APPLIED_FILTERS', () => {
      const dashboardFilters = [
        { id: 1, name: 'filter1' },
        { id: 2, name: 'filter2' },
      ];
      store.commit(
        'dashboards/SET_CURRENT_DASHBOARD_FILTERS',
        dashboardFilters,
      );

      const filters = { filter1: 'value1', filter2: 'value2' };
      store.commit('dashboards/SET_APPLIED_FILTERS', filters);

      expect(store.state.dashboards.appliedFilters).toEqual(filters);
    });

    it('SET_DEFAULT_DASHBOARD', () => {
      const dashboard = { uuid: 1, name: 'Dashboard 1', is_default: false };

      store.commit('dashboards/SET_DASHBOARDS', [dashboard]);
      store.commit('dashboards/SET_DEFAULT_DASHBOARD', {
        uuid: dashboard.uuid,
        isDefault: true,
      });

      expect(store.state.dashboards.dashboards[0].is_default).toBe(true);
    });

    it('SET_SHOW_DASHBOARD_CONFIG', () => {
      store.commit('dashboards/SET_SHOW_DASHBOARD_CONFIG', true);
      expect(store.state.dashboards.showDashboardConfig).toBe(true);
      store.commit('dashboards/SET_SHOW_DASHBOARD_CONFIG', false);
      expect(store.state.dashboards.showDashboardConfig).toBe(false);
    });

    it('SET_LAST_UPDATED_REQUEST', () => {
      const timestamp = new Date('2023-07-15T14:30:00');
      store.commit('dashboards/SET_LAST_UPDATED_REQUEST', timestamp);
      expect(store.state.dashboards.last_updated_request).toBe(timestamp);
    });
  });

  describe('actions', () => {
    describe('getDashboards', () => {
      const dashboardsResponse = {
        dashboards: [{ uuid: 1, name: 'Dashboard 1', is_default: true }],
      };

      beforeEach(() => {
        Dashboards.getAll.mockResolvedValue(dashboardsResponse);
      });

      it('should commit SET_LOADING_DASHBOARDS and commit SET_DASHBOARDS mutations when dashboards retrieve successfully', async () => {
        const commitSpy = vi.spyOn(store, 'commit');

        await store.dispatch('dashboards/getDashboards');

        expect(commitSpy).toHaveBeenCalledWith(
          'dashboards/SET_LOADING_DASHBOARDS',
          true,
          undefined,
        );

        expect(commitSpy).toHaveBeenCalledWith(
          'dashboards/SET_DASHBOARDS',
          dashboardsResponse.dashboards,
          undefined,
        );

        expect(commitSpy).toHaveBeenCalledWith(
          'dashboards/SET_LOADING_DASHBOARDS',
          false,
          undefined,
        );
      });

      it('should call Dashboards.getAll', async () => {
        await store.dispatch('dashboards/getDashboards');
        expect(Dashboards.getAll).toHaveBeenCalled();
      });
    });

    it('setCurrentDashboard', () => {
      const dashboard = { uuid: 1, name: 'Dashboard 1' };
      store.dispatch('dashboards/setCurrentDashboard', dashboard);
      expect(store.state.dashboards.currentDashboard).toEqual(dashboard);
    });

    describe('getDashboardFilters', () => {
      const dashboardFilters = [
        { id: 1, name: 'filter1' },
        { id: 2, name: 'filter2' },
      ];

      beforeEach(() => {
        Dashboards.getDashboardFilters.mockResolvedValue(dashboardFilters);
      });

      it('should call Dashboards.getDashboardFilters', async () => {
        const dashboard = { uuid: 1, name: 'Dashboard 1' };
        store.dispatch('dashboards/setCurrentDashboard', dashboard);

        await store.dispatch('dashboards/getCurrentDashboardFilters');
        expect(Dashboards.getDashboardFilters).toHaveBeenCalledWith(
          dashboard.uuid,
        );
      });

      it('should commit SET_LOADING_CURRENT_DASHBOARD_FILTERS and commit SET_CURRENT_DASHBOARD_FILTERS mutations when dashboard filters retrieve successfully', async () => {
        const commitSpy = vi.spyOn(store, 'commit');
        await store.dispatch('dashboards/getCurrentDashboardFilters');

        expect(commitSpy).toHaveBeenCalledWith(
          'dashboards/SET_LOADING_CURRENT_DASHBOARD_FILTERS',
          true,
          undefined,
        );

        expect(commitSpy).toHaveBeenCalledWith(
          'dashboards/SET_CURRENT_DASHBOARD_FILTERS',
          dashboardFilters,
          undefined,
        );

        expect(commitSpy).toHaveBeenCalledWith(
          'dashboards/SET_LOADING_CURRENT_DASHBOARD_FILTERS',
          false,
          undefined,
        );
      });
    });

    describe('setAppliedFilters', () => {
      it('should commit SET_APPLIED_FILTERS mutation', async () => {
        const filters = { filter1: 'value1', filter2: 'value2' };
        await store.dispatch('dashboards/setAppliedFilters', filters);
        expect(store.state.dashboards.appliedFilters).toEqual(filters);
      });

      it('should call setAppliedFilters', async () => {
        const commitSpy = vi.spyOn(store, 'commit');
        const filters = { filter1: 'value1', filter2: 'value2' };
        await store.dispatch('dashboards/setAppliedFilters', filters);
        expect(commitSpy).toHaveBeenCalledWith(
          'dashboards/SET_APPLIED_FILTERS',
          filters,
          undefined,
        );
      });

      it('should call Router.replace', async () => {
        const filters = { filter1: 'value1', filter2: 'value2' };
        await store.dispatch('dashboards/setAppliedFilters', filters);

        expect(Router.replace).toHaveBeenCalledWith({
          params: {
            dashboardUuid: 'dashboard-uuid',
            widgetUuid: 'widget-uuid',
          },
          query: {
            filter1: 'value1',
            filter2: 'value2',
            slug: 'report-slug',
          },
        });
      });
    });

    describe('resetAppliedFilters', () => {
      it('should commit SET_APPLIED_FILTERS mutation', async () => {
        await store.dispatch('dashboards/resetAppliedFilters');
        expect(store.state.dashboards.appliedFilters).toEqual({});
      });

      it('should call Router.replace', async () => {
        await store.dispatch('dashboards/resetAppliedFilters');

        expect(Router.replace).toHaveBeenCalledWith({
          params: {
            dashboardUuid: 'dashboard-uuid',
            widgetUuid: 'widget-uuid',
          },
          query: {
            slug: 'report-slug',
          },
        });
      });
    });

    describe('setDefaultDashboard', () => {
      const dashboards = [
        { uuid: 1, name: 'Dashboard 1', is_default: false },
        { uuid: 2, name: 'Dashboard 2', is_default: true },
      ];

      beforeEach(() => {
        store.commit('dashboards/SET_DASHBOARDS', dashboards);
      });

      it('should commit SET_DEFAULT_DASHBOARD mutation', async () => {
        await store.dispatch(
          'dashboards/setDefaultDashboard',
          dashboards[0].uuid,
        );
        expect(store.state.dashboards.dashboards[0].uuid).toEqual(
          dashboards[0].uuid,
        );
      });

      it('should call Dashboards.setDefaultDashboard', async () => {
        await store.dispatch(
          'dashboards/setDefaultDashboard',
          dashboards[0].uuid,
        );
        expect(Dashboards.setDefaultDashboard).toHaveBeenCalledWith({
          dashboardUuid: dashboards[0].uuid,
          isDefault: true,
        });
      });

      it('should set old default dashboard to false', async () => {
        store.state.dashboards.dashboards[0].is_default = true;
        await store.dispatch(
          'dashboards/setDefaultDashboard',
          dashboards[1].uuid,
        );
        expect(store.state.dashboards.dashboards[0].is_default).toEqual(false);
        expect(store.state.dashboards.dashboards[1].is_default).toEqual(true);
      });
    });

    describe('updateLastUpdatedRequest', () => {
      it('should commit SET_LAST_UPDATED_REQUEST mutation with current timestamp', async () => {
        const commitSpy = vi.spyOn(store, 'commit');
        const originalDate = global.Date;
        const mockDate = new Date('2023-07-15T14:30:00');
        global.Date = class extends Date {
          constructor() {
            super();
            return mockDate;
          }
        };

        await store.dispatch('dashboards/updateLastUpdatedRequest');

        expect(commitSpy).toHaveBeenCalledWith(
          'dashboards/SET_LAST_UPDATED_REQUEST',
          mockDate,
          undefined,
        );

        global.Date = originalDate;
      });
    });
  });

  describe('getters', () => {
    it('dashboardDefault', () => {
      const dashboard = { uuid: 1, name: 'Dashboard 1', is_default: true };
      store.commit('dashboards/SET_DASHBOARDS', [dashboard]);
      expect(store.getters['dashboards/dashboardDefault']).toEqual(dashboard);
    });

    it('lastUpdatedAt', () => {
      const timestamp = new Date('2023-07-15T14:30:00');
      store.commit('dashboards/SET_LAST_UPDATED_REQUEST', timestamp);
      expect(store.getters['dashboards/lastUpdatedAt']).toBe(timestamp);
    });
  });
});
