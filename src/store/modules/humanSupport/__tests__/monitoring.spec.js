import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHumanSupportMonitoring } from '../monitoring';
import { useDashboards } from '@/store/modules/dashboards';

vi.mock('@/store/modules/dashboards', () => ({
  useDashboards: vi.fn(),
}));

describe('useHumanSupportMonitoring store', () => {
  let store;
  let mockUpdateLastUpdatedRequest;

  beforeEach(() => {
    mockUpdateLastUpdatedRequest = vi.fn();
    useDashboards.mockReturnValue({
      updateLastUpdatedRequest: mockUpdateLastUpdatedRequest,
    });

    setActivePinia(createPinia());
    store = useHumanSupportMonitoring();
  });

  describe('initial state', () => {
    it('should initialize with empty arrays and loading false', () => {
      expect(store.sectors).toEqual([]);
      expect(store.queues).toEqual([]);
      expect(store.tags).toEqual([]);
      expect(store.isLoadingData).toBe(false);
    });
  });

  describe('loadData action', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should set loading to true during data loading', async () => {
      const loadDataPromise = store.loadData();

      expect(store.isLoadingData).toBe(true);

      vi.advanceTimersByTime(3000);
      await loadDataPromise;

      expect(store.isLoadingData).toBe(false);
    });

    it('should call updateLastUpdatedRequest when loadData completes successfully', async () => {
      const loadDataPromise = store.loadData();

      vi.advanceTimersByTime(3000);
      await loadDataPromise;

      expect(mockUpdateLastUpdatedRequest).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      vi.spyOn(global, 'setTimeout').mockImplementationOnce(() => {
        throw new Error('API Error');
      });

      await store.loadData();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading monitoring data:',
        expect.any(Error),
      );
      expect(store.isLoadingData).toBe(false);

      consoleSpy.mockRestore();
    });

    it('should set loading to false even when an error occurs', async () => {
      vi.spyOn(global, 'setTimeout').mockImplementationOnce(() => {
        throw new Error('API Error');
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await store.loadData();

      expect(store.isLoadingData).toBe(false);

      consoleSpy.mockRestore();
    });

    it('should not call updateLastUpdatedRequest when an error occurs', async () => {
      vi.spyOn(global, 'setTimeout').mockImplementationOnce(() => {
        throw new Error('API Error');
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await store.loadData();

      expect(mockUpdateLastUpdatedRequest).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
