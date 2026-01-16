import { beforeEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import DetailedMonitoring from '../DetailedMonitoring.vue';

const activeDetailedTabRef = ref('in_awaiting');

const mockStore = {
  get activeDetailedTab() {
    return activeDetailedTabRef.value;
  },
  setActiveDetailedTab: vi.fn((tab) => {
    activeDetailedTabRef.value = tab;
  }),
};

vi.mock('@/store/modules/humanSupport/monitoring', () => ({
  useHumanSupportMonitoring: () => mockStore,
}));

vi.mock('pinia', async (importOriginal) => ({
  ...(await importOriginal()),
  storeToRefs: (store) => ({ activeDetailedTab: activeDetailedTabRef }),
}));

const createWrapper = (initialTab = 'in_awaiting') => {
  activeDetailedTabRef.value = initialTab;

  return shallowMount(DetailedMonitoring, {
    global: {
      stubs: {
        UnnnicTab: true,
        DetailedFilters: true,
        InAwaiting: true,
        InProgress: true,
        Attendant: true,
        Pauses: true,
      },
    },
  });
};

describe('DetailedMonitoring', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    activeDetailedTabRef.value = 'in_awaiting';
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('renders main section with id', () => {
      expect(wrapper.find('#detailed-monitoring').exists()).toBe(true);
    });

    it('renders main section with correct class', () => {
      expect(wrapper.find('.detailed-monitoring').exists()).toBe(true);
    });

    it('renders title section', () => {
      expect(wrapper.find('.detailed-monitoring__title').exists()).toBe(true);
    });
  });

  describe('Tabs configuration', () => {
    it('renders tabs section', () => {
      expect(wrapper.find('.detailed-monitoring__tabs').exists()).toBe(true);
    });
  });

  describe('Filter visibility', () => {
    it('shows filters for attendant tab', async () => {
      wrapper = createWrapper('attendant');
      await nextTick();
      expect(wrapper.find('.detailed-monitoring__filters').exists()).toBe(true);
    });

    it('shows filters for pauses tab', async () => {
      wrapper = createWrapper('pauses');
      await nextTick();
      expect(wrapper.find('.detailed-monitoring__filters').exists()).toBe(true);
    });

    it('hides filters for in_awaiting tab', () => {
      wrapper = createWrapper('in_awaiting');
      expect(wrapper.find('.detailed-monitoring__filters').exists()).toBe(
        false,
      );
    });

    it('hides filters for in_progress tab', () => {
      wrapper = createWrapper('in_progress');
      expect(wrapper.find('.detailed-monitoring__filters').exists()).toBe(
        false,
      );
    });
  });

  describe('Tab change handling', () => {
    it('changes active tab when change event emitted', async () => {
      await wrapper.vm.changeActiveTabName('pauses');
      expect(mockStore.setActiveDetailedTab).toHaveBeenCalledWith('pauses');
      expect(activeDetailedTabRef.value).toBe('pauses');
    });

    it('updates filterType when tab changes to attendant', async () => {
      await wrapper.vm.changeActiveTabName('attendant');
      await nextTick();
      expect(wrapper.vm.filterType).toBe('attendant');
    });

    it('updates filterType when tab changes to pauses', async () => {
      await wrapper.vm.changeActiveTabName('pauses');
      await nextTick();
      expect(wrapper.vm.filterType).toBe('pauses');
    });
  });

  describe('Computed properties', () => {
    it('computes filterType for attendant', () => {
      wrapper = createWrapper('attendant');
      expect(wrapper.vm.filterType).toBe('attendant');
    });

    it('computes filterType for pauses', () => {
      wrapper = createWrapper('pauses');
      expect(wrapper.vm.filterType).toBe('pauses');
    });
  });
});
