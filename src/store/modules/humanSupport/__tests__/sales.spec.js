import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHumanSupportSales } from '../sales';
import SalesDataService from '@/services/api/resources/humanSupport/sales/salesData';

vi.mock('@/services/api/resources/humanSupport/sales/salesData');

const mockSalesData = {
  average_order_value: 284,
  total_revenue: {
    value: 428450,
    last_period_value: 362480,
    variation: 18.2,
  },
};

describe('useHumanSupportSales store', () => {
  let store;

  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);
    store = useHumanSupportSales();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize salesData correctly', () => {
      expect(store.salesData).toEqual({
        average_order_value: null,
        total_revenue: {
          value: null,
          last_period_value: null,
          variation: null,
        },
      });
    });

    it('should initialize loadingSalesData as false', () => {
      expect(store.loadingSalesData).toBe(false);
    });
  });

  describe('Computed: isLoadingAllData', () => {
    it('should return false when no data is loading', () => {
      expect(store.isLoadingAllData).toBe(false);
    });

    it('should return true when loading sales data', () => {
      store.loadingSalesData = true;
      expect(store.isLoadingAllData).toBe(true);
    });
  });

  describe('Action: loadSalesData', () => {
    it('should load sales data successfully', async () => {
      SalesDataService.getSalesData.mockResolvedValue(mockSalesData);

      await store.loadSalesData();

      expect(SalesDataService.getSalesData).toHaveBeenCalled();
      expect(store.salesData).toEqual(mockSalesData);
    });

    it('should set loading state during data fetch', async () => {
      SalesDataService.getSalesData.mockImplementation(
        () =>
          new Promise((resolve) => {
            expect(store.loadingSalesData).toBe(true);
            setTimeout(() => resolve(mockSalesData), 10);
          }),
      );

      await store.loadSalesData();
      expect(store.loadingSalesData).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      SalesDataService.getSalesData.mockRejectedValue(new Error('API Error'));

      await store.loadSalesData();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading sales data:',
        expect.any(Error),
      );
      expect(store.loadingSalesData).toBe(false);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Action: loadAllData', () => {
    it('should reload sales data once it has been loaded', async () => {
      SalesDataService.getSalesData.mockResolvedValue(mockSalesData);

      await store.loadSalesData();
      vi.clearAllMocks();

      store.loadAllData();

      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(SalesDataService.getSalesData).toHaveBeenCalled();
      expect(store.salesData).toEqual(mockSalesData);
    });

    it('should not load data that was never visible/loaded', async () => {
      store.loadAllData();

      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(SalesDataService.getSalesData).not.toHaveBeenCalled();
    });
  });
});
