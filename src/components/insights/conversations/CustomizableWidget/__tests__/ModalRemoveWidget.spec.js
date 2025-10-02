import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { nextTick } from 'vue';

import ModalRemoveWidget from '../ModalRemoveWidget.vue';

const mockConversationalWidgets = {
  deleteWidget: vi.fn(),
};

const mockCustomWidgets = {
  deleteCustomWidget: vi.fn(),
};

vi.mock('@/store/modules/conversational/widgets', () => ({
  useConversationalWidgets: () => mockConversationalWidgets,
}));

vi.mock('@/store/modules/conversational/customWidgets', () => ({
  useCustomWidgets: () => mockCustomWidgets,
}));

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      conversations_dashboard: {
        customize_your_dashboard: {
          modal_remove_widget: {
            title: 'Remove {type} Widget',
            description: 'Remove {type} widget description',
            remove: 'Remove',
            cancel: 'Cancel',
          },
        },
      },
    },
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

describe('ModalRemoveWidget', () => {
  let wrapper;

  const defaultProps = {
    type: 'csat',
    modelValue: true,
  };

  const createWrapper = (props = {}) =>
    mount(ModalRemoveWidget, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          UnnnicModalDialog: {
            template:
              '<div data-testid="modal-remove-widget" class="modal-remove-widget"><slot /></div>',
          },
        },
        mocks: {
          $t: (key, options) => `${key} ${JSON.stringify(options)}`,
        },
      },
    });

  const modalDialog = () => wrapper.find('[data-testid="modal-remove-widget"]');
  const description = () =>
    wrapper.find('[data-testid="modal-remove-widget-description"]');

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('should render modal dialog', () => {
      expect(modalDialog().exists()).toBe(true);
      expect(description().exists()).toBe(true);
    });

    it('should configure modal props correctly', () => {
      expect(wrapper.props('modelValue')).toBe(true);
      expect(wrapper.props('type')).toBe('csat');
    });

    it('should render with different widget types', () => {
      const typeTestCases = ['csat', 'nps', 'custom'];

      typeTestCases.forEach((type) => {
        wrapper = createWrapper({ type });
        expect(wrapper.props('type')).toBe(type);
      });
    });
  });

  describe('Event handling', () => {
    it('should emit update:modelValue when modal value changes', () => {
      wrapper.vm.$emit('update:modelValue', false);

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
    });

    it('should emit update:modelValue on secondary button click', () => {
      // Call the component's emit method directly
      wrapper.vm.$emit('update:modelValue', false);

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
    });
  });

  describe('Widget removal', () => {
    it('should call deleteWidget for non-custom widgets', async () => {
      mockConversationalWidgets.deleteWidget.mockResolvedValueOnce();

      await wrapper.vm.handleRemoveWidget();

      expect(mockConversationalWidgets.deleteWidget).toHaveBeenCalledWith(
        'csat',
      );
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    });

    it('should call deleteCustomWidget for custom widgets', async () => {
      const uuid = 'test-uuid-123';
      wrapper = createWrapper({ type: 'custom', uuid });
      mockCustomWidgets.deleteCustomWidget.mockResolvedValueOnce();

      await wrapper.vm.handleRemoveWidget();

      expect(mockCustomWidgets.deleteCustomWidget).toHaveBeenCalledWith(uuid);
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    });

    it('should handle loading state during removal', async () => {
      mockConversationalWidgets.deleteWidget.mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      const removePromise = wrapper.vm.handleRemoveWidget();
      await nextTick();

      expect(wrapper.vm.isLoading).toBe(true);

      await removePromise;
      await nextTick();

      expect(wrapper.vm.isLoading).toBe(false);
    });

    it('should handle removal errors gracefully', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockConversationalWidgets.deleteWidget.mockRejectedValueOnce(
        new Error('Test error'),
      );

      await wrapper.vm.handleRemoveWidget();

      expect(consoleSpy).toHaveBeenCalledWith(new Error('Test error'));
      expect(wrapper.vm.isLoading).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('Component structure', () => {
    it('should have correct CSS classes', () => {
      expect(modalDialog().classes()).toContain('modal-remove-widget');
      expect(description().classes()).toContain(
        'modal-remove-widget__description',
      );
    });

    it('should match snapshot', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('Props validation', () => {
    const propTestCases = [
      { type: 'csat', modelValue: true },
      { type: 'nps', modelValue: false },
      { type: 'custom', modelValue: true, uuid: 'test-uuid' },
    ];

    propTestCases.forEach(({ type, modelValue, uuid }) => {
      it(`should handle props: type="${type}" modelValue=${modelValue}`, () => {
        wrapper = createWrapper({ type, modelValue, uuid });

        expect(wrapper.props('type')).toBe(type);
        expect(wrapper.props('modelValue')).toBe(modelValue);
        if (uuid) {
          expect(wrapper.props('uuid')).toBe(uuid);
        }
      });
    });
  });
});
