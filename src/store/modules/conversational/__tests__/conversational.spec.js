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

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      expect(store.isDrawerCustomizableOpen).toBe(false);
      expect(store.drawerWidgetType).toBe(null);
      expect(store.isNewDrawerCustomizable).toBe(false);
      expect(store.refreshDataConversational).toBe(false);
      expect(store.isloadingConversationalData).toEqual({
        header: false,
        mostTalkedAboutTopics: false,
        dynamicWidgets: false,
      });
    });
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

  describe('setRefreshDataConversational action', () => {
    it('should set refreshDataConversational to true', () => {
      store.setRefreshDataConversational(true);
      expect(store.refreshDataConversational).toBe(true);
    });

    it('should set refreshDataConversational to false', () => {
      store.setRefreshDataConversational(true);
      store.setRefreshDataConversational(false);
      expect(store.refreshDataConversational).toBe(false);
    });
  });

  describe('setIsLoadingConversationalData action', () => {
    const keys = ['header', 'mostTalkedAboutTopics', 'dynamicWidgets'];

    keys.forEach((key) => {
      it(`should set ${key} loading to true`, () => {
        store.setIsLoadingConversationalData(key, true);
        expect(store.isloadingConversationalData[key]).toBe(true);
      });

      it(`should set ${key} loading to false`, () => {
        store.setIsLoadingConversationalData(key, true);
        store.setIsLoadingConversationalData(key, false);
        expect(store.isloadingConversationalData[key]).toBe(false);
      });
    });
  });

  describe('isLoadingConversationalData getter', () => {
    it('should return false when no data is loading', () => {
      expect(store.isLoadingConversationalData).toBe(false);
    });

    it('should return true when header is loading', () => {
      store.setIsLoadingConversationalData('header', true);
      expect(store.isLoadingConversationalData).toBe(true);
    });

    it('should return true when mostTalkedAboutTopics is loading', () => {
      store.setIsLoadingConversationalData('mostTalkedAboutTopics', true);
      expect(store.isLoadingConversationalData).toBe(true);
    });

    it('should return true when dynamicWidgets is loading', () => {
      store.setIsLoadingConversationalData('dynamicWidgets', true);
      expect(store.isLoadingConversationalData).toBe(true);
    });

    it('should return true when multiple items are loading', () => {
      store.setIsLoadingConversationalData('header', true);
      store.setIsLoadingConversationalData('dynamicWidgets', true);
      expect(store.isLoadingConversationalData).toBe(true);
    });

    it('should return false when all items finish loading', () => {
      store.setIsLoadingConversationalData('header', true);
      store.setIsLoadingConversationalData('mostTalkedAboutTopics', true);
      store.setIsLoadingConversationalData('header', false);
      store.setIsLoadingConversationalData('mostTalkedAboutTopics', false);
      expect(store.isLoadingConversationalData).toBe(false);
    });
  });

  describe('setIsDrawerCustomizableOpen action', () => {
    const types = ['nps', 'csat', 'add', 'custom', 'sales_funnel'];

    types.forEach((type) => {
      it(`should set drawer open with type ${type}`, () => {
        store.setIsDrawerCustomizableOpen(true, type, false);
        expect(store.isDrawerCustomizableOpen).toBe(true);
        expect(store.drawerWidgetType).toBe(type);
        expect(store.isNewDrawerCustomizable).toBe(false);
      });
    });

    it('should set drawer as new', () => {
      store.setIsDrawerCustomizableOpen(true, 'csat', true);
      expect(store.isNewDrawerCustomizable).toBe(true);
    });

    it('should close drawer and reset type', () => {
      store.setIsDrawerCustomizableOpen(true, 'nps', true);
      store.setIsDrawerCustomizableOpen(false, null, false);
      expect(store.isDrawerCustomizableOpen).toBe(false);
      expect(store.drawerWidgetType).toBe(null);
      expect(store.isNewDrawerCustomizable).toBe(false);
    });
  });
});
