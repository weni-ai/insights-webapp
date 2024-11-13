import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createStore } from 'vuex';
import Unnnic from '@weni/unnnic-system';
import i18n from '@/utils/plugins/i18n';

import ModalFilters from '@/components/insights/Layout/HeaderFilters/ModalFilters.vue';

const store = createStore({
  modules: {
    dashboards: {
      namespaced: true,
      state: {
        appliedFilters: { date_range: '2024-01-01' },
        currentDashboardFilters: [
          { name: 'filter1', depends_on: null },
          { name: 'filter2', depends_on: null },
        ],
      },
    },
  },
});

const createWrapper = (props = {}) => {
  return shallowMount(ModalFilters, {
    props: {
      showModal: true,
      ...props,
    },
    global: {
      plugins: [store],
      stubs: {
        UnnnicModalDialog: Unnnic.unnnicModalDialog,
      },
    },
  });
};

describe('ModalFilters', () => {
  let wrapper;

  const modal = () => wrapper.findComponent('[data-testid="modal"]');

  beforeEach(() => {
    wrapper = createWrapper();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('UnnnicModalDialog rendering and interaction', () => {
    it('renders UnnnicModalDialog with correct props', () => {
      expect(modal().exists()).toBe(true);
      expect(modal().props('modelValue')).toBe(true);
      expect(modal().props('title')).toBe(
        i18n.global.t('insights_header.filters'),
      );
    });

    it('emits close event when modal is closed', async () => {
      await modal().vm.$emit('update:model-value', false);

      expect(wrapper.emitted('close')).toBeTruthy();
    });

    describe('Button clicks call appropriate methods', () => {
      beforeEach(() => {
        vi.spyOn(ModalFilters.methods, 'setFilters').mockImplementation(
          () => {},
        );
        vi.spyOn(ModalFilters.methods, 'clearFilters').mockImplementation(
          () => {},
        );
        wrapper = createWrapper();
      });

      it('calls setFilters when primary button is clicked', async () => {
        await modal().vm.$emit('primary-button-click');

        expect(ModalFilters.methods.setFilters).toHaveBeenCalledTimes(1);
      });

      it('calls clearFilters when secondary button is clicked', async () => {
        await modal().vm.$emit('secondary-button-click');

        expect(ModalFilters.methods.clearFilters).toHaveBeenCalledTimes(1);
      });
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
      vi.clearAllMocks();
      const syncFiltersInternalSpy = vi.spyOn(
        wrapper.vm,
        'syncFiltersInternal',
      );
      store.state.dashboards.appliedFilters = { date_range: '2023-01-01' };
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
});
