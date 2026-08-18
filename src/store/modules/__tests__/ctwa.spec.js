import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createApp } from 'vue';

import { useCTWA } from '../ctwa';
import CTWADataService from '@/services/api/resources/ctwa/data';

vi.mock('@/utils/time', () => ({
  getLastNDays: vi.fn(() => ({
    start: '2024-01-01',
    end: '2024-01-07',
    dmFormat: '01/01 - 07/01',
  })),
}));

vi.mock('@/services/api/resources/ctwa/data');

const mockDashboardData = {
  attributed_revenue: { value: 1030000, avg: 359 },
  ctwa_conversations: 19400,
  organic_conversations: 22800,
};

describe('useCTWA store', () => {
  let store;
  let router;

  const createStore = async (query = {}) => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          name: 'home',
          component: { template: '<div>Home</div>' },
        },
      ],
    });

    await router.push({ path: '/', query });
    await router.isReady();

    const app = createApp({ template: '<div></div>' });
    const pinia = createPinia();
    app.use(router);
    app.use(pinia);
    setActivePinia(pinia);

    store = useCTWA();
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await createStore();
  });

  describe('initial state', () => {
    it('initializes date range with last 7 days when query is empty', () => {
      expect(store.appliedDateRange).toEqual({
        start: '2024-01-01',
        end: '2024-01-07',
      });
    });

    it('initializes selected campaign as empty when query is empty', () => {
      expect(store.selectedCampaign).toBe('');
    });

    it('initializes date range from query params', async () => {
      await createStore({
        start_date: '2024-02-01',
        end_date: '2024-02-15',
      });

      expect(store.appliedDateRange).toEqual({
        start: '2024-02-01',
        end: '2024-02-15',
      });
    });

    it('initializes selected campaign from query param', async () => {
      await createStore({ campaign: 'campaign-uuid' });

      expect(store.selectedCampaign).toBe('campaign-uuid');
    });

    it('uses default date range when only one date query param is present', async () => {
      await createStore({ start_date: '2024-02-01' });

      expect(store.appliedDateRange).toEqual({
        start: '2024-01-01',
        end: '2024-01-07',
      });
    });

    it('initializes dashboard data as empty', () => {
      expect(store.dashboardData).toEqual({
        attributed_revenue: { value: null, avg: null },
        ctwa_conversations: null,
        organic_conversations: null,
      });
    });

    it('initializes loadingDashboardData as false', () => {
      expect(store.loadingDashboardData).toBe(false);
    });

    it('initializes hasLoadedDashboardData as false', () => {
      expect(store.hasLoadedDashboardData).toBe(false);
    });
  });

  describe('appliedFilters', () => {
    it('returns date filters without campaign when none is selected', () => {
      expect(store.appliedFilters).toEqual({
        start_date: '2024-01-01',
        end_date: '2024-01-07',
      });
    });

    it('includes campaign when one is selected', () => {
      store.selectedCampaign = 'campaign-uuid';

      expect(store.appliedFilters).toEqual({
        start_date: '2024-01-01',
        end_date: '2024-01-07',
        campaign: 'campaign-uuid',
      });
    });
  });

  describe('loadDashboardData', () => {
    it('loads dashboard data successfully', async () => {
      CTWADataService.getDashboardData.mockResolvedValue(mockDashboardData);

      await store.loadDashboardData();

      expect(CTWADataService.getDashboardData).toHaveBeenCalled();
      expect(store.dashboardData).toEqual(mockDashboardData);
      expect(store.hasLoadedDashboardData).toBe(true);
    });

    it('sets loading state during data fetch', async () => {
      CTWADataService.getDashboardData.mockImplementation(
        () =>
          new Promise((resolve) => {
            expect(store.loadingDashboardData).toBe(true);
            setTimeout(() => resolve(mockDashboardData), 10);
          }),
      );

      await store.loadDashboardData();
      expect(store.loadingDashboardData).toBe(false);
    });

    it('handles errors gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      CTWADataService.getDashboardData.mockRejectedValue(
        new Error('API Error'),
      );

      await store.loadDashboardData();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading CTWA dashboard data:',
        expect.any(Error),
      );
      expect(store.loadingDashboardData).toBe(false);
      expect(store.hasLoadedDashboardData).toBe(true);
      consoleErrorSpy.mockRestore();
    });
  });
});
