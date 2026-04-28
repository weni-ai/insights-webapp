import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { ref } from 'vue';

import ConversationalExport from '../ConversationalExport.vue';

const mockStore = {
  isRenderExportData: ref(false),
  isRenderExportDataFeedback: ref(false),
  hasEnabledToExport: ref(true),
  isLoadingCreateExport: ref(false),
  isLoadingCheckExportStatus: ref(false),
  export_data: ref({ status: 'ready' }),
  setIsRenderExportData: vi.fn((value) => {
    mockStore.isRenderExportData.value = value;
  }),
  setIsRenderExportDataFeedback: vi.fn((value) => {
    mockStore.isRenderExportDataFeedback.value = value;
  }),
  createExport: vi.fn(),
  checkExportStatus: vi.fn(),
};

const shouldUseMockRef = ref(false);

const mockConversationalStore = {
  shouldUseMock: shouldUseMockRef,
};

vi.mock('@/store/modules/export/conversational/export', () => ({
  useConversationalExport: () => mockStore,
}));

vi.mock('@/store/modules/conversational/conversational', () => ({
  useConversational: () => mockConversationalStore,
}));

vi.mock('@vueuse/core', () => ({
  useElementVisibility: vi.fn(() => ref(true)),
}));

vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    storeToRefs: (store) => store,
  };
});

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      export_data: {
        title: 'Export Data',
        tooltip: 'Tooltip text',
        save_btn: 'Save',
        cancel_btn: 'Cancel',
        feedback_title: 'Success',
        feedback: 'Export successful',
      },
    },
  },
});

config.global.plugins = [i18n];

describe('ConversationalExport', () => {
  let wrapper;

  const createWrapper = () => {
    return mount(ConversationalExport, {
      global: {
        stubs: {
          UnnnicButton: true,
          UnnnicToolTip: true,
          UnnnicDialogContent: {
            inheritAttrs: true,
            template:
              '<div class="unnnic-dialog-content-stub" v-bind="$attrs"><slot /></div>',
          },
          FormExport: true,
        },
      },
    });
  };

  const section = () => wrapper.find('[data-testid="modal-export-data"]');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockStore.setIsRenderExportData.mockImplementation((value) => {
      mockStore.isRenderExportData.value = value;
    });
    mockStore.setIsRenderExportDataFeedback.mockImplementation((value) => {
      mockStore.isRenderExportDataFeedback.value = value;
    });
    shouldUseMockRef.value = false;

    mockStore.isRenderExportData.value = false;
    mockStore.isRenderExportDataFeedback.value = false;
    mockStore.hasEnabledToExport.value = true;
    mockStore.isLoadingCreateExport.value = false;
    mockStore.isLoadingCheckExportStatus.value = false;
    mockStore.export_data.value = { status: 'ready' };

    wrapper = createWrapper();
  });

  afterEach(() => {
    vi.useRealTimers();
    wrapper.unmount();
  });

  describe('Component rendering', () => {
    it('should render main section', () => {
      expect(section().exists()).toBe(true);
    });

    it('should render tooltip', () => {
      const tooltip = wrapper.find('[data-testid="tooltip-trigger"]');
      expect(tooltip.exists()).toBe(true);
    });
  });

  describe('Computed properties', () => {
    it('should compute hasExportData as true when status is ready', () => {
      mockStore.export_data.value = { status: 'ready' };

      expect(wrapper.vm.hasExportData).toBe(true);
    });

    it('should compute hasExportData as true when status is READY (uppercase)', () => {
      mockStore.export_data.value = { status: 'READY' };

      expect(wrapper.vm.hasExportData).toBe(true);
    });

    it('should compute hasExportData as false when status is not ready', () => {
      mockStore.export_data.value = { status: 'processing' };

      expect(wrapper.vm.hasExportData).toBe(false);
    });

    it('should handle null export_data', () => {
      mockStore.export_data.value = null;

      expect(wrapper.vm.hasExportData).toBe(false);
    });
  });

  describe('Lifecycle hooks', () => {
    it('should call checkExportStatus on mounted', () => {
      expect(mockStore.checkExportStatus).toHaveBeenCalled();
    });

    it('should start polling on mounted', () => {
      vi.advanceTimersByTime(60000);
      expect(mockStore.checkExportStatus).toHaveBeenCalledTimes(2);
    });

    it('should stop polling on unmounted', () => {
      const checkCallCount = mockStore.checkExportStatus.mock.calls.length;
      wrapper.unmount();

      vi.advanceTimersByTime(60000);
      expect(mockStore.checkExportStatus).toHaveBeenCalledTimes(checkCallCount);
    });
  });

  describe('Polling logic', () => {
    it('should poll every 60 seconds', () => {
      const initialCalls = mockStore.checkExportStatus.mock.calls.length;

      vi.advanceTimersByTime(60000);
      expect(mockStore.checkExportStatus).toHaveBeenCalledTimes(
        initialCalls + 1,
      );

      vi.advanceTimersByTime(60000);
      expect(mockStore.checkExportStatus).toHaveBeenCalledTimes(
        initialCalls + 2,
      );
    });

    it('should clear previous interval when starting new polling', () => {
      wrapper.vm.startPolling();
      const firstInterval = wrapper.vm.pollingInterval;

      wrapper.vm.startPolling();
      const secondInterval = wrapper.vm.pollingInterval;

      expect(firstInterval).not.toBe(secondInterval);
    });

    it('should clear interval on stopPolling', () => {
      wrapper.vm.stopPolling();
      expect(wrapper.vm.pollingInterval).toBeNull();
    });
  });

  describe('Modal dialogs', () => {
    it('should render export modal', () => {
      const modal = wrapper.find('[data-testid="modal-dialog"]');
      expect(modal.exists()).toBe(true);
    });

    it('should render export modal with correct value when open', () => {
      mockStore.isRenderExportData.value = true;

      const modal = wrapper.find('[data-testid="modal-dialog"]');
      expect(modal.exists()).toBe(true);
    });

    it('should render feedback modal', () => {
      const modal = wrapper.find('[data-testid="modal-dialog-feedback"]');
      expect(modal.exists()).toBe(true);
    });

    it('should render feedback modal with correct value when open', () => {
      mockStore.isRenderExportDataFeedback.value = true;

      const modal = wrapper.find('[data-testid="modal-dialog-feedback"]');
      expect(modal.exists()).toBe(true);
    });
  });

  describe('Component structure', () => {
    it('should have correct CSS classes', () => {
      expect(section().classes()).toContain('modal-export-data');
    });

    it('should match snapshot', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('Mock mode (shouldUseMock = true)', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockStore.setIsRenderExportData.mockImplementation((value) => {
        mockStore.isRenderExportData.value = value;
      });
      mockStore.setIsRenderExportDataFeedback.mockImplementation((value) => {
        mockStore.isRenderExportDataFeedback.value = value;
      });
      shouldUseMockRef.value = true;
      wrapper = createWrapper();
    });

    afterEach(() => {
      shouldUseMockRef.value = false;
    });

    it('should disable export button when shouldUseMock is true', () => {
      const button = wrapper.find('[data-testid="export-data-button"]');
      expect(button.attributes('disabled')).toBeDefined();
    });

    it('should disable export button even when hasExportData is true', () => {
      mockStore.export_data.value = { status: 'ready' };
      expect(wrapper.vm.hasExportData).toBe(true);
      const button = wrapper.find('[data-testid="export-data-button"]');
      expect(button.attributes('disabled')).toBeDefined();
    });
  });
});
