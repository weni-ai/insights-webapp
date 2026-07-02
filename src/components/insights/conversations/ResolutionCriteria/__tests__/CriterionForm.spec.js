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
});
