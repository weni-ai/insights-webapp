import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { ref } from 'vue';
import ConversationalToolResult from '../ConversationalToolResult.vue';

const shouldUseMockRef = ref(false);

const mockAutoWidgetsStore = {
  toolResult: {
    data: {
      total: 8,
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
        tool_result: 'Most used tools',
        tool_result_count: '{count} tools',
        auto_widget_no_data: 'No data available for the filtered period',
        auto_widget_error:
          "Data couldn't be loaded. Refresh the dashboard or contact support",
      },
      see_all: 'See all',
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
          BaseConversationWidget: {
            template:
              '<div data-testid="base-conversation-widget"><slot /></div>',
            props: ['title', 'isLoading', 'hiddenTabs'],
          },
          ProgressTable: true,
          SeeAllDrawer: true,
          UnnnicDisclaimer: {
            template:
              '<div data-testid="disclaimer" :class="type">{{ description }}</div>',
            props: ['description', 'type'],
          },
          UnnnicButton: {
            template: '<button data-testid="see-all-btn">{{ text }}</button>',
            props: ['text', 'type'],
          },
          UnnnicSkeletonLoading: true,
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

    it('should render the base widget', () => {
      const widget = wrapper.find('[data-testid="base-conversation-widget"]');
      expect(widget.exists()).toBe(true);
    });
  });

  describe('Normal mode (shouldUseMock = false)', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      shouldUseMockRef.value = false;
      mockConversationalStore.refreshDataConversational = false;
      mockAutoWidgetsStore.toolResult.error = false;
      mockAutoWidgetsStore.hasToolResultData = true;
      mockAutoWidgetsStore.toolResult.isLoading = false;
      mockAutoWidgetsStore.toolResult.data = {
        total: 8,
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
      wrapper = createWrapper();
    });

    it('should load data on mount', () => {
      expect(mockAutoWidgetsStore.loadToolResultData).toHaveBeenCalled();
    });

    it('should render the base widget', () => {
      const widget = wrapper.find('[data-testid="base-conversation-widget"]');
      expect(widget.exists()).toBe(true);
    });

    it('should compute progressItems from store data', () => {
      const items = wrapper.vm.progressItems;
      expect(items).toHaveLength(2);
      expect(items[0].label).toBe('search_orders');
      expect(items[0].value).toBe(45);
      expect(items[1].label).toBe('send_email');
      expect(items[1].value).toBe(30);
    });

    it('should compute isExpanded as false when results <= 5', () => {
      expect(wrapper.vm.isExpanded).toBe(false);
    });

    it('should show total count in footer', () => {
      expect(wrapper.vm.totalCount).toBe(8);
    });

    it('should render the ProgressTable when data exists', () => {
      const table = wrapper.findComponent({ name: 'ProgressTable' });
      expect(table.exists()).toBe(true);
    });

    it('should not render UnnnicDisclaimer when data exists', () => {
      const disclaimer = wrapper.find('[data-testid="disclaimer"]');
      expect(disclaimer.exists()).toBe(false);
    });
  });

  describe('Empty data', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      shouldUseMockRef.value = false;
      mockAutoWidgetsStore.toolResult.data = { total: 0, results: [] };
      mockAutoWidgetsStore.hasToolResultData = false;
      mockAutoWidgetsStore.toolResult.isLoading = false;
      mockAutoWidgetsStore.toolResult.error = false;
      wrapper = createWrapper();
    });

    afterEach(() => {
      mockAutoWidgetsStore.toolResult.data = {
        total: 8,
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

    it('should show no-data disclaimer when no results', () => {
      const disclaimer = wrapper.find('[data-testid="disclaimer"]');
      expect(disclaimer.exists()).toBe(true);
      expect(disclaimer.classes()).toContain('neutral');
    });

    it('should not render ProgressTable when no results', () => {
      const table = wrapper.findComponent({ name: 'ProgressTable' });
      expect(table.exists()).toBe(false);
    });

    it('should show 0 in footer count', () => {
      expect(wrapper.vm.totalCount).toBe(0);
    });
  });

  describe('Error state', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      shouldUseMockRef.value = false;
      mockAutoWidgetsStore.toolResult.error = true;
      mockAutoWidgetsStore.toolResult.isLoading = false;
      mockAutoWidgetsStore.hasToolResultData = false;
      wrapper = createWrapper();
    });

    afterEach(() => {
      mockAutoWidgetsStore.toolResult.error = false;
    });

    it('should show error disclaimer when error occurs', () => {
      const disclaimer = wrapper.find('[data-testid="disclaimer"]');
      expect(disclaimer.exists()).toBe(true);
      expect(disclaimer.classes()).toContain('error');
    });

    it('should not render ProgressTable when error occurs', () => {
      const table = wrapper.findComponent({ name: 'ProgressTable' });
      expect(table.exists()).toBe(false);
    });

    it('should not show footer when error occurs', () => {
      const footer = wrapper.find('.auto-widget__footer');
      expect(footer.exists()).toBe(false);
    });
  });
});
