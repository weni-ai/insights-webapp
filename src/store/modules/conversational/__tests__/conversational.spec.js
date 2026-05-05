import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useConversational } from '../conversational';
import { useDashboards } from '@/store/modules/dashboards';
import { useConversationalTopics } from '../topics';
import { useConversationalWidgets } from '../widgets';
import { useCustomWidgets } from '../customWidgets';
import { useAutoWidgets } from '../autoWidgets';

vi.mock('@/store/modules/dashboards', () => ({
  useDashboards: vi.fn(),
}));

vi.mock('../topics', () => ({
  useConversationalTopics: vi.fn(),
}));

vi.mock('../widgets', () => ({
  useConversationalWidgets: vi.fn(),
}));

vi.mock('../customWidgets', () => ({
  useCustomWidgets: vi.fn(),
}));

vi.mock('../autoWidgets', () => ({
  useAutoWidgets: vi.fn(),
}));

const mockDependentStores = ({
  hasExistingTopics = false,
  isCsatConfigured = false,
  isNpsConfigured = false,
  isSalesFunnelConfigured = false,
  getRealCustomWidgets = [],
  hasAgentInvocationData = false,
  hasToolResultData = false,
} = {}) => {
  useConversationalTopics.mockReturnValue({ hasExistingTopics });
  useConversationalWidgets.mockReturnValue({
    isCsatConfigured,
    isNpsConfigured,
    isSalesFunnelConfigured,
  });
  useCustomWidgets.mockReturnValue({ getRealCustomWidgets });
  useAutoWidgets.mockReturnValue({
    hasAgentInvocationData,
    hasToolResultData,
  });
};

describe('useConversational store', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useConversational();
    mockDependentStores();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      expect(store.isDrawerCustomizableOpen).toBe(false);
      expect(store.drawerWidgetType).toBe(null);
      expect(store.isNewDrawerCustomizable).toBe(false);
      expect(store.refreshDataConversational).toBe(false);
      expect(store.isloadingConversationalData).toEqual({
        header: false,
        contactsHeader: false,
        mostTalkedAboutTopics: false,
        dynamicWidgets: false,
      });
      expect(store.hasEndpointData).toBe(false);
      expect(store.endpointErrors).toEqual({
        topics: false,
        header: false,
        widgets: false,
        contacts: false,
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
    const keys = [
      'header',
      'contactsHeader',
      'mostTalkedAboutTopics',
      'dynamicWidgets',
    ];

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

  describe('setHasEndpointData action', () => {
    it('should set hasEndpointData to true', () => {
      store.setHasEndpointData(true);
      expect(store.hasEndpointData).toBe(true);
    });

    it('should set hasEndpointData to false', () => {
      store.setHasEndpointData(true);
      store.setHasEndpointData(false);
      expect(store.hasEndpointData).toBe(false);
    });
  });

  describe('setEndpointError action', () => {
    const keys = ['topics', 'header', 'widgets', 'contacts'];

    keys.forEach((key) => {
      it(`should set ${key} error to true`, () => {
        store.setEndpointError(key, true);
        expect(store.endpointErrors[key]).toBe(true);
      });

      it(`should set ${key} error to false`, () => {
        store.setEndpointError(key, true);
        store.setEndpointError(key, false);
        expect(store.endpointErrors[key]).toBe(false);
      });
    });
  });

  describe('hasEndpointErrors getter', () => {
    it('should return false when no endpoint has errors', () => {
      expect(store.hasEndpointErrors).toBe(false);
    });

    it('should return true when topics endpoint has error', () => {
      store.setEndpointError('topics', true);
      expect(store.hasEndpointErrors).toBe(true);
    });

    it('should return true when header endpoint has error', () => {
      store.setEndpointError('header', true);
      expect(store.hasEndpointErrors).toBe(true);
    });

    it('should return true when widgets endpoint has error', () => {
      store.setEndpointError('widgets', true);
      expect(store.hasEndpointErrors).toBe(true);
    });

    it('should return true when contacts endpoint has error', () => {
      store.setEndpointError('contacts', true);
      expect(store.hasEndpointErrors).toBe(true);
    });

    it('should return false after all errors are cleared', () => {
      store.setEndpointError('topics', true);
      store.setEndpointError('header', true);
      store.setEndpointError('topics', false);
      store.setEndpointError('header', false);
      expect(store.hasEndpointErrors).toBe(false);
    });
  });

  describe('shouldUseMock getter', () => {
    it('should return false when configuration is not loaded', () => {
      expect(store.shouldUseMock).toBe(false);
    });

    it('should return true when configuration is loaded and no data exists', () => {
      store.setConfigurationLoaded(true);
      mockDependentStores();
      expect(store.shouldUseMock).toBe(true);
    });

    it('should return false when endpoint has data', () => {
      store.setConfigurationLoaded(true);
      store.setHasEndpointData(true);
      mockDependentStores();
      expect(store.shouldUseMock).toBe(false);
    });

    it('should return false when topics exist', () => {
      store.setConfigurationLoaded(true);
      mockDependentStores({ hasExistingTopics: true });
      expect(store.shouldUseMock).toBe(false);
    });

    it('should return false when CSAT is configured', () => {
      store.setConfigurationLoaded(true);
      mockDependentStores({ isCsatConfigured: true });
      expect(store.shouldUseMock).toBe(false);
    });

    it('should return false when NPS is configured', () => {
      store.setConfigurationLoaded(true);
      mockDependentStores({ isNpsConfigured: true });
      expect(store.shouldUseMock).toBe(false);
    });

    it('should return false when Sales Funnel is configured', () => {
      store.setConfigurationLoaded(true);
      mockDependentStores({ isSalesFunnelConfigured: true });
      expect(store.shouldUseMock).toBe(false);
    });

    it('should return false when custom widgets exist', () => {
      store.setConfigurationLoaded(true);
      mockDependentStores({ getRealCustomWidgets: [{ uuid: 'w1' }] });
      expect(store.shouldUseMock).toBe(false);
    });

    it('should return false when agent invocation data exists', () => {
      store.setConfigurationLoaded(true);
      mockDependentStores({ hasAgentInvocationData: true });
      expect(store.shouldUseMock).toBe(false);
    });

    it('should return false when tool result data exists', () => {
      store.setConfigurationLoaded(true);
      mockDependentStores({ hasToolResultData: true });
      expect(store.shouldUseMock).toBe(false);
    });

    describe('when any endpoint has errors', () => {
      beforeEach(() => {
        store.setConfigurationLoaded(true);
        mockDependentStores();
      });

      it('should return false when topics endpoint has error', () => {
        store.setEndpointError('topics', true);
        expect(store.shouldUseMock).toBe(false);
      });

      it('should return false when header endpoint has error', () => {
        store.setEndpointError('header', true);
        expect(store.shouldUseMock).toBe(false);
      });

      it('should return false when widgets endpoint has error', () => {
        store.setEndpointError('widgets', true);
        expect(store.shouldUseMock).toBe(false);
      });

      it('should return false when multiple endpoints have errors', () => {
        store.setEndpointError('topics', true);
        store.setEndpointError('header', true);
        expect(store.shouldUseMock).toBe(false);
      });

      it('should return true after all endpoint errors are cleared and no config exists', () => {
        store.setEndpointError('topics', true);
        store.setEndpointError('topics', false);
        expect(store.shouldUseMock).toBe(true);
      });
    });
  });
});
