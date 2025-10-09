import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHumanSupportMonitoring } from '../monitoring';
import { useDashboards } from '@/store/modules/dashboards';
import TimeMetricsService from '@/services/api/resources/humanSupport/timeMetrics';
import ServiceStatusService from '@/services/api/resources/humanSupport/serviceStatus';
import ServicesOpenByHourService from '@/services/api/resources/humanSupport/servicesOpenByHour';

vi.mock('@/store/modules/dashboards', () => ({
  useDashboards: vi.fn(),
}));

vi.mock('@/services/api/resources/humanSupport/timeMetrics', () => ({
  default: {
    getTimeMetricsData: vi.fn(),
  },
}));

vi.mock('@/services/api/resources/humanSupport/serviceStatus', () => ({
  default: {
    getServiceStatusData: vi.fn(),
  },
}));

vi.mock('@/services/api/resources/humanSupport/servicesOpenByHour', () => ({
  default: {
    getServicesOpenByHourData: vi.fn(),
  },
}));

Object.defineProperty(globalThis, 'setTimeout', {
  value: vi.fn((fn) => {
    if (typeof fn === 'function') {
      fn();
    }
    return 1;
  }),
  writable: true,
});

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.setTimeout = vi.fn((fn) => {
    if (typeof fn === 'function') {
      fn();
    }
    return 1;
  });
});

describe('useHumanSupportMonitoring store', () => {
  let store;
  let mockUpdateLastUpdatedRequest;
  let mockCurrentDashboard;

  beforeEach(() => {
    mockUpdateLastUpdatedRequest = vi.fn();
    mockCurrentDashboard = { uuid: 'test-dashboard-uuid' };

    useDashboards.mockReturnValue({
      updateLastUpdatedRequest: mockUpdateLastUpdatedRequest,
      currentDashboard: mockCurrentDashboard,
    });

    TimeMetricsService.getTimeMetricsData.mockReset();
    ServiceStatusService.getServiceStatusData.mockReset();
    ServicesOpenByHourService.getServicesOpenByHourData.mockReset();

    ServiceStatusService.getServiceStatusData.mockResolvedValue({
      is_waiting: 10,
      in_progress: 5,
      finished: 20,
    });

    ServicesOpenByHourService.getServicesOpenByHourData.mockResolvedValue([
      { label: '00:00', value: 5 },
      { label: '01:00', value: 3 },
    ]);

    setActivePinia(createPinia());
    store = useHumanSupportMonitoring();
  });

  describe('initial state', () => {
    it('should initialize with empty arrays and loading false', () => {
      expect(store.sectors).toEqual([]);
      expect(store.queues).toEqual([]);
      expect(store.tags).toEqual([]);
      expect(store.isLoadingAllData).toBe(false);
      expect(store.appliedFiltersLength).toBe(0);
    });

    it('should initialize service status data with null values', () => {
      expect(store.serviceStatusData).toEqual({
        is_waiting: null,
        in_progress: null,
        finished: null,
      });
    });

    it('should initialize time metrics data with null values', () => {
      expect(store.timeMetricsData).toEqual({
        average_time_is_waiting: { average: null, max: null },
        average_time_first_response: { average: null, max: null },
        average_time_chat: { average: null, max: null },
      });
    });

    it('should initialize individual loading states', () => {
      expect(store.loadingServiceStatusData).toBe(false);
      expect(store.loadingTimeMetricsData).toBe(false);
      expect(store.loadingHumanSupportByHourData).toBe(false);
    });

    it('should initialize refresh and tab states', () => {
      expect(store.refreshDetailedTabData).toBe(false);
      expect(store.activeDetailedTab).toBe('in_progress');
    });

    it('should initialize applied agent filter', () => {
      expect(store.appliedAgentFilter).toEqual({
        value: '',
        label: '',
      });
    });
  });

  describe('loadAllData action', () => {
    beforeEach(() => {
      vi.useFakeTimers();

      TimeMetricsService.getTimeMetricsData.mockResolvedValue({
        average_time_is_waiting: { average: 100, max: 250 },
        average_time_first_response: { average: 30, max: 60 },
        average_time_chat: { average: 500, max: 1000 },
      });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should set isLoadingAllData to true when any individual load is running', async () => {
      const loadAllDataPromise = store.loadAllData();

      expect(store.isLoadingAllData).toBe(true);

      vi.advanceTimersByTime(3000);
      await loadAllDataPromise;

      expect(store.isLoadingAllData).toBe(false);
    });

    it('should call updateLastUpdatedRequest for each data load', async () => {
      const loadAllDataPromise = store.loadAllData();

      vi.advanceTimersByTime(3000);
      await loadAllDataPromise;

      expect(mockUpdateLastUpdatedRequest).toHaveBeenCalledTimes(3);
    });

    it('should load all data types simultaneously', async () => {
      const loadAllDataPromise = store.loadAllData();

      expect(store.loadingServiceStatusData).toBe(true);
      expect(store.loadingTimeMetricsData).toBe(true);
      expect(store.loadingHumanSupportByHourData).toBe(true);

      vi.advanceTimersByTime(3000);
      await loadAllDataPromise;

      expect(store.loadingServiceStatusData).toBe(false);
      expect(store.loadingTimeMetricsData).toBe(false);
      expect(store.loadingHumanSupportByHourData).toBe(false);
    });

    it('should call TimeMetricsService as part of loadAllData', async () => {
      const loadAllDataPromise = store.loadAllData();

      vi.advanceTimersByTime(3000);
      await loadAllDataPromise;

      expect(TimeMetricsService.getTimeMetricsData).toHaveBeenCalledTimes(1);
      expect(store.timeMetricsData.average_time_is_waiting.average).toBe(100);
    });
  });

  describe('individual data loading', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should load service status data correctly', async () => {
      const loadPromise = store.loadServiceStatusData();

      expect(store.loadingServiceStatusData).toBe(true);

      await loadPromise;

      expect(store.loadingServiceStatusData).toBe(false);
      expect(store.serviceStatusData.is_waiting).toBeTypeOf('number');
      expect(store.serviceStatusData.in_progress).toBeTypeOf('number');
      expect(store.serviceStatusData.finished).toBeTypeOf('number');
    });

    it('should load time metrics data correctly', async () => {
      const mockTimeMetricsData = {
        average_time_is_waiting: { average: 120, max: 300 },
        average_time_first_response: { average: 45, max: 90 },
        average_time_chat: { average: 600, max: 1200 },
      };

      TimeMetricsService.getTimeMetricsData.mockResolvedValue(
        mockTimeMetricsData,
      );

      expect(store.loadingTimeMetricsData).toBe(false);

      const loadPromise = store.loadTimeMetricsData();

      expect(store.loadingTimeMetricsData).toBe(true);

      await loadPromise;

      expect(TimeMetricsService.getTimeMetricsData).toHaveBeenCalledTimes(1);
      expect(store.loadingTimeMetricsData).toBe(false);
      expect(store.timeMetricsData).toEqual(mockTimeMetricsData);
      expect(store.timeMetricsData.average_time_is_waiting.average).toBe(120);
      expect(store.timeMetricsData.average_time_first_response.average).toBe(
        45,
      );
      expect(store.timeMetricsData.average_time_chat.average).toBe(600);
    });

    it('should handle errors gracefully in individual loads', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const mockError = new Error('API Error');
      ServiceStatusService.getServiceStatusData.mockRejectedValue(mockError);

      await store.loadServiceStatusData();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading service status data:',
        mockError,
      );
      expect(store.loadingServiceStatusData).toBe(false);

      consoleSpy.mockRestore();
    });

    it('should handle errors in time metrics loading', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const mockError = new Error('Time Metrics API Error');
      TimeMetricsService.getTimeMetricsData.mockRejectedValue(mockError);

      await store.loadTimeMetricsData();

      expect(TimeMetricsService.getTimeMetricsData).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading time metrics data:',
        mockError,
      );
      expect(store.loadingTimeMetricsData).toBe(false);

      consoleSpy.mockRestore();
    });

    it('should handle errors in human support by hour loading', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const mockError = new Error('Human Support By Hour API Error');
      ServicesOpenByHourService.getServicesOpenByHourData.mockRejectedValue(
        mockError,
      );

      await store.loadHumanSupportByHourData();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading human support by hour data:',
        mockError,
      );
      expect(store.loadingHumanSupportByHourData).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('filter management', () => {
    beforeEach(() => {
      store.sectors = [{ value: 'sector1', label: 'Sector 1' }];
      store.queues = [{ value: 'queue1', label: 'Queue 1' }];
      store.tags = [{ value: 'tag1', label: 'Tag 1' }];
    });

    describe('saveAppliedFilters', () => {
      it('should save current filter values to appliedFilters', () => {
        store.saveAppliedFilters();

        expect(store.appliedFiltersLength).toBe(3);
      });

      it('should update appliedFiltersLength based on saved filters', () => {
        store.sectors = [{ value: 'sector1', label: 'Sector 1' }];
        store.queues = [];
        store.tags = [];

        store.saveAppliedFilters();

        expect(store.appliedFiltersLength).toBe(1);
      });
    });

    describe('clearFilters', () => {
      it('should clear all filter arrays', () => {
        store.clearFilters();

        expect(store.sectors).toEqual([]);
        expect(store.queues).toEqual([]);
        expect(store.tags).toEqual([]);
      });

      it('should reset appliedFiltersLength to 0', () => {
        store.saveAppliedFilters();
        expect(store.appliedFiltersLength).toBe(3);

        store.clearFilters();
        expect(store.appliedFiltersLength).toBe(0);
      });
    });

    describe('appliedFiltersLength computed', () => {
      it('should return 0 when no filters are applied', () => {
        store.clearFilters();
        expect(store.appliedFiltersLength).toBe(0);
      });

      it('should count each filter type as 1 when applied', () => {
        store.sectors = [{ value: 'sector1', label: 'Sector 1' }];
        store.queues = [
          { value: 'queue1', label: 'Queue 1' },
          { value: 'queue2', label: 'Queue 2' },
        ];
        store.tags = [];

        store.saveAppliedFilters();

        expect(store.appliedFiltersLength).toBe(2);
      });
    });

    describe('hasAppliedFiltersNoChanges computed', () => {
      beforeEach(() => {
        store.clearFilters();
      });

      it('should return true when no filters are set and none applied', () => {
        expect(store.hasAppliedFiltersNoChanges).toBe(true);
      });

      it('should return false when current filters differ from applied', () => {
        store.sectors = [{ value: 'sector1', label: 'Sector 1' }];
        expect(store.hasAppliedFiltersNoChanges).toBe(false);
      });

      it('should return true when current filters match applied filters', () => {
        store.sectors = [{ value: 'sector1', label: 'Sector 1' }];
        store.queues = [{ value: 'queue1', label: 'Queue 1' }];

        store.saveAppliedFilters();

        expect(store.hasAppliedFiltersNoChanges).toBe(true);
      });

      it('should return false when arrays have different lengths', () => {
        store.sectors = [{ value: 'sector1', label: 'Sector 1' }];
        store.saveAppliedFilters();

        store.sectors = [
          { value: 'sector1', label: 'Sector 1' },
          { value: 'sector2', label: 'Sector 2' },
        ];

        expect(store.hasAppliedFiltersNoChanges).toBe(false);
      });

      it('should return true when arrays have same items in different order', () => {
        store.sectors = [
          { value: 'sector1', label: 'Sector 1' },
          { value: 'sector2', label: 'Sector 2' },
        ];
        store.saveAppliedFilters();

        store.sectors = [
          { value: 'sector2', label: 'Sector 2' },
          { value: 'sector1', label: 'Sector 1' },
        ];

        expect(store.hasAppliedFiltersNoChanges).toBe(true);
      });

      it('should return false when arrays have different values', () => {
        store.sectors = [{ value: 'sector1', label: 'Sector 1' }];
        store.saveAppliedFilters();

        store.sectors = [{ value: 'sector2', label: 'Sector 2' }];

        expect(store.hasAppliedFiltersNoChanges).toBe(false);
      });

      it('should handle complex filter combinations correctly', () => {
        store.sectors = [
          { value: 'sector1', label: 'Sector 1' },
          { value: 'sector2', label: 'Sector 2' },
        ];
        store.queues = [{ value: 'queue1', label: 'Queue 1' }];
        store.tags = [
          { value: 'tag1', label: 'Tag 1' },
          { value: 'tag2', label: 'Tag 2' },
        ];

        store.saveAppliedFilters();
        expect(store.hasAppliedFiltersNoChanges).toBe(true);

        store.tags = [{ value: 'tag1', label: 'Tag 1' }];
        expect(store.hasAppliedFiltersNoChanges).toBe(false);
      });

      it('should handle edge case with empty applied filters', () => {
        store.sectors = [{ value: 'sector1', label: 'Sector 1' }];
        store.saveAppliedFilters();

        store.sectors = [];
        expect(store.hasAppliedFiltersNoChanges).toBe(false);
      });
    });

    describe('clearFilters optimization', () => {
      it('should handle clearing when all filters are already empty', () => {
        store.clearFilters();

        expect(store.sectors).toEqual([]);
        expect(store.queues).toEqual([]);
        expect(store.tags).toEqual([]);
        expect(store.appliedFiltersLength).toBe(0);

        expect(() => store.clearFilters()).not.toThrow();

        expect(store.sectors).toEqual([]);
        expect(store.queues).toEqual([]);
        expect(store.tags).toEqual([]);
        expect(store.appliedFiltersLength).toBe(0);
      });

      it('should clear filters when there are current filters but no applied ones', () => {
        store.sectors = [{ value: 'sector1', label: 'Sector 1' }];

        store.clearFilters();

        expect(store.sectors).toEqual([]);
        expect(store.appliedFiltersLength).toBe(0);
      });

      it('should clear filters when there are applied filters but no current ones', () => {
        store.sectors = [{ value: 'sector1', label: 'Sector 1' }];
        store.saveAppliedFilters();
        store.sectors = [];

        store.clearFilters();

        expect(store.appliedFiltersLength).toBe(0);
      });
    });
  });

  describe('tab and refresh management', () => {
    describe('setActiveDetailedTab', () => {
      it('should set active detailed tab to in_awaiting', () => {
        store.setActiveDetailedTab('in_awaiting');
        expect(store.activeDetailedTab).toBe('in_awaiting');
      });

      it('should set active detailed tab to attendant', () => {
        store.setActiveDetailedTab('attendant');
        expect(store.activeDetailedTab).toBe('attendant');
      });

      it('should set active detailed tab to pauses', () => {
        store.setActiveDetailedTab('pauses');
        expect(store.activeDetailedTab).toBe('pauses');
      });

      it('should set active detailed tab to in_progress', () => {
        store.setActiveDetailedTab('in_progress');
        expect(store.activeDetailedTab).toBe('in_progress');
      });
    });

    describe('setRefreshDetailedTabData', () => {
      it('should set refresh detailed tab data to true', () => {
        store.setRefreshDetailedTabData(true);
        expect(store.refreshDetailedTabData).toBe(true);
      });

      it('should set refresh detailed tab data to false', () => {
        store.setRefreshDetailedTabData(false);
        expect(store.refreshDetailedTabData).toBe(false);
      });

      it('should toggle refresh detailed tab data', () => {
        expect(store.refreshDetailedTabData).toBe(false);

        store.setRefreshDetailedTabData(true);
        expect(store.refreshDetailedTabData).toBe(true);

        store.setRefreshDetailedTabData(false);
        expect(store.refreshDetailedTabData).toBe(false);
      });
    });

    describe('saveAppliedAgentFilter', () => {
      it('should save applied agent filter with value and label', () => {
        store.saveAppliedAgentFilter('agent-123', 'Agent Name');

        expect(store.appliedAgentFilter.value).toBe('agent-123');
        expect(store.appliedAgentFilter.label).toBe('Agent Name');
      });

      it('should update existing applied agent filter', () => {
        store.saveAppliedAgentFilter('agent-123', 'Agent Name');
        store.saveAppliedAgentFilter('agent-456', 'Another Agent');

        expect(store.appliedAgentFilter.value).toBe('agent-456');
        expect(store.appliedAgentFilter.label).toBe('Another Agent');
      });

      it('should save empty agent filter', () => {
        store.saveAppliedAgentFilter('agent-123', 'Agent Name');
        store.saveAppliedAgentFilter('', '');

        expect(store.appliedAgentFilter.value).toBe('');
        expect(store.appliedAgentFilter.label).toBe('');
      });
    });
  });
});
