import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useDashboards } from '../dashboards';
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
        query: {},
        name: 'dashboard',
      },
    },
    replace: vi.fn(),
  },
}));

vi.mock('@/utils/object', async () => {
  const actual = await vi.importActual('@/utils/object');
  return {
    ...actual,
    parseValue: vi.fn((val) => val),
    stringifyValue: vi.fn((val) => val),
  };
});

vi.mock('@/utils/array', async () => {
  const actual = await vi.importActual('@/utils/array');
  return {
    ...actual,
    removeDuplicatedItems: vi.fn((arr) => arr),
    sortByKey: vi.fn((arr) => arr),
  };
});

describe('useDashboards Store', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useDashboards();
  });

  it('should initialize with correct default values', () => {
    expect(store.dashboards).toEqual([]);
    expect(store.appliedFilters).toEqual({});
    expect(store.isLoadingDashboards).toBe(false);
    expect(store.isLoadingCurrentDashboardFilters).toBe(false);
  });

  it('setShowDashboardConfig should update the flag', () => {
    store.setShowDashboardConfig(true);
    expect(store.showDashboardConfig).toBe(true);
  });

  it('setCurrentDashboard should assign a dashboard object', async () => {
    const dashboard = { uuid: '123', name: 'Test' };
    await store.setCurrentDashboard(dashboard);
    expect(store.currentDashboard).toEqual(dashboard);
  });

  it('getCurrentDashboardFilters should fetch and assign filters', async () => {
    const filters = [{ name: 'filter1' }];
    Dashboards.getDashboardFilters.mockResolvedValue(filters);
    store.currentDashboard = { uuid: '123' };

    await store.getCurrentDashboardFilters();

    expect(store.currentDashboardFilters).toEqual(filters);
    expect(store.isLoadingCurrentDashboardFilters).toBe(false);
  });

  it('setCurrentDashboardFilters should update the filter state', () => {
    const filters = [{ name: 'status' }];
    store.setCurrentDashboardFilters(filters);
    expect(store.currentDashboardFilters).toEqual(filters);
  });

  it('setAppliedFilters should treat and set filters and update the route', async () => {
    store.currentDashboardFilters = [{ name: 'type' }];
    const filters = { type: 'active', extra: 'ignored' };

    await store.setAppliedFilters(filters);

    expect(store.appliedFilters).toEqual({ type: 'active' });
    expect(Router.replace).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ type: 'active' }),
      }),
    );
  });

  it('resetAppliedFilters should clear filters and update the route', async () => {
    store.currentDashboardFilters = [{ name: 'type' }];
    store.appliedFilters = { type: 'active' };
    Router.currentRoute.value.query = { type: 'active', page: '2' };

    await store.resetAppliedFilters();

    expect(store.appliedFilters).toEqual({});
    expect(Router.replace).toHaveBeenCalledWith(
      expect.objectContaining({
        query: { page: '2' },
      }),
    );
  });

  it('handleSetDefaultDashboard should set is_default flag on matching dashboard', () => {
    const dashboards = [
      { uuid: '1', is_default: false },
      { uuid: '2', is_default: false },
    ];
    store.dashboards = dashboards;

    store.handleSetDefaultDashboard({ uuid: '2', isDefault: true });

    expect(store.dashboards[1].is_default).toBe(true);
  });

  it('setDefaultDashboard should update default dashboard correctly', async () => {
    store.dashboards = [
      { uuid: '1', name: 'Dashboard 1', is_default: true },
      { uuid: '2', name: 'Dashboard 2', is_default: false },
    ];

    await store.setDefaultDashboard('2');

    expect(Dashboards.setDefaultDashboard).toHaveBeenCalledWith({
      dashboardUuid: '2',
      isDefault: true,
    });

    expect(store.dashboards.find((d) => d.uuid === '2')?.is_default).toBe(true);
    expect(store.dashboards.find((d) => d.uuid === '1')?.is_default).toBe(
      false,
    );
  });

  it('updateLastUpdatedRequest should set last_updated_request to a Date', () => {
    store.updateLastUpdatedRequest();
    expect(store.last_updated_request).toBeInstanceOf(Date);
  });

  describe('Getters', () => {
    it('lastUpdatedAt should return the last_updated_request', () => {
      const now = new Date();
      store.last_updated_request = now;
      expect(store.lastUpdatedAt).toBe(now);
    });

    it('dashboardDefault should return default dashboard or fallback', () => {
      store.dashboards = [
        { uuid: '1', name: 'Dash A' },
        { uuid: '2', name: 'human_service_dashboard.title' },
      ];

      expect(store.dashboardDefault).toEqual(store.dashboards[1]);

      store.dashboards = [
        { uuid: '1', name: 'Default', is_default: true },
        { uuid: '2', name: 'Other' },
      ];

      expect(store.dashboardDefault).toEqual(store.dashboards[0]);
    });
  });
});
