import { describe, it, expect, beforeEach, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { ref } from 'vue';

vi.mock('@/services/api/resources/conversational/resolutionCriteria', () => ({
  MAX_CUSTOM_CRITERIA: 5,
}));

import CriteriaList from '../CriteriaList.vue';

const baseCriteriaRef = ref([{ id: 'base-1', text: 'Base criterion' }]);
const customCriteriaRef = ref([]);
const isLoadingListRef = ref(false);
const customCriteriaCountRef = ref(0);
const goToEdit = vi.fn();
const openRemoveModal = vi.fn();

vi.mock('@/store/modules/conversational/resolutionCriteria', () => ({
  useResolutionCriteria: () => ({
    $id: 'resolutionCriteria',
    goToEdit,
    openRemoveModal,
  }),
}));

vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    storeToRefs: (store) => {
      if (store?.$id === 'resolutionCriteria') {
        return {
          baseCriteria: baseCriteriaRef,
          customCriteria: customCriteriaRef,
          isLoadingList: isLoadingListRef,
          customCriteriaCount: customCriteriaCountRef,
        };
      }
      return actual.storeToRefs(store);
    },
  };
});

const createWrapper = () =>
  shallowMount(CriteriaList, {
    global: {
      plugins: [createTestingPinia()],
      stubs: {
        UnnnicIconLoading: true,
        UnnnicPopover: true,
        UnnnicPopoverTrigger: true,
        UnnnicPopoverContent: true,
        UnnnicPopoverOption: true,
        UnnnicButton: true,
      },
    },
  });

describe('CriteriaList.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    baseCriteriaRef.value = [{ id: 'base-1', text: 'Base criterion' }];
    customCriteriaRef.value = [];
    isLoadingListRef.value = false;
    customCriteriaCountRef.value = 0;
  });

  it('shows loading state', () => {
    isLoadingListRef.value = true;
    const wrapper = createWrapper();
    expect(wrapper.findComponent({ name: 'UnnnicIconLoading' }).exists()).toBe(
      true,
    );
    expect(wrapper.find('[data-testid="base-criteria-section"]').exists()).toBe(
      false,
    );
  });

  it('renders base criteria and empty custom state', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('[data-testid="base-criterion-row"]').text()).toContain(
      'Base criterion',
    );
    expect(wrapper.find('[data-testid="custom-criteria-empty"]').exists()).toBe(
      true,
    );
  });

  it('renders custom criteria and handles edit/delete', async () => {
    customCriteriaRef.value = [{ id: 'c1', text: 'Custom criterion' }];
    customCriteriaCountRef.value = 1;

    const wrapper = createWrapper();
    expect(
      wrapper.find('[data-testid="custom-criterion-row"]').text(),
    ).toContain('Custom criterion');

    wrapper.vm.handleRowMenuToggle('c1', true);
    expect(wrapper.vm.openRowMenuId).toBe('c1');

    wrapper.vm.handleEdit({ id: 'c1', text: 'Custom criterion' });
    expect(goToEdit).toHaveBeenCalledWith({
      id: 'c1',
      text: 'Custom criterion',
    });
    expect(wrapper.vm.openRowMenuId).toBeNull();

    wrapper.vm.handleDelete({ id: 'c1', text: 'Custom criterion' });
    expect(openRemoveModal).toHaveBeenCalledWith({
      id: 'c1',
      text: 'Custom criterion',
    });
  });

  it('closes row menu when toggle receives false', () => {
    const wrapper = createWrapper();
    wrapper.vm.handleRowMenuToggle('c1', true);
    wrapper.vm.handleRowMenuToggle('c1', false);
    expect(wrapper.vm.openRowMenuId).toBeNull();
  });
});
