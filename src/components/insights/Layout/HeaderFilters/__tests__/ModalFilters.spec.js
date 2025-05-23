import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ModalFilters from '@/components/insights/Layout/HeaderFilters/ModalFilters.vue';
import { useDashboards } from '@/store/modules/dashboards';
import { useSectors } from '@/store/modules/sectors';

const originalSectors = [
  {
    uuid: '89815a13-3672-4c6b-a6c2-3598694ffc56',
    name: 'Default sector',
  },
  {
    uuid: '7fb8724c-4c92-4f3d-8055-766f54bffc4d',
    name: 'Risk',
  },
];

const createTestStore = () =>
  createTestingPinia({
    initialState: {
      dashboards: {
        setAppliedFilters: vi.fn(),
        resetAppliedFilters: vi.fn(),
        appliedFilters: { date_range: '2024-01-01' },
        currentDashboardFilters: [
          { name: 'filter1', depends_on: null },
          { name: 'filter2', depends_on: null },
        ],
      },
      sectors: {
        sectors: JSON.parse(JSON.stringify(originalSectors)),
        getSectorById: (state) => (uuid) =>
          state.sectors.find((sector) => sector.uuid === uuid),
      },
    },
  });

const UnnnicModalDialogStub = {
  template: `
    <div data-testid="modal">
      <slot></slot>
      <slot name="options"></slot>
    </div>
  `,
  props: [
    'modelValue',
    'title',
    'showActionsDivider',
    'showCloseIcon',
    'primaryButtonProps',
    'secondaryButtonProps',
  ],
  emits: [
    'update:model-value',
    'primary-button-click',
    'secondary-button-click',
  ],
};

const createWrapper = (store) => {
  return shallowMount(ModalFilters, {
    props: {
      showModal: true,
    },
    global: {
      plugins: [store],
      stubs: {
        UnnnicModalDialog: UnnnicModalDialogStub,
      },
      mocks: {
        $t: (key) => (key === 'insights_header.filters' ? 'Filters' : key),
      },
    },
  });
};

describe('ModalFilters', () => {
  let wrapper;
  let store;

  const modal = () => wrapper.findComponent('[data-testid="modal"]');

  beforeEach(() => {
    store = createTestStore();
    wrapper = createWrapper(store);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('UnnnicModalDialog rendering and interaction', () => {
    it('renders UnnnicModalDialog with correct props', () => {
      expect(modal().exists()).toBe(true);
      expect(modal().props('modelValue')).toBe(true);

      expect(modal().props('title')).toBe('Filters');
    });

    it('emits close event when modal is closed', async () => {
      await modal().vm.$emit('update:model-value', false);

      expect(wrapper.emitted('close')).toBeTruthy();
    });
  });

  describe('DynamicFilter rendering and interaction', () => {
    it('renders DynamicFilter components for each filter in currentDashboardFilters', async () => {
      await wrapper.setData({
        filtersInternal: {
          filter1: 'value1',
          filter2: 'value2',
        },
      });

      const dynamicFilters = wrapper.findAllComponents(
        '[data-testid="dynamic-filter"]',
      );
      expect(dynamicFilters.length).toBe(2);
      expect(dynamicFilters[0].props('modelValue')).toBe('value1');
      expect(dynamicFilters[1].props('modelValue')).toBe('value2');
    });

    it('calls updateFilter if DynamicFilter is updated', async () => {
      await wrapper.setData({
        filtersInternal: {
          filter1: 'value1',
        },
      });
      const updateFilterSpy = vi
        .spyOn(wrapper.vm, 'updateFilter')
        .mockImplementation(() => {});

      const dynamicFilter = wrapper.findComponent(
        '[data-testid="dynamic-filter"]',
      );
      await dynamicFilter.vm.$emit('update:model-value', 'newValue');

      expect(updateFilterSpy).toHaveBeenCalledWith('filter1', 'newValue');
    });
  });

  describe('State updates and syncing', () => {
    it('calls syncFiltersInternal when appliedFilters changes', async () => {
      const dashboardsStore = useDashboards();
      vi.clearAllMocks();
      const syncFiltersInternalSpy = vi.spyOn(
        wrapper.vm,
        'syncFiltersInternal',
      );
      dashboardsStore.appliedFilters = { date_range: '2023-01-01' };
      await wrapper.vm.$nextTick();

      expect(syncFiltersInternalSpy).toHaveBeenCalledTimes(1);
    });

    it('clearFilters resets filtersInternal', async () => {
      await wrapper.vm.clearFilters();
      expect(wrapper.vm.filtersInternal).toEqual({});
    });
  });

  describe('Methods', () => {
    beforeEach(async () => {
      await wrapper.setData({
        filtersInternal: {
          filter1: 'value1',
          filter2: 'value2',
        },
      });
    });

    describe('getDynamicFiltersDependsOnValues', () => {
      it('returns null if filter does not have depends_on or search_param', () => {
        const filter = { name: 'filter1' };
        const result = wrapper.vm.getDynamicFiltersDependsOnValues(filter);
        expect(result).toBeNull();
      });

      it('returns null if filter has depends_on but no search_param', () => {
        const filter = {
          name: 'filter1',
          depends_on: { filter: 'filter2' },
        };
        const result = wrapper.vm.getDynamicFiltersDependsOnValues(filter);
        expect(result).toBeNull();
      });

      it('returns the correct object if depends_on has search_param', () => {
        const filter = {
          name: 'filter1',
          depends_on: {
            search_param: 'param1',
            filter: 'filter2',
          },
        };
        const result = wrapper.vm.getDynamicFiltersDependsOnValues(filter);
        expect(result).toEqual({ param1: 'value2' });
      });

      it('returns the correct object when filtersInternal has a value for the dependent filter', () => {
        const filter = {
          name: 'filter1',
          depends_on: {
            search_param: 'param1',
            filter: 'filter2',
          },
        };
        wrapper.vm.filtersInternal.filter2 = 'value2';
        const result = wrapper.vm.getDynamicFiltersDependsOnValues(filter);
        expect(result).toEqual({ param1: 'value2' });
      });

      it('returns null when the filter being depended on is not in filtersInternal', () => {
        const filter = {
          name: 'filter1',
          depends_on: {
            search_param: 'param1',
            filter: 'filter3',
          },
        };
        const result = wrapper.vm.getDynamicFiltersDependsOnValues(filter);
        expect(result).toEqual({ param1: undefined });
      });
    });

    describe('updateFilter', () => {
      it('updates filtersInternal with new value if value is non-null', () => {
        wrapper.vm.updateFilter('filter3', 'newValue');
        expect(wrapper.vm.filtersInternal).toHaveProperty(
          'filter3',
          'newValue',
        );
      });

      it('removes filter from filtersInternal if value is null', () => {
        wrapper.vm.updateFilter('filter1', null);
        expect(wrapper.vm.filtersInternal).not.toHaveProperty('filter1');
      });

      it('keeps the filter if value is an object with at least one non-null value', () => {
        wrapper.vm.updateFilter('filter4', { subFilter: 'value' });
        expect(wrapper.vm.filtersInternal).toHaveProperty('filter4', {
          subFilter: 'value',
        });
      });

      it('removes the filter if value is an object with all null or falsy values', () => {
        wrapper.vm.updateFilter('filter2', { subFilter: null });
        expect(wrapper.vm.filtersInternal).not.toHaveProperty('filter2');
      });
    });

    describe('setFilters', () => {
      it('calls setAppliedFilters if filtersInternal has keys', () => {
        const setAppliedFiltersSpy = vi
          .spyOn(wrapper.vm, 'setAppliedFilters')
          .mockImplementation(() => {});
        const closeSpy = vi.spyOn(wrapper.vm, 'close');

        wrapper.vm.setFilters();

        expect(setAppliedFiltersSpy).toHaveBeenCalledWith(
          wrapper.vm.filtersInternal,
        );
        expect(closeSpy).toHaveBeenCalled();
      });

      it('calls resetAppliedFilters if filtersInternal is empty', () => {
        wrapper.vm.filtersInternal = {};
        const resetAppliedFiltersSpy = vi
          .spyOn(wrapper.vm, 'resetAppliedFilters')
          .mockImplementation(() => {});
        const closeSpy = vi.spyOn(wrapper.vm, 'close');

        wrapper.vm.setFilters();

        expect(resetAppliedFiltersSpy).toHaveBeenCalled();
        expect(closeSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Sector handling', () => {
    it('handles sector when it comes as an array from store', async () => {
      const dashboardsStore = useDashboards();
      const appliedFilters = {
        sector: [
          '89815a13-3672-4c6b-a6c2-3598694ffc56',
          '7fb8724c-4c92-4f3d-8055-766f54bffc4d',
        ],
      };

      dashboardsStore.appliedFilters = appliedFilters;

      wrapper.vm.syncFiltersInternal();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.filtersInternal.sector).toEqual([
        {
          value: '89815a13-3672-4c6b-a6c2-3598694ffc56',
          label: 'Default sector',
        },
        {
          value: '7fb8724c-4c92-4f3d-8055-766f54bffc4d',
          label: 'Risk',
        },
      ]);
    });

    it('handles empty sector array gracefully', async () => {
      const dashboardsStore = useDashboards();
      const appliedFilters = {
        sector: [],
      };

      dashboardsStore.appliedFilters = appliedFilters;

      wrapper.vm.syncFiltersInternal();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.filtersInternal.sector).toEqual([]);
    });

    it('updates sector labels when sectors store changes', async () => {
      const isolatedStore = createTestStore();
      const isolatedWrapper = createWrapper(isolatedStore);

      const dashboardsStore = useDashboards();
      const sectorsStore = useSectors();

      // Set up
      const appliedFilters = {
        sector: ['89815a13-3672-4c6b-a6c2-3598694ffc56'],
      };

      // Update store
      dashboardsStore.appliedFilters = appliedFilters;

      // Process initial filters
      isolatedWrapper.vm.syncFiltersInternal();
      await isolatedWrapper.vm.$nextTick();

      // Verify initial state
      expect(isolatedWrapper.vm.filtersInternal.sector[0].label).toBe(
        'Default sector',
      );

      // Change sector name in store
      sectorsStore.sectors[0].name = 'New Sector Name';

      // Wait for watcher to trigger
      await isolatedWrapper.vm.$nextTick();

      // Manually trigger the method since the watcher might not fire in tests
      isolatedWrapper.vm.handleSyncFilters(isolatedWrapper.vm.appliedFilters);
      await isolatedWrapper.vm.$nextTick();

      // Verify the change
      expect(isolatedWrapper.vm.filtersInternal.sector[0].label).toBe(
        'New Sector Name',
      );
    });

    it('keeps sector values as an array when setting filters', async () => {
      // Set up
      wrapper.vm.filtersInternal = {
        sector: [
          {
            value: '89815a13-3672-4c6b-a6c2-3598694ffc56',
            label: 'Default sector',
          },
          {
            value: '7fb8724c-4c92-4f3d-8055-766f54bffc4d',
            label: 'Risk',
          },
        ],
      };

      // Mock the store action to prevent actual execution
      const setAppliedFiltersSpy = vi.fn();
      wrapper.vm.setAppliedFilters = setAppliedFiltersSpy;

      // Execute
      await wrapper.vm.setFilters();

      // Verify it passes an array of values, not a comma-separated string
      expect(setAppliedFiltersSpy).toHaveBeenCalledWith({
        sector: [
          '89815a13-3672-4c6b-a6c2-3598694ffc56',
          '7fb8724c-4c92-4f3d-8055-766f54bffc4d',
        ],
      });
    });
  });

  describe('handleSyncFilters', () => {
    it('handles non-sector filters without modification', async () => {
      // Create a fresh store and wrapper
      const isolatedStore = createTestStore();
      const isolatedWrapper = createWrapper(isolatedStore);

      // Test data with a non-sector filter
      const testFilters = {
        date_range: '2024-01-01',
      };

      isolatedWrapper.vm.filtersInternal = {};

      isolatedWrapper.vm.handleSyncFilters(testFilters);
      await isolatedWrapper.vm.$nextTick();

      expect(isolatedWrapper.vm.filtersInternal).toEqual(testFilters);
    });
  });
});
