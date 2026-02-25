import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import DataFeedbackModal from '../DataFeedbackModal.vue';

vi.mock('@/services/api/resources/conversational/feedback', () => ({
  default: {
    submitFeedback: vi.fn().mockResolvedValue({ uuid: 'response-uuid' }),
  },
  DashboardType: { CONVERSATIONAL: 'CONVERSATIONAL' },
  FormType: { SCORE_1_5: 'SCORE_1_5', TEXT: 'TEXT' },
  Reference: {
    TRUST: 'TRUST',
    MAKE_DECISION: 'MAKE_DECISION',
    ROI: 'ROI',
    COMMENT: 'COMMENT',
  },
}));

vi.mock('@/store/modules/dashboards', () => ({
  useDashboards: () => ({ currentDashboard: { uuid: 'dash-uuid' } }),
}));

import feedbackApi from '@/services/api/resources/conversational/feedback';

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
    props: { modelValue: true, surveyUuid: 'survey-123', ...props },
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
    await findRadioImpact().vm.$emit('update:modelValue', 'partially_disagree');
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
    it('should call feedbackApi.submitFeedback with correct payload and emit submitted', async () => {
      await fillAllRadioGroups();
      await findTextarea().vm.$emit('update:modelValue', 'Great dashboard');
      await findSubmitButton().vm.$emit('click');
      await vi.dynamicImportSettled();

      expect(feedbackApi.submitFeedback).toHaveBeenCalledWith({
        type: 'CONVERSATIONAL',
        dashboard: 'dash-uuid',
        survey: 'survey-123',
        answers: [
          { reference: 'TRUST', answer: '5', type: 'SCORE_1_5' },
          { reference: 'MAKE_DECISION', answer: '3', type: 'SCORE_1_5' },
          { reference: 'ROI', answer: '2', type: 'SCORE_1_5' },
          { reference: 'COMMENT', answer: 'Great dashboard', type: 'TEXT' },
        ],
      });

      expect(wrapper.emitted('submitted')).toHaveLength(1);
      expect(wrapper.emitted('update:modelValue')).toContainEqual([false]);
    });

    it('should submit with empty comment when textarea is not filled', async () => {
      await fillAllRadioGroups();
      await findSubmitButton().vm.$emit('click');
      await vi.dynamicImportSettled();

      expect(feedbackApi.submitFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          answers: expect.arrayContaining([
            { reference: 'COMMENT', answer: '', type: 'TEXT' },
          ]),
        }),
      );
    });

    it('should not emit submitted when API call fails', async () => {
      feedbackApi.submitFeedback.mockRejectedValueOnce(new Error('fail'));

      await fillAllRadioGroups();
      await findSubmitButton().vm.$emit('click');
      await vi.dynamicImportSettled();

      expect(wrapper.emitted('submitted')).toBeUndefined();
    });
  });

  describe('Postpone', () => {
    it('should emit postpone when postpone button is clicked', async () => {
      await findPostponeButton().vm.$emit('click');
      expect(wrapper.emitted('postpone')).toHaveLength(1);
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
