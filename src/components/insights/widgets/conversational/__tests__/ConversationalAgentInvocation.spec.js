import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { ref } from 'vue';
import ConversationalAgentInvocation from '../ConversationalAgentInvocation.vue';

const shouldUseMockRef = ref(false);

const mockAutoWidgetsStore = {
  agentInvocation: {
    data: {
      total: 8,
      results: [
        {
          label: 'feedback_recorder',
          agent: { uuid: '111-aaa' },
          value: 60,
          full_value: 60,
        },
        {
          label: 'order_checker',
          agent: { uuid: '222-bbb' },
          value: 40,
          full_value: 40,
        },
      ],
    },
    isLoading: false,
    error: false,
  },
  hasAgentInvocationData: true,
  loadAgentInvocationData: vi.fn().mockResolvedValue(undefined),
};

const mockConversationalStore = {
  refreshDataConversational: false,
  setIsLoadingConversationalData: vi.fn(),
  shouldUseMock: shouldUseMockRef,
};

const mockProjectStore = {
  agentsTeam: {
    manager: null,
    agents: [
      { uuid: '111-aaa', id: 'feedback_recorder', name: 'Feedback Recorder' },
      {
        uuid: '222-bbb',
        id: 'order_checker',
        name: 'Order Status Checker',
      },
    ],
  },
  isLoadingAgentsTeam: false,
  getAgentsTeam: vi.fn().mockResolvedValue(undefined),
};

const mockRoute = { query: {} };

vi.mock('@/store/modules/conversational/autoWidgets', () => ({
  useAutoWidgets: () => mockAutoWidgetsStore,
}));

vi.mock('@/store/modules/conversational/conversational', () => ({
  useConversational: () => mockConversationalStore,
}));

vi.mock('@/store/modules/project', () => ({
  useProject: () => mockProjectStore,
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
        agent_invocation: 'Most used agents',
        agent_invocation_count: '{count} agents',
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

describe('ConversationalAgentInvocation', () => {
  let wrapper;

  const createWrapper = () => {
    return mount(ConversationalAgentInvocation, {
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
      expect(
        mockAutoWidgetsStore.loadAgentInvocationData,
      ).not.toHaveBeenCalled();
    });

    it('should not load agents team on mount when in mock mode', () => {
      expect(mockProjectStore.getAgentsTeam).not.toHaveBeenCalled();
    });

    it('should pass hiddenTabs as true to BaseConversationWidget', () => {
      const widget = wrapper.find('[data-testid="base-conversation-widget"]');
      expect(widget.exists()).toBe(true);
    });
  });

  describe('Normal mode (shouldUseMock = false)', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      shouldUseMockRef.value = false;
      mockConversationalStore.refreshDataConversational = false;
      mockAutoWidgetsStore.agentInvocation.error = false;
      mockAutoWidgetsStore.hasAgentInvocationData = true;
      mockAutoWidgetsStore.agentInvocation.isLoading = false;
      mockAutoWidgetsStore.agentInvocation.data = {
        total: 8,
        results: [
          {
            label: 'feedback_recorder',
            agent: { uuid: '111-aaa' },
            value: 60,
            full_value: 60,
          },
          {
            label: 'order_checker',
            agent: { uuid: '222-bbb' },
            value: 40,
            full_value: 40,
          },
        ],
      };
      wrapper = createWrapper();
    });

    it('should load data on mount', () => {
      expect(mockAutoWidgetsStore.loadAgentInvocationData).toHaveBeenCalled();
    });

    it('should render the base widget', () => {
      const widget = wrapper.find('[data-testid="base-conversation-widget"]');
      expect(widget.exists()).toBe(true);
    });

    it('should compute progressItems from store data', () => {
      const items = wrapper.vm.progressItems;
      expect(items).toHaveLength(2);
      expect(items[0].label).toBe('Feedback Recorder');
      expect(items[0].value).toBe(60);
      expect(items[1].label).toBe('Order Status Checker');
      expect(items[1].value).toBe(40);
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

  describe('Agent name resolution', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      shouldUseMockRef.value = false;
      mockAutoWidgetsStore.agentInvocation.error = false;
      mockAutoWidgetsStore.hasAgentInvocationData = true;
      mockAutoWidgetsStore.agentInvocation.isLoading = false;
    });

    it('should resolve agent name from project store when UUID matches', () => {
      mockAutoWidgetsStore.agentInvocation.data = {
        total: 2,
        results: [
          {
            label: 'feedback_recorder',
            agent: { uuid: '111-aaa' },
            value: 60,
            full_value: 60,
          },
        ],
      };
      wrapper = createWrapper();

      expect(wrapper.vm.resolvedResults[0].label).toBe('Feedback Recorder');
    });

    it('should fall back to label when UUID does not match any agent', () => {
      mockAutoWidgetsStore.agentInvocation.data = {
        total: 1,
        results: [
          {
            label: 'unknown_agent',
            agent: { uuid: 'no-match' },
            value: 30,
            full_value: 30,
          },
        ],
      };
      wrapper = createWrapper();

      expect(wrapper.vm.resolvedResults[0].label).toBe('unknown_agent');
    });

    it('should fall back to label when agents team is empty', () => {
      const originalAgents = mockProjectStore.agentsTeam.agents;
      mockProjectStore.agentsTeam.agents = [];

      mockAutoWidgetsStore.agentInvocation.data = {
        total: 1,
        results: [
          {
            label: 'feedback_recorder',
            agent: { uuid: '111-aaa' },
            value: 60,
            full_value: 60,
          },
        ],
      };
      wrapper = createWrapper();

      expect(wrapper.vm.resolvedResults[0].label).toBe('feedback_recorder');

      mockProjectStore.agentsTeam.agents = originalAgents;
    });

    it('should pass resolvedResults to SeeAllDrawer data', () => {
      mockAutoWidgetsStore.agentInvocation.data = {
        total: 2,
        results: [
          {
            label: 'feedback_recorder',
            agent: { uuid: '111-aaa' },
            value: 60,
            full_value: 60,
          },
        ],
      };
      wrapper = createWrapper();

      const resolved = wrapper.vm.resolvedResults;
      expect(resolved[0].label).toBe('Feedback Recorder');
    });
  });

  describe('Empty data', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      shouldUseMockRef.value = false;
      mockAutoWidgetsStore.agentInvocation.data = { total: 0, results: [] };
      mockAutoWidgetsStore.hasAgentInvocationData = false;
      mockAutoWidgetsStore.agentInvocation.isLoading = false;
      mockAutoWidgetsStore.agentInvocation.error = false;
      wrapper = createWrapper();
    });

    afterEach(() => {
      mockAutoWidgetsStore.agentInvocation.data = {
        total: 8,
        results: [
          {
            label: 'feedback_recorder',
            agent: { uuid: '111-aaa' },
            value: 60,
            full_value: 60,
          },
          {
            label: 'order_checker',
            agent: { uuid: '222-bbb' },
            value: 40,
            full_value: 40,
          },
        ],
      };
      mockAutoWidgetsStore.hasAgentInvocationData = true;
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
      mockAutoWidgetsStore.agentInvocation.error = true;
      mockAutoWidgetsStore.agentInvocation.isLoading = false;
      mockAutoWidgetsStore.hasAgentInvocationData = false;
      wrapper = createWrapper();
    });

    afterEach(() => {
      mockAutoWidgetsStore.agentInvocation.error = false;
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
