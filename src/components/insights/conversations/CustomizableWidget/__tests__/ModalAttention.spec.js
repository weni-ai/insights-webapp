import { beforeEach, describe, expect, it } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import ModalAttention from '../ModalAttention.vue';

config.global.plugins = [
  createI18n({
    legacy: false,
  }),
];

describe('ModalAttention', () => {
  let wrapper;

  const modalDialog = () =>
    wrapper.findComponent('[data-testid="modal-attention"]');

  const dialogStubs = {
    UnnnicDialog: {
      name: 'UnnnicDialog',
      template: '<div data-testid="modal-attention"><slot /></div>',
      props: ['open'],
      emits: ['update:open'],
    },
    UnnnicDialogContent: { template: '<div><slot /></div>' },
    UnnnicDialogHeader: { template: '<div><slot /></div>' },
    UnnnicDialogTitle: { template: '<div><slot /></div>' },
    UnnnicDialogFooter: { template: '<div><slot /></div>' },
    UnnnicButton: {
      name: 'UnnnicButton',
      template: '<button type="button" />',
    },
  };

  const createWrapper = (props = {}) => {
    return mount(ModalAttention, {
      props: {
        type: 'cancel',
        modelValue: false,
        ...props,
      },
      global: {
        stubs: dialogStubs,
      },
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Component Structure', () => {
    it('should render the UnnnicDialog component', () => {
      expect(modalDialog().exists()).toBe(true);
    });

    it('should render with correct default props', () => {
      expect(wrapper.props('type')).toBe('cancel');
      expect(wrapper.props('modelValue')).toBe(false);
    });
  });

  describe('Props', () => {
    it('should accept type prop with cancel value', () => {
      wrapper = createWrapper({ type: 'cancel' });
      expect(wrapper.props('type')).toBe('cancel');
    });

    it('should accept type prop with return value', () => {
      wrapper = createWrapper({ type: 'return' });
      expect(wrapper.props('type')).toBe('return');
    });

    it('should accept modelValue prop', () => {
      wrapper = createWrapper({ modelValue: true });
      expect(wrapper.props('modelValue')).toBe(true);
    });
  });

  describe('Computed Properties', () => {
    describe('title', () => {
      it('should return correct title for cancel type', () => {
        wrapper = createWrapper({ type: 'cancel' });
        expect(wrapper.vm.title).toBe(
          'conversations_dashboard.customize_your_dashboard.modal_attention.title_cancel',
        );
      });

      it('should return correct title for return type', () => {
        wrapper = createWrapper({ type: 'return' });
        expect(wrapper.vm.title).toBe(
          'conversations_dashboard.customize_your_dashboard.modal_attention.title_return',
        );
      });
    });

    describe('description', () => {
      it('should return correct description for cancel type', () => {
        wrapper = createWrapper({ type: 'cancel' });
        expect(wrapper.vm.description).toBe(
          'conversations_dashboard.customize_your_dashboard.modal_attention.description_cancel',
        );
      });

      it('should return correct description for return type', () => {
        wrapper = createWrapper({ type: 'return' });
        expect(wrapper.vm.description).toBe(
          'conversations_dashboard.customize_your_dashboard.modal_attention.description_return',
        );
      });
    });

    describe('primaryButtonText', () => {
      it('should return correct primary button text for cancel type', () => {
        wrapper = createWrapper({ type: 'cancel' });
        expect(wrapper.vm.primaryButtonText).toBe(
          'conversations_dashboard.customize_your_dashboard.modal_attention.cancel',
        );
      });

      it('should return correct primary button text for return type', () => {
        wrapper = createWrapper({ type: 'return' });
        expect(wrapper.vm.primaryButtonText).toBe(
          'conversations_dashboard.customize_your_dashboard.modal_attention.return',
        );
      });
    });
  });

  describe('Event Emissions', () => {
    it('should emit primary-button-click when primary button is clicked', async () => {
      const buttons = wrapper.findAllComponents({ name: 'UnnnicButton' });
      await buttons[1].trigger('click');

      expect(wrapper.emitted('primary-button-click')).toBeTruthy();
      expect(wrapper.emitted('primary-button-click')).toHaveLength(1);
    });

    it('should emit secondary-button-click when secondary button is clicked', async () => {
      const buttons = wrapper.findAllComponents({ name: 'UnnnicButton' });
      await buttons[0].trigger('click');

      expect(wrapper.emitted('secondary-button-click')).toBeTruthy();
      expect(wrapper.emitted('secondary-button-click')).toHaveLength(1);
    });
  });

  describe('Content Rendering', () => {
    it('should render the description in the modal content', () => {
      wrapper = createWrapper({ type: 'cancel' });

      expect(wrapper.text()).toContain(wrapper.vm.description);
    });

    it('should update content when type prop changes', async () => {
      wrapper = createWrapper({ type: 'cancel' });
      const initialDescription = wrapper.vm.description;

      await wrapper.setProps({ type: 'return' });
      const newDescription = wrapper.vm.description;

      expect(initialDescription).not.toBe(newDescription);
      expect(newDescription).toBe(
        'conversations_dashboard.customize_your_dashboard.modal_attention.description_return',
      );
    });
  });

  describe('Internationalization', () => {
    it('should call translation function for all text content', () => {
      wrapper = createWrapper({ type: 'cancel' });

      // Verify that computed properties return translation keys
      expect(wrapper.vm.title).toContain('conversations_dashboard');
      expect(wrapper.vm.description).toContain('conversations_dashboard');
      expect(wrapper.vm.primaryButtonText).toContain('conversations_dashboard');
    });
  });

  describe('Type Validation', () => {
    it('should work with cancel type', () => {
      wrapper = createWrapper({ type: 'cancel' });
      expect(wrapper.vm.type).toBe('cancel');
      expect(wrapper.vm.title).toContain('title_cancel');
    });

    it('should work with return type', () => {
      wrapper = createWrapper({ type: 'return' });
      expect(wrapper.vm.type).toBe('return');
      expect(wrapper.vm.title).toContain('title_return');
    });
  });

  describe('Component Integration', () => {
    it('should integrate properly with parent components', () => {
      wrapper = createWrapper({
        type: 'return',
        modelValue: true,
      });

      expect(modalDialog().exists()).toBe(true);
      expect(modalDialog().props('open')).toBe(true);
    });

    it('should maintain reactive properties when props change', async () => {
      wrapper = createWrapper({ type: 'cancel', modelValue: false });

      await wrapper.setProps({ type: 'return', modelValue: true });

      expect(wrapper.vm.type).toBe('return');
      expect(wrapper.props('modelValue')).toBe(true);
      expect(wrapper.vm.title).toContain('title_return');
    });
  });
});
