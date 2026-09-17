import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { ref } from 'vue';

import RemoveCriterionModal from '../RemoveCriterionModal.vue';

const isRemoveModalOpenRef = ref(true);
const isRemovingRef = ref(false);
const closeRemoveModal = vi.fn();
const confirmRemove = vi.fn();

vi.mock('@/store/modules/conversational/resolutionCriteria', () => ({
  useResolutionCriteria: () => ({
    $id: 'resolutionCriteria',
    closeRemoveModal,
    confirmRemove,
  }),
}));

vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    storeToRefs: (store) => {
      if (store?.$id === 'resolutionCriteria') {
        return {
          isRemoveModalOpen: isRemoveModalOpenRef,
          isRemoving: isRemovingRef,
        };
      }
      return actual.storeToRefs(store);
    },
  };
});

const createWrapper = () =>
  mount(RemoveCriterionModal, {
    global: {
      plugins: [createTestingPinia()],
      stubs: {
        UnnnicDialog: false,
        UnnnicDialogContent: {
          name: 'UnnnicDialogContent',
          template: '<div><slot /></div>',
        },
        UnnnicDialogHeader: { template: '<div><slot /></div>' },
        UnnnicDialogTitle: { template: '<div><slot /></div>' },
        UnnnicDialogFooter: { template: '<div><slot /></div>' },
        UnnnicButton: {
          name: 'UnnnicButton',
          props: ['text', 'disabled', 'loading', 'type'],
          emits: ['click'],
          template:
            '<button class="btn-stub" @click="$emit(\'click\')">{{ text }}</button>',
        },
      },
    },
  });

describe('RemoveCriterionModal.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isRemoveModalOpenRef.value = true;
    isRemovingRef.value = false;
  });

  it('renders when remove modal is open', () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain('Delete');
  });

  it('does not render content when modal is closed', () => {
    isRemoveModalOpenRef.value = false;
    const wrapper = createWrapper();
    expect(wrapper.find('.remove-criterion-modal').exists()).toBe(false);
  });

  it('calls confirmRemove on confirm click', async () => {
    const wrapper = createWrapper();
    const confirmButton = wrapper.findAll('.btn-stub').at(-1);
    await confirmButton.trigger('click');
    expect(confirmRemove).toHaveBeenCalled();
  });

  it('closes modal when update:open receives false', () => {
    const wrapper = createWrapper();
    wrapper.vm.handleUpdateOpen(false);
    expect(closeRemoveModal).toHaveBeenCalled();
  });

  it('does not close modal when update:open receives true', () => {
    const wrapper = createWrapper();
    wrapper.vm.handleUpdateOpen(true);
    expect(closeRemoveModal).not.toHaveBeenCalled();
  });
});
