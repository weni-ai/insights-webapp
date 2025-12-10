import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { ref } from 'vue';
import ConversationalCsat from '../ConversationalCsat.vue';

const mockWidgetsStore = {
  currentCsatWidget: ref({ data: { results: [], total_responses: 0 } }),
  isLoadingCsatWidgetData: ref(false),
  csatWidgetData: ref(null),
  csatWidgetType: ref('HUMAN'),
  isCsatHumanConfig: ref(true),
  isCsatAiConfig: ref(false),
  isCsatWidgetDataError: ref(false),
  loadCsatWidgetData: vi.fn().mockResolvedValue({}),
  setCsatWidgetType: vi.fn(),
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
        csat_widget: {
          very_satisfied: 'Very Satisfied',
          satisfied: 'Satisfied',
          neutral: 'Neutral',
          dissatisfied: 'Dissatisfied',
          very_dissatisfied: 'Very Dissatisfied',
        },
      },
    },
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

describe('ConversationalCsat', () => {
  let wrapper;

  const createWrapper = (storeOverrides = {}) => {
    Object.assign(mockWidgetsStore, storeOverrides);
    return mount(ConversationalCsat, {
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
    mockWidgetsStore.currentCsatWidget.value = {
      data: { results: [], total_responses: 0 },
    };
    mockWidgetsStore.isLoadingCsatWidgetData.value = false;
    mockWidgetsStore.csatWidgetData.value = null;
    mockWidgetsStore.csatWidgetType.value = 'HUMAN';
    mockWidgetsStore.isCsatHumanConfig.value = true;
    mockWidgetsStore.isCsatAiConfig.value = false;
    mockWidgetsStore.isCsatWidgetDataError.value = false;
    mockConversationalStore.refreshDataConversational = false;
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('renders ProgressWidget', () => {
      const widget = wrapper.findComponent({ name: 'ProgressWidget' });
      expect(widget.exists()).toBe(true);
      expect(widget.props('type')).toBe('csat');
      expect(widget.props('title')).toBe('CSAT');
    });

    it('shows setup widget when config is missing', () => {
      mockWidgetsStore.isCsatHumanConfig.value = false;
      wrapper = createWrapper();
      const progressWidget = wrapper.findComponent({ name: 'ProgressWidget' });
      expect(progressWidget.props('progressItems')).toEqual([]);
    });
  });

  describe('Tab handling', () => {
    it('handles tab change to AI', async () => {
      const widget = wrapper.findComponent({ name: 'ProgressWidget' });
      await widget.vm.$emit('tab-change', 'artificial-intelligence');
      expect(mockWidgetsStore.setCsatWidgetType).toHaveBeenCalledWith('AI');
    });

    it('handles tab change to HUMAN', async () => {
      const widget = wrapper.findComponent({ name: 'ProgressWidget' });
      await widget.vm.$emit('tab-change', 'human-support');
      expect(mockWidgetsStore.setCsatWidgetType).toHaveBeenCalledWith('HUMAN');
    });

    it('computes current tab correctly', () => {
      expect(wrapper.vm.currentTab).toBe('human-support');
      mockWidgetsStore.csatWidgetType.value = 'AI';
      wrapper = createWrapper();
      expect(wrapper.vm.currentTab).toBe('artificial-intelligence');
    });
  });

  describe('Data loading', () => {
    it('loads data on mount', () => {
      expect(mockWidgetsStore.loadCsatWidgetData).toHaveBeenCalled();
    });

    it('switches to HUMAN when AI has no config', () => {
      mockWidgetsStore.csatWidgetType.value = 'AI';
      mockWidgetsStore.isCsatAiConfig.value = false;
      wrapper = createWrapper();
      expect(mockWidgetsStore.setCsatWidgetType).toHaveBeenCalledWith('HUMAN');
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
      ).toHaveBeenCalledWith(true, 'csat', false);
    });

    it('opens remove modal on delete', () => {
      wrapper.vm.actions[1].onClick();
      expect(wrapper.vm.isRemoveWidgetModalOpen).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('shows error state', () => {
      mockWidgetsStore.isCsatWidgetDataError.value = true;
      wrapper = createWrapper();
      const widget = wrapper.findComponent({ name: 'ProgressWidget' });
      expect(widget.props('isError')).toBe(true);
    });

    it('provides error action', () => {
      mockWidgetsStore.isCsatWidgetDataError.value = true;
      wrapper = createWrapper();
      const errorAction = wrapper.vm.actionError;
      expect(errorAction.title).toBe('Error');
      expect(errorAction.buttonText).toBe('Retry');
    });
  });

  describe('Data formatting', () => {
    it('formats empty data correctly', () => {
      const formattedData = wrapper.vm.widgetData;
      expect(formattedData.reviews).toBe(0);
      expect(formattedData.progressItems).toHaveLength(5);
    });

    it('formats footer text', () => {
      expect(wrapper.vm.footerText).toContain('reviews');
    });
  });
});
