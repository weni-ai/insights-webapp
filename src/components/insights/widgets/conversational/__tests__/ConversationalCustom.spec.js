import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { ref } from 'vue';
import ConversationalCustom from '../ConversationalCustom.vue';

const shouldUseMockRef = ref(false);

const mockCustomWidgetsStore = {
  customWidgetDataErrorByUuid: { value: {} },
  loadCustomWidgetData: vi.fn(),
  getCustomWidgetByUuid: vi.fn(() => ({
    name: 'Test Custom',
    data: {
      results: [
        { label: 'A', value: 55, full_value: 8470 },
        { label: 'B', value: 15, full_value: 2310 },
      ],
    },
  })),
  getIsLoadingByUuid: vi.fn(() => false),
  setCustomForm: vi.fn(),
};

const mockConversationalStore = {
  refreshDataConversational: false,
  setIsDrawerCustomizableOpen: vi.fn(),
  setIsLoadingConversationalData: vi.fn(),
  shouldUseMock: shouldUseMockRef,
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
        },
      },
    },
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

describe('ConversationalCustom', () => {
  let wrapper;

  const createWrapper = (props = {}) => {
    return mount(ConversationalCustom, {
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

  describe('Mock mode (shouldUseMock = true)', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      shouldUseMockRef.value = true;
      mockConversationalStore.refreshDataConversational = false;
      mockCustomWidgetsStore.customWidgetDataErrorByUuid = { value: {} };
      mockCustomWidgetsStore.getIsLoadingByUuid.mockReturnValue(false);
      wrapper = createWrapper();
    });

    afterEach(() => {
      shouldUseMockRef.value = false;
    });

    it('should return empty actions in mock mode', () => {
      expect(wrapper.vm.actions).toEqual([]);
    });

    it('should pass empty actions to ProgressWidget', () => {
      const widget = wrapper.findComponent({ name: 'ProgressWidget' });
      expect(widget.props('actions')).toEqual([]);
    });

    it('should not load data on mount when in mock mode', () => {
      expect(
        mockCustomWidgetsStore.loadCustomWidgetData,
      ).not.toHaveBeenCalled();
    });

    it('should pass hiddenTabs to ProgressWidget in mock mode', () => {
      const widget = wrapper.findComponent({ name: 'ProgressWidget' });
      expect(widget.props('hiddenTabs')).toBeTruthy();
    });
  });

  describe('Normal mode (shouldUseMock = false)', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      shouldUseMockRef.value = false;
      mockConversationalStore.refreshDataConversational = false;
      mockCustomWidgetsStore.customWidgetDataErrorByUuid = { value: {} };
      mockCustomWidgetsStore.getIsLoadingByUuid.mockReturnValue(false);
      wrapper = createWrapper();
    });

    it('should load data on mount', () => {
      expect(
        mockCustomWidgetsStore.loadCustomWidgetData,
      ).toHaveBeenCalledWith('test-uuid');
    });

    it('should provide edit and delete actions', () => {
      const actions = wrapper.vm.actions;
      expect(actions).toHaveLength(2);
      expect(actions[0].icon).toBe('edit_square');
      expect(actions[1].icon).toBe('delete');
    });

    it('should not pass hiddenTabs to ProgressWidget', () => {
      const widget = wrapper.findComponent({ name: 'ProgressWidget' });
      expect(widget.props('hiddenTabs')).toBeFalsy();
    });
  });
});
