import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { ref } from 'vue';
import ConversationalToolResult from '../ConversationalToolResult.vue';

const shouldUseMockRef = ref(false);

const mockAutoWidgetsStore = {
  toolResult: {
    data: {
      results: [
        {
          label: 'search_orders',
          agent: { uuid: '111-aaa' },
          value: 45,
          full_value: 45,
        },
        {
          label: 'send_email',
          agent: { uuid: '222-bbb' },
          value: 30,
          full_value: 30,
        },
      ],
    },
    isLoading: false,
    error: false,
  },
  hasToolResultData: true,
  loadToolResultData: vi.fn().mockResolvedValue(undefined),
};

const mockConversationalStore = {
  refreshDataConversational: false,
  setIsLoadingConversationalData: vi.fn(),
  shouldUseMock: shouldUseMockRef,
};

const mockRoute = { query: {} };

vi.mock('@/store/modules/conversational/autoWidgets', () => ({
  useAutoWidgets: () => mockAutoWidgetsStore,
}));

vi.mock('@/store/modules/conversational/conversational', () => ({
  useConversational: () => mockConversationalStore,
}));

vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useRoute: () => mockRoute,
}));

vi.mock('pinia', async (importOriginal) => ({
  ...(await importOriginal()),
  storeToRefs: (store) => store,
}));

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      conversations_dashboard: {
        tool_result: 'Tool',
      },
    },
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

describe('ConversationalToolResult', () => {
  let wrapper;

  const createWrapper = () => {
    return mount(ConversationalToolResult, {
      global: {
        stubs: {
          ProgressWidget: true,
          SeeAllDrawer: true,
        },
      },
    });
  };

  describe('Mock mode (shouldUseMock = true)', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      shouldUseMockRef.value = true;
      mockConversationalStore.refreshDataConversational = false;
      wrapper = createWrapper();
    });

    afterEach(() => {
      shouldUseMockRef.value = false;
    });

    it('should not load data on mount when in mock mode', () => {
      expect(mockAutoWidgetsStore.loadToolResultData).not.toHaveBeenCalled();
    });

    it('should pass empty actions to ProgressWidget', () => {
      const widget = wrapper.findComponent({ name: 'ProgressWidget' });
      expect(widget.props('actions')).toEqual([]);
    });

    it('should pass hiddenTabs as true to ProgressWidget', () => {
      const widget = wrapper.findComponent({ name: 'ProgressWidget' });
      expect(widget.props('hiddenTabs')).toBe(true);
    });
  });

  describe('Normal mode (shouldUseMock = false)', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      shouldUseMockRef.value = false;
      mockConversationalStore.refreshDataConversational = false;
      wrapper = createWrapper();
    });

    it('should load data on mount', () => {
      expect(mockAutoWidgetsStore.loadToolResultData).toHaveBeenCalled();
    });

    it('should always pass empty actions (no edit/delete)', () => {
      const widget = wrapper.findComponent({ name: 'ProgressWidget' });
      expect(widget.props('actions')).toEqual([]);
    });

    it('should pass hiddenTabs as true', () => {
      const widget = wrapper.findComponent({ name: 'ProgressWidget' });
      expect(widget.props('hiddenTabs')).toBe(true);
    });

    it('should compute progressItems from store data', () => {
      const items = wrapper.vm.progressItems;
      expect(items).toHaveLength(2);
      expect(items[0].text).toBe('search_orders');
      expect(items[0].value).toBe(45);
      expect(items[1].text).toBe('send_email');
      expect(items[1].value).toBe(30);
    });

    it('should compute isExpanded as false when results <= 5', () => {
      expect(wrapper.vm.isExpanded).toBe(false);
    });
  });

  describe('Empty data', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      shouldUseMockRef.value = false;
      mockAutoWidgetsStore.toolResult.data = { results: [] };
      mockAutoWidgetsStore.hasToolResultData = false;
      wrapper = createWrapper();
    });

    afterEach(() => {
      mockAutoWidgetsStore.toolResult.data = {
        results: [
          {
            label: 'search_orders',
            agent: { uuid: '111-aaa' },
            value: 45,
            full_value: 45,
          },
          {
            label: 'send_email',
            agent: { uuid: '222-bbb' },
            value: 30,
            full_value: 30,
          },
        ],
      };
      mockAutoWidgetsStore.hasToolResultData = true;
    });

    it('should return placeholder progressItems when no results', () => {
      const items = wrapper.vm.progressItems;
      expect(items).toHaveLength(5);
      expect(items[0].text).toBe('-');
      expect(items[0].value).toBe(0);
    });
  });
});
