import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useConversational } from '../conversational';
import { useDashboards } from '@/store/modules/dashboards';

vi.mock('@/store/modules/dashboards', () => ({
  useDashboards: vi.fn(),
}));

describe('useConversational store', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useConversational();
  });

  describe('appliedFilters getter', () => {
    it('should return formatted filters when appliedFilters has data', () => {
      const mockAppliedFilters = {
        ended_at: {
          __gte: '2021-01-01',
          __lte: '2021-01-31',
        },
      };

      useDashboards.mockReturnValue({
        appliedFilters: mockAppliedFilters,
      });

      const expected = {
        start_date: '2021-01-01',
        end_date: '2021-01-31',
      };

      expect(store.appliedFilters).toEqual(expected);
    });

    it('should return undefined dates when appliedFilters is empty', () => {
      useDashboards.mockReturnValue({
        appliedFilters: {},
      });

      const expected = {
        start_date: undefined,
        end_date: undefined,
      };

      expect(store.appliedFilters).toEqual(expected);
    });
  });
});
