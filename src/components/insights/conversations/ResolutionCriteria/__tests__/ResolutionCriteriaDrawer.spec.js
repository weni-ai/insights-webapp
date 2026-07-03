import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

vi.mock('@/services/api/resources/projects', () => ({
  default: {
    verifyProjectIndexer: vi.fn(),
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

import ResolutionCriteriaDrawer from '../ResolutionCriteriaDrawer.vue';
import { useResolutionCriteria } from '@/store/modules/conversational/resolutionCriteria';

const drawerStubs = {
  UnnnicDrawerNext: {
    template: '<div><slot /></div>',
  },
  UnnnicDrawerContent: {
    template: '<div data-testid="resolution-criteria-drawer"><slot /></div>',
  },
  UnnnicDrawerHeader: {
    template: '<div><slot /></div>',
  },
  UnnnicDrawerTitle: true,
  UnnnicDrawerDescription: true,
  UnnnicDrawerFooter: {
    template: '<div><slot /></div>',
  },
  CriteriaList: true,
  CriterionForm: true,
  RemoveCriterionModal: true,
  UnnnicButton: {
    props: ['disabled', 'text'],
    template:
      '<button data-testid="drawer-primary-button" :disabled="disabled" @click="$emit(\'click\')">{{ text }}</button>',
  },
};

const createWrapper = () =>
  mount(ResolutionCriteriaDrawer, {
    global: {
      plugins: [
        createTestingPinia({
          stubActions: false,
        }),
      ],
      stubs: drawerStubs,
    },
  });

describe('ResolutionCriteriaDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('disables save in form view until validation succeeds', async () => {
    const wrapper = createWrapper();
    const store = useResolutionCriteria();

    store.isDrawerOpen = true;
    store.view = 'form';
    store.formText = 'Criterion text';
    store.validationStatus = 'idle';

    await wrapper.vm.$nextTick();

    const saveButton = wrapper.find('[data-testid="drawer-primary-button"]');
    expect(saveButton.text()).toBe(
      'conversations_dashboard.resolution_criteria.form.save',
    );
    expect(saveButton.attributes('disabled')).toBeDefined();
  });

  it('enables save in form view after successful validation', async () => {
    const wrapper = createWrapper();
    const store = useResolutionCriteria();

    store.isDrawerOpen = true;
    store.view = 'form';
    store.formText = 'Criterion text';
    store.validationStatus = 'valid';
    store.lastValidatedText = 'Criterion text';

    await wrapper.vm.$nextTick();

    const saveButton = wrapper.find('[data-testid="drawer-primary-button"]');
    expect(saveButton.attributes('disabled')).toBeUndefined();
  });

  it('calls save when primary button is clicked in form view', async () => {
    const pinia = createTestingPinia({
      stubActions: false,
    });
    const store = useResolutionCriteria(pinia);
    const saveSpy = vi.spyOn(store, 'save').mockResolvedValue(undefined);

    const wrapper = mount(ResolutionCriteriaDrawer, {
      global: {
        plugins: [pinia],
        stubs: drawerStubs,
      },
    });

    store.isDrawerOpen = true;
    store.view = 'form';
    store.formText = 'Criterion text';
    store.validationStatus = 'valid';
    store.lastValidatedText = 'Criterion text';

    await wrapper.vm.$nextTick();
    await wrapper
      .find('[data-testid="drawer-primary-button"]')
      .trigger('click');

    expect(saveSpy).toHaveBeenCalled();
  });
});
