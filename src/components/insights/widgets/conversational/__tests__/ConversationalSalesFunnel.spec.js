import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import ConversationalSalesFunnel from '../ConversationalSalesFunnel.vue';

const mockWidgetsStore = {
  isLoadingSalesFunnelWidgetData: { value: false },
  isSalesFunnelWidgetDataError: { value: false },
  loadSalesFunnelWidgetData: vi.fn(),
};

const mockConversationalStore = {
  refreshDataConversational: false,
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
        sales_funnel: 'Sales Funnel',
        customize_your_dashboard: {
          remove_widget: 'Remove Widget',
        },
        widget_error: {
          title: 'Error Title',
          button: 'Error Button',
        },
      },
    },
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

describe('ConversationalSalesFunnel', () => {
  let wrapper;

  const createWrapper = (storeOverrides = {}) => {
    Object.assign(mockWidgetsStore, storeOverrides);
    return mount(ConversationalSalesFunnel, {
      global: {
        stubs: {
          ProgressWidget: true,
          ModalRemoveWidget: true,
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mockWidgetsStore, {
      isLoadingSalesFunnelWidgetData: { value: false },
      isSalesFunnelWidgetDataError: { value: false },
    });
    mockConversationalStore.refreshDataConversational = false;
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('renders ProgressWidget', () => {
      const widget = wrapper.findComponent({ name: 'ProgressWidget' });
      expect(widget.exists()).toBe(true);
      expect(widget.props('type')).toBe('sales_funnel');
    });

    it('renders with translated title', () => {
      expect(wrapper.vm.title).toBe('Sales Funnel');
    });

    it('passes empty progress items', () => {
      const widget = wrapper.findComponent({ name: 'ProgressWidget' });
      expect(widget.props('progressItems')).toEqual([]);
    });
  });

  describe('Data loading', () => {
    it('loads data on mount', () => {
      expect(mockWidgetsStore.loadSalesFunnelWidgetData).toHaveBeenCalled();
    });

    it('shows loading state', () => {
      wrapper = createWrapper({
        isLoadingSalesFunnelWidgetData: { value: true },
      });
      const widget = wrapper.findComponent({ name: 'ProgressWidget' });
      expect(widget.props('isLoading')).toBe(true);
    });
  });

  describe('Actions', () => {
    it('provides only delete action', () => {
      const actions = wrapper.vm.actions;
      expect(actions).toHaveLength(1);
      expect(actions[0].icon).toBe('delete');
      expect(actions[0].text).toBe('Remove Widget');
      expect(actions[0].scheme).toBe('aux-red-500');
    });

    it('opens remove modal on delete', () => {
      wrapper.vm.actions[0].onClick();
      expect(wrapper.vm.isRemoveWidgetModalOpen).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('shows error state', () => {
      wrapper = createWrapper({
        isSalesFunnelWidgetDataError: { value: true },
      });
      const widget = wrapper.findComponent({ name: 'ProgressWidget' });
      expect(widget.props('isError')).toBe(true);
    });

    it('provides error action that opens modal', () => {
      wrapper = createWrapper({
        isSalesFunnelWidgetDataError: { value: true },
      });
      const errorAction = wrapper.vm.actionError;
      expect(errorAction.title).toBe('Error Title');
      expect(errorAction.buttonText).toBe('Error Button');
      errorAction.onClick();
      expect(wrapper.vm.isRemoveWidgetModalOpen).toBe(true);
    });
  });

  describe('Modal rendering', () => {
    it('does not show modal initially', () => {
      const modal = wrapper.findComponent({ name: 'ModalRemoveWidget' });
      expect(modal.exists()).toBe(false);
    });

    it('shows modal when triggered', async () => {
      wrapper.vm.isRemoveWidgetModalOpen = true;
      await wrapper.vm.$nextTick();
      const modal = wrapper.findComponent({ name: 'ModalRemoveWidget' });
      expect(modal.exists()).toBe(true);
    });
  });
});
