import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createApp } from 'vue';

import { useCTWA } from '../ctwa';
import CTWADataService from '@/services/api/resources/ctwa/data';
import { getLastNDays } from '@/utils/time';
import CTWAConversionsService from '@/services/api/resources/ctwa/conversions';
import CTWAPerformanceByCampaignService from '@/services/api/resources/ctwa/performanceByCampaign';

vi.mock('@/utils/time', () => ({
  getLastNDays: vi.fn(() => ({
    start: '2024-01-01',
    end: '2024-01-07',
    dmFormat: '01/01 - 07/01',
  })),
  getTodayDate: vi.fn(() => ({
    start: '2024-01-01',
    end: '2024-01-07',
    dmFormat: '01/01 - 07/01',
  })),
  isDateBefore: vi.fn(() => false),
}));

vi.mock('@/services/api/resources/ctwa/data');
vi.mock('@/services/api/resources/ctwa/conversions');
vi.mock('@/services/api/resources/ctwa/performanceByCampaign');

const mockDashboardData = {
  attributed_revenue: { value: 1030000, avg: 359 },
  ctwa_conversations: 19400,
  organic_conversations: 22800,
};

const mockConversionsData = {
  conversations_started: { total: 19400, percentage: 100 },
  conversations_qualified: { total: 7180, percentage: 37.4 },
  conversations_converted: { total: 2880, percentage: 14.8 },
};

const mockCampaignPerformanceData = {
  count: 2,
  results: [
    {
      campaign: 'Contractor Bulk Pricing',
      conversations: 3200,
      qualified: 1450,
      conversions: 520,
      revenue: 509600,
    },
  ],
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

    it('keeps the last 7 days start when it is before 2026-08-19', () => {
      expect(store.appliedDateRange.start).toBe('2024-01-01');
      expect(store.minDateFilter).toBe('2026-08-19');
    });

    it('keeps a query start date when it is before 2026-08-19', async () => {
      await createStore({
        start_date: '2026-08-19',
        end_date: '2026-08-20',
      });

      expect(store.appliedDateRange).toEqual({
        start: '2026-08-19',
        end: '2026-08-20',
      });
      expect(store.minDateFilter).toBe('2026-08-19');
    });

    it('uses 2026-08-19 as min date when last 7 days start after it', async () => {
      getLastNDays.mockReturnValueOnce({
        start: '2026-09-01',
        end: '2026-09-07',
        dmFormat: '01/09 - 07/09',
      });

      await createStore();

      expect(store.appliedDateRange).toEqual({
        start: '2026-09-01',
        end: '2026-09-07',
      });
      expect(store.minDateFilter).toBe('2026-08-19');
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

    it('initializes conversions data as empty', () => {
      expect(store.conversionsData).toEqual({
        conversations_started: { total: null, percentage: null },
        conversations_qualified: { total: null, percentage: null },
        conversations_converted: { total: null, percentage: null },
      });
    });

    it('initializes loadingConversionsData as false', () => {
      expect(store.loadingConversionsData).toBe(false);
    });

    it('initializes hasLoadedConversionsData as false', () => {
      expect(store.hasLoadedConversionsData).toBe(false);
    });

    it('initializes campaign performance data as empty', () => {
      expect(store.campaignPerformanceResults).toEqual([]);
      expect(store.campaignPerformanceCount).toBe(0);
      expect(store.campaignPerformanceOffset).toBe(0);
    });

    it('initializes loadingCampaignPerformance as false', () => {
      expect(store.loadingCampaignPerformance).toBe(false);
    });

    it('initializes hasLoadedCampaignPerformance as false', () => {
      expect(store.hasLoadedCampaignPerformance).toBe(false);
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

  describe('loadConversionsData', () => {
    it('loads conversions data successfully', async () => {
      CTWAConversionsService.getConversionsData.mockResolvedValue(
        mockConversionsData,
      );

      await store.loadConversionsData();

      expect(CTWAConversionsService.getConversionsData).toHaveBeenCalled();
      expect(store.conversionsData).toEqual(mockConversionsData);
      expect(store.hasLoadedConversionsData).toBe(true);
    });

    it('sets loading state during data fetch', async () => {
      CTWAConversionsService.getConversionsData.mockImplementation(
        () =>
          new Promise((resolve) => {
            expect(store.loadingConversionsData).toBe(true);
            setTimeout(() => resolve(mockConversionsData), 10);
          }),
      );

      await store.loadConversionsData();
      expect(store.loadingConversionsData).toBe(false);
    });

    it('handles errors gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      CTWAConversionsService.getConversionsData.mockRejectedValue(
        new Error('API Error'),
      );

      await store.loadConversionsData();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading CTWA conversions data:',
        expect.any(Error),
      );
      expect(store.loadingConversionsData).toBe(false);
      expect(store.hasLoadedConversionsData).toBe(true);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('loadCampaignPerformanceData', () => {
    it('loads campaign performance data successfully', async () => {
      CTWAPerformanceByCampaignService.getPerformanceByCampaign.mockResolvedValue(
        mockCampaignPerformanceData,
      );

      await store.loadCampaignPerformanceData(0);

      expect(
        CTWAPerformanceByCampaignService.getPerformanceByCampaign,
      ).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
      });
      expect(store.campaignPerformanceResults).toEqual(
        mockCampaignPerformanceData.results,
      );
      expect(store.campaignPerformanceCount).toBe(2);
      expect(store.campaignPerformanceOffset).toBe(0);
      expect(store.hasLoadedCampaignPerformance).toBe(true);
    });

    it('stores the requested offset', async () => {
      CTWAPerformanceByCampaignService.getPerformanceByCampaign.mockResolvedValue(
        mockCampaignPerformanceData,
      );

      await store.loadCampaignPerformanceData(10);

      expect(
        CTWAPerformanceByCampaignService.getPerformanceByCampaign,
      ).toHaveBeenCalledWith({
        limit: 10,
        offset: 10,
      });
      expect(store.campaignPerformanceOffset).toBe(10);
    });

    it('sets loading state during data fetch', async () => {
      CTWAPerformanceByCampaignService.getPerformanceByCampaign.mockImplementation(
        () =>
          new Promise((resolve) => {
            expect(store.loadingCampaignPerformance).toBe(true);
            setTimeout(() => resolve(mockCampaignPerformanceData), 10);
          }),
      );

      await store.loadCampaignPerformanceData();
      expect(store.loadingCampaignPerformance).toBe(false);
    });

    it('handles errors gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      CTWAPerformanceByCampaignService.getPerformanceByCampaign.mockRejectedValue(
        new Error('API Error'),
      );

      await store.loadCampaignPerformanceData();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading CTWA campaign performance data:',
        expect.any(Error),
      );
      expect(store.loadingCampaignPerformance).toBe(false);
      expect(store.hasLoadedCampaignPerformance).toBe(true);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('loadAllData', () => {
    it('does not load slices that have never been requested', () => {
      store.loadAllData();

      expect(CTWADataService.getDashboardData).not.toHaveBeenCalled();
      expect(CTWAConversionsService.getConversionsData).not.toHaveBeenCalled();
      expect(
        CTWAPerformanceByCampaignService.getPerformanceByCampaign,
      ).not.toHaveBeenCalled();
    });

    it('reloads only slices that have already been loaded', async () => {
      CTWADataService.getDashboardData.mockResolvedValue(mockDashboardData);
      CTWAConversionsService.getConversionsData.mockResolvedValue(
        mockConversionsData,
      );

      await store.loadDashboardData();
      vi.clearAllMocks();

      store.loadAllData();

      expect(CTWADataService.getDashboardData).toHaveBeenCalledTimes(1);
      expect(CTWAConversionsService.getConversionsData).not.toHaveBeenCalled();
    });

    it('reloads conversions when that slice has been loaded', async () => {
      CTWAConversionsService.getConversionsData.mockResolvedValue(
        mockConversionsData,
      );

      await store.loadConversionsData();
      vi.clearAllMocks();

      store.loadAllData();

      expect(CTWAConversionsService.getConversionsData).toHaveBeenCalledTimes(
        1,
      );
      expect(CTWADataService.getDashboardData).not.toHaveBeenCalled();
    });

    it('reloads campaign performance at the current offset', async () => {
      CTWAPerformanceByCampaignService.getPerformanceByCampaign.mockResolvedValue(
        mockCampaignPerformanceData,
      );

      await store.loadCampaignPerformanceData(10);
      vi.clearAllMocks();

      store.loadAllData();

      expect(
        CTWAPerformanceByCampaignService.getPerformanceByCampaign,
      ).toHaveBeenCalledWith({
        limit: 10,
        offset: 10,
      });
    });

    it('does not reload campaign performance when a campaign is selected', async () => {
      CTWAPerformanceByCampaignService.getPerformanceByCampaign.mockResolvedValue(
        mockCampaignPerformanceData,
      );

      await store.loadCampaignPerformanceData(0);
      store.selectedCampaign = 'campaign-uuid';
      vi.clearAllMocks();

      store.loadAllData();

      expect(
        CTWAPerformanceByCampaignService.getPerformanceByCampaign,
      ).not.toHaveBeenCalled();
    });
  });
});
