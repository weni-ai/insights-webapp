import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import ConversationalCrosstab from '../ConversationalCrosstab.vue';

const mockCustomWidgetsStore = {
  customWidgetDataErrorByUuid: { value: {} },
  loadCustomWidgetData: vi.fn(),
  getCustomWidgetByUuid: vi.fn(() => ({
    name: 'Test Crosstab',
    data: { results: [], total_rows: 0 },
  })),
  getIsLoadingByUuid: vi.fn(() => false),
  setCrosstabForm: vi.fn(),
};

const mockConversationalStore = {
  refreshDataConversational: false,
  setIsDrawerCustomizableOpen: vi.fn(),
  setIsLoadingConversationalData: vi.fn(),
};

const mockRoute = { query: {} };

vi.mock('@/store/modules/conversational/customWidgets', () => ({
  useCustomWidgets: () => mockCustomWidgetsStore,
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
        customize_your_dashboard: {
          edit_csat_or_nps: 'Edit',
          remove_widget: 'Remove',
        },
        widget_error: {
          title: 'Error',
          button: 'Retry',
          crosstab_validation_title: 'Validation Error',
          crosstab_validation_description: 'Invalid configuration',
        },
      },
    },
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

describe('ConversationalCrosstab', () => {
  let wrapper;

  const createWrapper = (props = {}, storeOverrides = {}) => {
    Object.assign(mockCustomWidgetsStore, storeOverrides);
    return mount(ConversationalCrosstab, {
      props: { uuid: 'test-uuid', ...props },
      global: {
        stubs: {
          ProgressWidget: true,
          ModalRemoveWidget: true,
          SeeAllDrawer: true,
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCustomWidgetsStore.customWidgetDataErrorByUuid = { value: {} };
    mockCustomWidgetsStore.getCustomWidgetByUuid.mockReturnValue({
      name: 'Test Crosstab',
      data: { results: [], total_rows: 0 },
    });
    mockCustomWidgetsStore.getIsLoadingByUuid.mockReturnValue(false);
    mockConversationalStore.refreshDataConversational = false;
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('renders ProgressWidget', () => {
      const widget = wrapper.findComponent({ name: 'ProgressWidget' });
      expect(widget.exists()).toBe(true);
      expect(widget.props('type')).toBe('crosstab');
      expect(widget.props('title')).toBe('Test Crosstab');
    });

    it('uses CROSSTAB as fallback title', () => {
      mockCustomWidgetsStore.getCustomWidgetByUuid.mockReturnValue(null);
      wrapper = createWrapper();
      expect(wrapper.vm.titleWidget).toBe('CROSSTAB');
    });

    it('passes uuid prop correctly', () => {
      wrapper = createWrapper({ uuid: 'custom-uuid' });
      const widget = wrapper.findComponent({ name: 'ProgressWidget' });
      expect(widget.props('uuid')).toBe('custom-uuid');
    });
  });

  describe('Data loading', () => {
    it('loads data on mount', () => {
      expect(mockCustomWidgetsStore.loadCustomWidgetData).toHaveBeenCalledWith(
        'test-uuid',
      );
    });

    it('checks loading state', () => {
      mockCustomWidgetsStore.getIsLoadingByUuid.mockReturnValue(true);
      wrapper = createWrapper();
      expect(wrapper.vm.isLoading).toBe(true);
    });
  });

  describe('Actions', () => {
    it('provides edit and delete actions', () => {
      const actions = wrapper.vm.actions;
      expect(actions).toHaveLength(2);
      expect(actions[0].icon).toBe('edit_square');
      expect(actions[1].icon).toBe('delete');
    });

    it('opens drawer on edit with form data', () => {
      mockCustomWidgetsStore.getCustomWidgetByUuid.mockReturnValue({
        uuid: 'test-uuid',
        name: 'Test',
        config: {
          source_a: { key: 'key_a', field_name: 'field_a' },
          source_b: { key: 'key_b', field_name: 'field_b' },
        },
      });
      wrapper = createWrapper();
      wrapper.vm.actions[0].onClick();
      expect(mockCustomWidgetsStore.setCrosstabForm).toHaveBeenCalled();
      expect(
        mockConversationalStore.setIsDrawerCustomizableOpen,
      ).toHaveBeenCalledWith(true, 'crosstab', false);
    });

    it('opens remove modal on delete', () => {
      wrapper.vm.actions[1].onClick();
      expect(wrapper.vm.isRemoveWidgetModalOpen).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('shows standard error', () => {
      mockCustomWidgetsStore.customWidgetDataErrorByUuid = {
        value: { 'test-uuid': 500 },
      };
      wrapper = createWrapper();
      const widget = wrapper.findComponent({ name: 'ProgressWidget' });
      expect(widget.props('isError')).toBe(true);
      expect(wrapper.vm.actionError.title).toBe('Error');
    });

    it('shows validation error for 4xx codes', () => {
      mockCustomWidgetsStore.customWidgetDataErrorByUuid = {
        value: { 'test-uuid': 400 },
      };
      wrapper = createWrapper();
      const errorAction = wrapper.vm.actionError;
      expect(errorAction.title).toBe('Validation Error');
      expect(errorAction.description).toBeDefined();
    });
  });

  describe('Expanded state', () => {
    it('shows expanded when results > 5', () => {
      mockCustomWidgetsStore.getCustomWidgetByUuid.mockReturnValue({
        data: { results: new Array(6).fill({}) },
      });
      wrapper = createWrapper();
      expect(wrapper.vm.isExpanded).toBe(true);
    });

    it('opens see all drawer', () => {
      wrapper.vm.handleOpenExpanded();
      expect(wrapper.vm.isSeeAllDrawerOpen).toBe(true);
    });
  });

  describe('Widget properties', () => {
    it('sets isOnlyTab to true', () => {
      const widget = wrapper.findComponent({ name: 'ProgressWidget' });
      expect(widget.props('isOnlyTab')).toBe(true);
    });

    it('returns empty progress items', () => {
      expect(wrapper.vm.progressItems).toEqual([]);
    });

    it('uses AI tab', () => {
      expect(wrapper.vm.currentTab).toBe('artificial-intelligence');
    });
  });
});
