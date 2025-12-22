import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHumanSupportAnalysis } from '../analysis';
import ServiceStatusAnalysisService from '@/services/api/resources/humanSupport/analysis/serviceStatus';
import ServicesOpenByHourAnalysisService from '@/services/api/resources/humanSupport/analysis/servicesOpenByHour';

vi.mock('@/services/api/resources/humanSupport/analysis/serviceStatus');
vi.mock('@/services/api/resources/humanSupport/analysis/servicesOpenByHour');

const mockServiceStatusData = {
  finished: 100,
  average_time_is_waiting: 120,
  average_time_first_response: 60,
  average_response_time: 90,
  average_time_chat: 180,
};

const mockServicesOpenByHourData = [
  { hour: '08:00', count: 10 },
  { hour: '09:00', count: 15 },
];

describe('useHumanSupportAnalysis store', () => {
  let store;

  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);
    store = useHumanSupportAnalysis();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    const initialStateTests = [
      {
        name: 'activeDetailedTab',
        expected: 'finished',
      },
      {
        name: 'serviceStatusData',
        expected: {
          finished: null,
          average_time_is_waiting: null,
          average_time_first_response: null,
          average_response_time: null,
          average_time_chat: null,
        },
      },
      {
        name: 'servicesOpenByHourData',
        expected: [],
      },
      {
        name: 'loadingServiceStatusData',
        expected: false,
      },
      {
        name: 'loadingHumanSupportByHourData',
        expected: false,
      },
    ];

    initialStateTests.forEach(({ name, expected }) => {
      it(`should initialize ${name} correctly`, () => {
        expect(store[name]).toEqual(expected);
      });
    });
  });

  describe('Computed: isLoadingAllData', () => {
    it('should return false when no data is loading', () => {
      expect(store.isLoadingAllData).toBe(false);
    });

    it('should return true when loading service status data', () => {
      store.loadingServiceStatusData = true;
      expect(store.isLoadingAllData).toBe(true);
    });

    it('should return true when loading human support by hour data', () => {
      store.loadingHumanSupportByHourData = true;
      expect(store.isLoadingAllData).toBe(true);
    });

    it('should return true when loading both data sources', () => {
      store.loadingServiceStatusData = true;
      store.loadingHumanSupportByHourData = true;
      expect(store.isLoadingAllData).toBe(true);
    });
  });

  describe('Action: setActiveDetailedTab', () => {
    ['finished', 'attendant', 'pauses'].forEach((tab) => {
      it(`should set active tab to ${tab}`, () => {
        store.setActiveDetailedTab(tab);
        expect(store.activeDetailedTab).toBe(tab);
      });
    });

    it('should switch between tabs correctly', () => {
      store.setActiveDetailedTab('attendant');
      expect(store.activeDetailedTab).toBe('attendant');

      store.setActiveDetailedTab('pauses');
      expect(store.activeDetailedTab).toBe('pauses');
    });
  });

  describe('Action: loadServiceStatusData', () => {
    it('should load service status data successfully', async () => {
      ServiceStatusAnalysisService.getServiceStatusAnalysisData.mockResolvedValue(
        mockServiceStatusData,
      );

      await store.loadServiceStatusData();

      expect(
        ServiceStatusAnalysisService.getServiceStatusAnalysisData,
      ).toHaveBeenCalled();
      expect(store.serviceStatusData).toEqual(mockServiceStatusData);
    });

    it('should set loading state during data fetch', async () => {
      ServiceStatusAnalysisService.getServiceStatusAnalysisData.mockImplementation(
        () =>
          new Promise((resolve) => {
            expect(store.loadingServiceStatusData).toBe(true);
            setTimeout(() => resolve(mockServiceStatusData), 10);
          }),
      );

      await store.loadServiceStatusData();
      expect(store.loadingServiceStatusData).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      ServiceStatusAnalysisService.getServiceStatusAnalysisData.mockRejectedValue(
        new Error('API Error'),
      );

      await store.loadServiceStatusData();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading service status analysis data:',
        expect.any(Error),
      );
      expect(store.loadingServiceStatusData).toBe(false);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Action: loadHumanSupportByHourData', () => {
    it('should load human support by hour data successfully', async () => {
      ServicesOpenByHourAnalysisService.getServicesOpenByHourAnalysisData.mockResolvedValue(
        mockServicesOpenByHourData,
      );

      await store.loadHumanSupportByHourData();

      expect(
        ServicesOpenByHourAnalysisService.getServicesOpenByHourAnalysisData,
      ).toHaveBeenCalled();
      expect(store.servicesOpenByHourData).toEqual(mockServicesOpenByHourData);
    });

    it('should set loading state during data fetch', async () => {
      ServicesOpenByHourAnalysisService.getServicesOpenByHourAnalysisData.mockImplementation(
        () =>
          new Promise((resolve) => {
            expect(store.loadingHumanSupportByHourData).toBe(true);
            setTimeout(() => resolve(mockServicesOpenByHourData), 10);
          }),
      );

      await store.loadHumanSupportByHourData();
      expect(store.loadingHumanSupportByHourData).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      ServicesOpenByHourAnalysisService.getServicesOpenByHourAnalysisData.mockRejectedValue(
        new Error('API Error'),
      );

      await store.loadHumanSupportByHourData();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading human support by hour data:',
        expect.any(Error),
      );
      expect(store.loadingHumanSupportByHourData).toBe(false);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Action: loadAllData', () => {
    it('should load both data sources independently', async () => {
      ServiceStatusAnalysisService.getServiceStatusAnalysisData.mockResolvedValue(
        mockServiceStatusData,
      );
      ServicesOpenByHourAnalysisService.getServicesOpenByHourAnalysisData.mockResolvedValue(
        mockServicesOpenByHourData,
      );

      store.loadAllData();

      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(
        ServiceStatusAnalysisService.getServiceStatusAnalysisData,
      ).toHaveBeenCalled();
      expect(
        ServicesOpenByHourAnalysisService.getServicesOpenByHourAnalysisData,
      ).toHaveBeenCalled();
      expect(store.serviceStatusData).toEqual(mockServiceStatusData);
      expect(store.servicesOpenByHourData).toEqual(mockServicesOpenByHourData);
    });
  });

  describe('Loading State Coordination', () => {
    it('should handle concurrent loading states', async () => {
      ServiceStatusAnalysisService.getServiceStatusAnalysisData.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockServiceStatusData), 50),
          ),
      );
      ServicesOpenByHourAnalysisService.getServicesOpenByHourAnalysisData.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockServicesOpenByHourData), 30),
          ),
      );

      store.loadAllData();

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(store.isLoadingAllData).toBe(true);

      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(store.isLoadingAllData).toBe(false);
    });
  });
});
