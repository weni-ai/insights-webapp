import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { ref } from 'vue';
import ConversationalNps from '../ConversationalNps.vue';

const mockWidgetsStore = {
  currentNpsWidget: ref({
    data: {
      score: 0,
      total_responses: 0,
      promoters: 0,
      passives: 0,
      detractors: 0,
    },
  }),
  isLoadingNpsWidgetData: ref(false),
  npsWidgetData: ref(null),
  npsWidgetType: ref('HUMAN'),
  isNpsHumanConfig: ref(true),
  isNpsAiConfig: ref(false),
  isNpsWidgetDataError: ref(false),
  loadNpsWidgetData: vi.fn().mockResolvedValue({}),
  setNpsWidgetType: vi.fn(),
};

const mockConversationalStore = {
  refreshDataConversational: false,
  setIsDrawerCustomizableOpen: vi.fn(),
  setIsLoadingConversationalData: vi.fn(),
};

const mockRoute = { query: {} };

vi.mock('@/store/modules/conversational/widgets', () => ({
  useConversationalWidgets: () => mockWidgetsStore,
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
        artificial_intelligence: 'AI',
        human_support: 'Human',
        reviews: 'reviews',
        setup_csat_or_nps_widget: {
          title: 'Setup {type}',
          description: 'Description',
          action_text: 'Action',
        },
        customize_your_dashboard: {
          edit_csat_or_nps: 'Edit {type}',
          remove_widget: 'Remove',
        },
        widget_error: { title: 'Error', button: 'Retry' },
        nps_widget: {
          promoters: 'Promoters',
          passive: 'Passive',
          detractors: 'Detractors',
          current_score: 'Score',
          current_score_types: {
            low: 'Low',
            good: 'Good',
            great: 'Great',
            excellent: 'Excellent',
          },
          tooltips: {
            classification: 'Classification',
            low: 'Low',
            good: 'Good',
            great: 'Great',
            excellent: 'Excellent',
          },
        },
      },
    },
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

describe('ConversationalNps', () => {
  let wrapper;

  const createWrapper = (storeOverrides = {}) => {
    Object.assign(mockWidgetsStore, storeOverrides);
    return mount(ConversationalNps, {
      global: {
        stubs: {
          ProgressWidget: true,
          SetupWidget: true,
          ModalRemoveWidget: true,
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockWidgetsStore.currentNpsWidget.value = {
      data: {
        score: 0,
        total_responses: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
      },
    };
    mockWidgetsStore.isLoadingNpsWidgetData.value = false;
    mockWidgetsStore.npsWidgetData.value = null;
    mockWidgetsStore.npsWidgetType.value = 'HUMAN';
    mockWidgetsStore.isNpsHumanConfig.value = true;
    mockWidgetsStore.isNpsAiConfig.value = false;
    mockWidgetsStore.isNpsWidgetDataError.value = false;
    mockConversationalStore.refreshDataConversational = false;
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('renders ProgressWidget', () => {
      const widget = wrapper.findComponent({ name: 'ProgressWidget' });
      expect(widget.exists()).toBe(true);
      expect(widget.props('type')).toBe('nps');
      expect(widget.props('title')).toBe('NPS');
    });

    it('shows setup widget when config is missing', () => {
      mockWidgetsStore.isNpsHumanConfig.value = false;
      wrapper = createWrapper();
      const progressWidget = wrapper.findComponent({ name: 'ProgressWidget' });
      expect(progressWidget.props('progressItems')).toEqual([]);
    });
  });

  describe('Tab handling', () => {
    it('handles tab change to AI', async () => {
      const widget = wrapper.findComponent({ name: 'ProgressWidget' });
      await widget.vm.$emit('tab-change', 'artificial-intelligence');
      expect(mockWidgetsStore.setNpsWidgetType).toHaveBeenCalledWith('AI');
    });

    it('handles tab change to HUMAN', async () => {
      const widget = wrapper.findComponent({ name: 'ProgressWidget' });
      await widget.vm.$emit('tab-change', 'human-support');
      expect(mockWidgetsStore.setNpsWidgetType).toHaveBeenCalledWith('HUMAN');
    });

    it('computes current tab correctly', () => {
      expect(wrapper.vm.currentTab).toBe('human-support');
      mockWidgetsStore.npsWidgetType.value = 'AI';
      wrapper = createWrapper();
      expect(wrapper.vm.currentTab).toBe('artificial-intelligence');
    });
  });

  describe('Data loading', () => {
    it('loads data on mount', () => {
      expect(mockWidgetsStore.loadNpsWidgetData).toHaveBeenCalled();
    });

    it('switches to HUMAN when AI has no config', () => {
      mockWidgetsStore.npsWidgetType.value = 'AI';
      mockWidgetsStore.isNpsAiConfig.value = false;
      wrapper = createWrapper();
      expect(mockWidgetsStore.setNpsWidgetType).toHaveBeenCalledWith('HUMAN');
    });
  });

  describe('Actions', () => {
    it('provides edit and delete actions', () => {
      const actions = wrapper.vm.actions;
      expect(actions).toHaveLength(2);
      expect(actions[0].icon).toBe('edit_square');
      expect(actions[1].icon).toBe('delete');
    });

    it('opens drawer on edit', () => {
      wrapper.vm.actions[0].onClick();
      expect(
        mockConversationalStore.setIsDrawerCustomizableOpen,
      ).toHaveBeenCalledWith(true, 'nps', false);
    });

    it('opens remove modal on delete', () => {
      wrapper.vm.actions[1].onClick();
      expect(wrapper.vm.isRemoveWidgetModalOpen).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('shows error state', () => {
      mockWidgetsStore.isNpsWidgetDataError.value = true;
      wrapper = createWrapper();
      const widget = wrapper.findComponent({ name: 'ProgressWidget' });
      expect(widget.props('isError')).toBe(true);
    });

    it('provides error action', () => {
      mockWidgetsStore.isNpsWidgetDataError.value = true;
      wrapper = createWrapper();
      const errorAction = wrapper.vm.actionError;
      expect(errorAction.title).toBe('Error');
      expect(errorAction.buttonText).toBe('Retry');
    });
  });

  describe('Data formatting', () => {
    it('formats empty data with card', () => {
      const formattedData = wrapper.vm.widgetData;
      expect(formattedData.reviews).toBe(0);
      expect(formattedData.progressItems).toHaveLength(3);
      expect(formattedData.card).toBeDefined();
      expect(formattedData.card.value).toBe('0');
    });

    it('provides card to ProgressWidget', () => {
      const widget = wrapper.findComponent({ name: 'ProgressWidget' });
      expect(widget.props('card')).toBeDefined();
    });

    it('formats footer text', () => {
      expect(wrapper.vm.footerText).toContain('reviews');
    });
  });
});
