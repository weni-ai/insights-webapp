import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHumanSupportMonitoring } from '../monitoring';

describe('useHumanSupportMonitoring store', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useHumanSupportMonitoring();
  });

  describe('initial state', () => {
    it('should initialize with empty arrays and loading false', () => {
      expect(store.sectors).toEqual([]);
      expect(store.queues).toEqual([]);
      expect(store.tags).toEqual([]);
      expect(store.loadingData).toBe(false);
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

      expect(store.loadingData).toBe(true);

      vi.advanceTimersByTime(1000);
      await loadDataPromise;

      expect(store.loadingData).toBe(false);
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
      expect(store.loadingData).toBe(false);

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

      expect(store.loadingData).toBe(false);

      consoleSpy.mockRestore();
    });
  });
});
