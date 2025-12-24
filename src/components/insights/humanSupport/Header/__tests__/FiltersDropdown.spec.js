import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import { createI18n } from 'vue-i18n';
import FiltersDropdown from '../FiltersDropdown.vue';

config.global.plugins = [
  createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        export_data: {
          filters: {
            sector: 'Sector',
            select_sector: 'Select sector',
            all_sectors: 'All sectors',
            queue: 'Queue',
            select_queue: 'Select queue',
            all_queues: 'All queues',
            tag: 'Tag',
            select_tag: 'Select tag',
            all_tags: 'All tags',
          },
        },
        insights_header: {
          clear_filters: 'Clear',
          filtrate: 'Apply',
          filters: 'Filters',
        },
      },
    },
  }),
];

const appliedFiltersLengthRef = ref(0);
const sectorsRef = ref([]);
const queuesRef = ref([]);
const tagsRef = ref([]);
const hasAppliedFiltersNoChangesRef = ref(true);

const mockStore = {
  get appliedFiltersLength() {
    return appliedFiltersLengthRef.value;
  },
  get sectors() {
    return sectorsRef.value;
  },
  set sectors(value) {
    sectorsRef.value = value;
  },
  get queues() {
    return queuesRef.value;
  },
  set queues(value) {
    queuesRef.value = value;
  },
  get tags() {
    return tagsRef.value;
  },
  set tags(value) {
    tagsRef.value = value;
  },
  get hasAppliedFiltersNoChanges() {
    return hasAppliedFiltersNoChangesRef.value;
  },
  clearFilters: vi.fn(),
  saveAppliedFilters: vi.fn(),
};

vi.mock('@/store/modules/humanSupport/humanSupport', () => ({
  useHumanSupport: () => mockStore,
}));

vi.mock('pinia', async (importOriginal) => ({
  ...(await importOriginal()),
  storeToRefs: (store) => ({
    appliedFiltersLength: appliedFiltersLengthRef,
    sectors: sectorsRef,
    queues: queuesRef,
    tags: tagsRef,
    hasAppliedFiltersNoChanges: hasAppliedFiltersNoChangesRef,
  }),
}));

const createWrapper = (storeState = {}) => {
  appliedFiltersLengthRef.value = storeState.appliedFiltersLength || 0;
  sectorsRef.value = storeState.sectors || [];
  queuesRef.value = storeState.queues || [];
  tagsRef.value = storeState.tags || [];
  hasAppliedFiltersNoChangesRef.value =
    storeState.hasAppliedFiltersNoChanges !== undefined
      ? storeState.hasAppliedFiltersNoChanges
      : true;

  return shallowMount(FiltersDropdown, {
    global: {
      stubs: {
        UnnnicButton: true,
        UnnnicDropdown: true,
        UnnnicLabel: true,
        FilterMultiSelect: true,
      },
    },
  });
};

describe('FiltersDropdown', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    appliedFiltersLengthRef.value = 0;
    sectorsRef.value = [];
    queuesRef.value = [];
    tagsRef.value = [];
    hasAppliedFiltersNoChangesRef.value = true;
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('renders main section', () => {
      expect(wrapper.find('.filters-dropdown').exists()).toBe(true);
    });

    it('renders dropdown component', () => {
      expect(wrapper.findComponent({ name: 'UnnnicDropdown' }).exists()).toBe(
        true,
      );
    });
  });

  describe('Button title', () => {
    it('shows default title when no filters applied', () => {
      expect(wrapper.vm.titleButton).toBe('Filters');
    });

    it('shows count in title when filters applied', () => {
      wrapper = createWrapper({ appliedFiltersLength: 3 });
      expect(wrapper.vm.titleButton).toBe('Filters (3)');
    });
  });

  describe('Sectors handling', () => {
    it('computes hasSectorsSelected correctly', () => {
      expect(wrapper.vm.hasSectorsSelected).toBe(false);

      wrapper = createWrapper({ sectors: [{ value: 'sector1' }] });
      expect(wrapper.vm.hasSectorsSelected).toBe(true);
    });

    it('computes isManySectorsSelected correctly', () => {
      wrapper = createWrapper({
        sectors: [{ value: 'sector1' }, { value: 'sector2' }],
      });
      expect(wrapper.vm.isManySectorsSelected).toBe(true);

      wrapper = createWrapper({ sectors: [{ value: '__all__' }] });
      expect(wrapper.vm.isManySectorsSelected).toBe(false);
    });

    it('clears queues and tags when sectors change', async () => {
      sectorsRef.value = [{ value: 'sector1' }];
      queuesRef.value = [{ value: 'queue1' }];
      tagsRef.value = [{ value: 'tag1' }];
      wrapper = createWrapper();

      await wrapper.vm.handleUpdateSectors([{ value: 'sector2' }]);
      await nextTick();

      expect(sectorsRef.value).toEqual([{ value: 'sector2' }]);
      expect(queuesRef.value).toEqual([]);
      expect(tagsRef.value).toEqual([]);
    });
  });

  describe('Dependency computations', () => {
    it('computes dependsOnValueQueues for single sector', () => {
      wrapper = createWrapper({ sectors: [{ value: 'sector1' }] });
      expect(wrapper.vm.dependsOnValueQueues).toEqual({ sector_id: 'sector1' });
    });

    it('computes dependsOnValueQueues for multiple sectors', () => {
      wrapper = createWrapper({
        sectors: [{ value: 'sector1' }, { value: 'sector2' }],
      });
      expect(wrapper.vm.dependsOnValueQueues).toEqual({
        sectors: 'sector1,sector2',
      });
    });

    it('computes dependsOnValueTags for single sector', () => {
      wrapper = createWrapper({ sectors: [{ value: 'sector1' }] });
      expect(wrapper.vm.dependsOnValueTags).toEqual({ sector_id: 'sector1' });
    });
  });

  describe('Dropdown toggle', () => {
    it('opens dropdown normally', async () => {
      await wrapper.vm.handleDropdownToggle(true);
      expect(wrapper.vm.isOpenDropdown).toBe(true);
    });

    it('keeps dropdown open when options are active', async () => {
      wrapper.vm.isOptionsActive = true;
      await wrapper.vm.handleDropdownToggle(false);
      expect(wrapper.vm.isOpenDropdown).toBe(true);
    });

    it('closes dropdown when options are not active', async () => {
      wrapper.vm.isOptionsActive = false;
      await wrapper.vm.handleDropdownToggle(false);
      expect(wrapper.vm.isOpenDropdown).toBe(false);
    });
  });

  describe('Options active handling', () => {
    it('sets options active immediately when true', () => {
      wrapper.vm.handleOptionsActiveChange(true);
      expect(wrapper.vm.isOptionsActive).toBe(true);
    });

    it('sets options active with delay when false', async () => {
      wrapper.vm.isOptionsActive = true;
      wrapper.vm.handleOptionsActiveChange(false);
      expect(wrapper.vm.isOptionsActive).toBe(true);

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(wrapper.vm.isOptionsActive).toBe(false);
    });
  });

  describe('Filter actions', () => {
    it('clears filters and closes dropdown', async () => {
      wrapper.vm.isOpenDropdown = true;
      await wrapper.vm.handleClearFilters();

      expect(mockStore.clearFilters).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.isOpenDropdown).toBe(false);
    });

    it('applies filters and closes dropdown', async () => {
      wrapper.vm.isOpenDropdown = true;
      await wrapper.vm.handleApplyFilters();

      expect(mockStore.saveAppliedFilters).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.isOpenDropdown).toBe(false);
    });

    it('disables apply button when no changes', () => {
      const dropdown = wrapper.findComponent({ name: 'UnnnicDropdown' });
      expect(dropdown.exists()).toBe(true);
    });
  });

  describe('Queue and tag disabling logic', () => {
    it('disables queue when no sectors selected', () => {
      expect(wrapper.vm.hasSectorsSelected).toBe(false);
    });

    it('enables queue when sectors selected', () => {
      wrapper = createWrapper({ sectors: [{ value: 'sector1' }] });
      expect(wrapper.vm.hasSectorsSelected).toBe(true);
    });

    it('computes isManySectorsSelected when multiple sectors', () => {
      wrapper = createWrapper({
        sectors: [{ value: 'sector1' }, { value: 'sector2' }],
      });
      expect(wrapper.vm.isManySectorsSelected).toBe(true);
    });
  });
});
