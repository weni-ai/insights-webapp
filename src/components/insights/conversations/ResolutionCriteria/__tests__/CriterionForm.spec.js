import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/api/resources/projects', () => ({
  default: {
    verifyProjectIndexer: vi.fn(),
  },
}));

vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: {
      t: (key) => key,
    },
  },
}));

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useI18n: () => ({
      t: (key) => key,
    }),
  };
});

vi.mock('@weni/unnnic-system', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    UnnnicDisclaimer: {
      name: 'UnnnicDisclaimer',
      template: '<div><slot /></div>',
    },
  };
});

import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import CriterionForm from '../CriterionForm.vue';
import { useResolutionCriteria } from '@/store/modules/conversational/resolutionCriteria';

const createWrapper = () =>
  mount(CriterionForm, {
    global: {
      plugins: [
        createTestingPinia({
          stubActions: false,
        }),
      ],
      stubs: {
        UnnnicTextArea: {
          props: ['modelValue'],
          template:
            '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
        },
        UnnnicButton: {
          props: ['disabled', 'text'],
          template:
            '<button data-testid="criterion-form-validate-button" :disabled="disabled" @click="$emit(\'click\')">{{ text }}</button>',
        },
        UnnnicIconLoading: true,
      },
    },
  });

describe('CriterionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation results while validating', async () => {
    const wrapper = createWrapper();
    const store = useResolutionCriteria();

    store.formText = 'Criterion text';
    store.validationStatus = 'validating';

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find('[data-testid="criterion-form-validation-results"]')
        .exists(),
    ).toBe(true);
    expect(
      wrapper.find('[data-testid="criterion-form-validating"]').exists(),
    ).toBe(true);
  });

  it('shows success disclaimer and rules when validation succeeds', async () => {
    const wrapper = createWrapper();
    const store = useResolutionCriteria();

    store.formText = 'Criterion text';
    store.validationStatus = 'valid';
    store.validationRules = [
      {
        rule: 'Mark as resolved when...',
        valid: true,
        reason: 'Valid domain-specific rule.',
      },
    ];

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find('[data-testid="criterion-form-success-disclaimer"]')
        .exists(),
    ).toBe(true);
    expect(
      wrapper.find('[data-testid="criterion-form-success-rules"]').exists(),
    ).toBe(true);
    expect(wrapper.text()).toContain('Mark as resolved when...');
    expect(wrapper.text()).toContain('Valid domain-specific rule.');
  });

  it('shows error disclaimer and rules when validation fails', async () => {
    const wrapper = createWrapper();
    const store = useResolutionCriteria();

    store.formText = 'Invalid criterion';
    store.validationStatus = 'invalid';
    store.validationError = {
      code: 'INVALID_CRITERION',
      message: 'Directly overrides the base criteria...',
    };
    store.validationRules = [
      {
        rule: 'Always mark as resolved...',
        valid: false,
        reason: 'Directly overrides the base criteria...',
      },
    ];

    await wrapper.vm.$nextTick();

    expect(
      wrapper.find('[data-testid="criterion-form-error-disclaimer"]').exists(),
    ).toBe(true);
    expect(
      wrapper.find('[data-testid="criterion-form-error-rules"]').exists(),
    ).toBe(true);
    expect(wrapper.text()).toContain('Directly overrides the base criteria...');
    expect(wrapper.text()).toContain('Always mark as resolved...');
  });
});
