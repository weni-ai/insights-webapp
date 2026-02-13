import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import DataFeedbackModal from '../DataFeedbackModal.vue';

config.global.plugins = [
  createI18n({
    legacy: false,
  }),
];

const unnnicStubs = {
  UnnnicDialog: {
    template: '<div data-testid="feedback-dialog"><slot /></div>',
    props: ['open'],
  },
  UnnnicDialogContent: {
    template: '<div><slot /></div>',
    props: ['size'],
  },
  UnnnicDialogHeader: { template: '<div><slot /></div>' },
  UnnnicDialogTitle: { template: '<div><slot /></div>' },
  UnnnicDialogFooter: { template: '<div><slot /></div>' },
  UnnnicDialogClose: { template: '<div><slot /></div>' },
  UnnnicButton: {
    template: '<button :data-testid="$attrs[`data-testid`]"></button>',
    props: ['text', 'type', 'disabled'],
  },
  UnnnicRadioGroup: {
    template: '<div :data-testid="$attrs[`data-testid`]"><slot /></div>',
    props: ['modelValue', 'label'],
    emits: ['update:modelValue'],
  },
  UnnnicRadio: { template: '<div></div>', props: ['value', 'label'] },
  UnnnicTextArea: {
    template: '<div data-testid="feedback-textarea"></div>',
    props: ['modelValue', 'label', 'placeholder', 'maxLength'],
    emits: ['update:modelValue'],
  },
};

const createWrapper = (props = {}) => {
  return shallowMount(DataFeedbackModal, {
    props: { modelValue: true, ...props },
    global: { stubs: unnnicStubs },
  });
};

describe('DataFeedbackModal', () => {
  let wrapper;

  beforeEach(() => {
    vi.restoreAllMocks();
    wrapper = createWrapper();
  });

  const findDialog = () =>
    wrapper.findComponent('[data-testid="feedback-dialog"]');
  const findBody = () => wrapper.find('[data-testid="feedback-modal-body"]');
  const findDescription = () =>
    wrapper.find('[data-testid="feedback-modal-description"]');
  const findRadioTrust = () =>
    wrapper.findComponent('[data-testid="feedback-radio-trust"]');
  const findRadioDecisions = () =>
    wrapper.findComponent('[data-testid="feedback-radio-decisions"]');
  const findRadioImpact = () =>
    wrapper.findComponent('[data-testid="feedback-radio-impact"]');
  const findTextarea = () =>
    wrapper.findComponent('[data-testid="feedback-textarea"]');
  const findSubmitButton = () =>
    wrapper.findComponent('[data-testid="feedback-submit-button"]');
  const findPostponeButton = () =>
    wrapper.findComponent('[data-testid="feedback-postpone-button"]');

  const fillAllRadioGroups = async () => {
    await findRadioTrust().vm.$emit('update:modelValue', 'strongly_agree');
    await findRadioDecisions().vm.$emit('update:modelValue', 'neutral');
    await findRadioImpact().vm.$emit(
      'update:modelValue',
      'partially_disagree',
    );
  };

  describe('Initial render', () => {
    it('should render all main elements', () => {
      expect(findDialog().exists()).toBe(true);
      expect(findBody().exists()).toBe(true);
      expect(findDescription().exists()).toBe(true);
      expect(findRadioTrust().exists()).toBe(true);
      expect(findRadioDecisions().exists()).toBe(true);
      expect(findRadioImpact().exists()).toBe(true);
      expect(findTextarea().exists()).toBe(true);
      expect(findSubmitButton().exists()).toBe(true);
      expect(findPostponeButton().exists()).toBe(true);
    });

    it('should pass open prop to dialog', () => {
      expect(findDialog().props('open')).toBe(true);
    });

    it('should pass open as false when modelValue is false', () => {
      wrapper = createWrapper({ modelValue: false });
      expect(findDialog().props('open')).toBe(false);
    });

    it('should configure textarea with maxLength 1000', () => {
      expect(findTextarea().props('maxLength')).toBe(1000);
    });
  });

  describe('Form validation', () => {
    it('should disable submit button when no radio groups are filled', () => {
      expect(findSubmitButton().props('disabled')).toBe(true);
    });

    it('should disable submit button when only one radio group is filled', async () => {
      await findRadioTrust().vm.$emit('update:modelValue', 'strongly_agree');
      expect(findSubmitButton().props('disabled')).toBe(true);
    });

    it('should disable submit button when only two radio groups are filled', async () => {
      await findRadioTrust().vm.$emit('update:modelValue', 'strongly_agree');
      await findRadioDecisions().vm.$emit('update:modelValue', 'neutral');
      expect(findSubmitButton().props('disabled')).toBe(true);
    });

    it('should enable submit button when all three radio groups are filled', async () => {
      await fillAllRadioGroups();
      expect(findSubmitButton().props('disabled')).toBe(false);
    });
  });

  describe('Submit', () => {
    it('should log feedback data and emit close on submit', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      await fillAllRadioGroups();
      await findTextarea().vm.$emit('update:modelValue', 'Great dashboard');
      await findSubmitButton().vm.$emit('click');

      expect(consoleSpy).toHaveBeenCalledWith('Feedback submitted:', {
        trustData: 'strongly_agree',
        helpDecisions: 'neutral',
        understandImpact: 'partially_disagree',
        suggestions: 'Great dashboard',
      });
      expect(wrapper.emitted('update:modelValue')).toContainEqual([false]);
    });

    it('should submit with empty suggestions when textarea is not filled', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      await fillAllRadioGroups();
      await findSubmitButton().vm.$emit('click');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Feedback submitted:',
        expect.objectContaining({ suggestions: '' }),
      );
    });
  });

  describe('Dialog events', () => {
    it('should forward update:open event as update:modelValue', async () => {
      await findDialog().vm.$emit('update:open', false);
      expect(wrapper.emitted('update:modelValue')).toContainEqual([false]);
    });
  });

  describe('Button props', () => {
    it('should set postpone button as tertiary type', () => {
      expect(findPostponeButton().props('type')).toBe('tertiary');
    });

    it('should set submit button as primary type', () => {
      expect(findSubmitButton().props('type')).toBe('primary');
    });
  });
});
