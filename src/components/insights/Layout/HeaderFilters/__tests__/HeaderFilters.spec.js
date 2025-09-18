import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import HeaderFilters from '@/components/insights/Layout/HeaderFilters/index.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { useDashboards } from '@/store/modules/dashboards';

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/dashboard' }, { path: '/another-route' }],
});

const store = createTestingPinia({
  initialState: {
    metaTemplateMessage: { showSearchTemplateMetaModal: false },
    dashboards: {
      setAppliedFilters: vi.fn(),
      resetAppliedFilters: vi.fn(),
      currentDashboardFilters: [{ name: 'filter1', type: 'select' }],
      appliedFilters: {
        filter1: { __gte: '2023-01-01', __lte: '2023-01-07' },
      },
    },
  },
});

const createWrapper = (props = {}, dashboardName = null) => {
  if (dashboardName) {
    const dashboardsStore = useDashboards();
    dashboardsStore.currentDashboard = { name: dashboardName };
  }

  return shallowMount(HeaderFilters, {
    props: {
      ...props,
    },
    global: {
      plugins: [store, router],
    },
  });
};

describe('HeaderFilters', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  it('should render the dynamic filter if only one filter is available', async () => {
    const dynamicFilter = wrapper.findComponent(
      '[data-testid="dynamic-filter"]',
    );
    expect(dynamicFilter.exists()).toBe(true);
  });

  it('should update applied filters when the filter value changes', async () => {
    const setAppliedFiltersSpy = vi.spyOn(wrapper.vm, 'setAppliedFilters');
    const dynamicFilter = wrapper.findComponent(
      '[data-testid="dynamic-filter"]',
    );
    await dynamicFilter.vm.$emit('update:model-value', {
      start: '2023-01-01',
      end: '2023-01-07',
    });

    expect(setAppliedFiltersSpy).toHaveBeenCalledWith({
      filter1: { start: '2023-01-01', end: '2023-01-07' },
    });
  });

  it('should update applied filters when the filter value changes', async () => {
    const setAppliedFiltersSpy = vi.spyOn(wrapper.vm, 'setAppliedFilters');
    const dynamicFilter = wrapper.findComponent(
      '[data-testid="dynamic-filter"]',
    );
    await dynamicFilter.vm.$emit('update:model-value', {
      start: '2023-01-01',
      end: '2023-01-07',
    });

    expect(setAppliedFiltersSpy).toHaveBeenCalledWith({
      filter1: { start: '2023-01-01', end: '2023-01-07' },
    });
  });

  it('should set the filter type to select_date_range if type is date_range', async () => {
    const dashboardsStore = useDashboards();

    dashboardsStore.currentDashboardFilters = [
      { name: 'filter1', type: 'date_range' },
    ];

    const filter = wrapper.vm.filter;

    expect(filter.type).toBe('date_range');
  });

  it('should call retainRouteQueries when path changes', async () => {
    const retainRouteQueriesSpy = vi.spyOn(wrapper.vm, 'retainRouteQueries');

    await router.push({ path: '/another-route' });

    await wrapper.vm.$nextTick();

    expect(retainRouteQueriesSpy).toHaveBeenCalled();
  });

  describe('With many filters', () => {
    let dashboardsStore;
    beforeEach(() => {
      dashboardsStore = useDashboards();
      dashboardsStore.currentDashboardFilters = [
        { name: 'filter1', type: 'date_range' },
        { name: 'filter2', type: 'select' },
      ];
    });

    afterAll(() => {
      dashboardsStore.currentDashboardFilters = [
        { name: 'filter1', type: 'date_range' },
      ];
    });

    const filterButton = () =>
      wrapper.findComponent('[data-testid="many-filters-button"]');
    const clearButton = () =>
      wrapper.findComponent('[data-testid="clear-many-filters-button"]');

    it('should render the "many filters" button if there are multiple filters', async () => {
      expect(filterButton().exists()).toBe(true);
      expect(filterButton().props().text).toBe('Filters (1)');
    });

    it('should open the modal when the button filters is clicked', async () => {
      await filterButton().trigger('click');
      expect(wrapper.vm.filterModalOpened).toBe(true);
    });

    it('should display a clear filters button if there are applied filters', async () => {
      expect(clearButton().exists()).toBe(true);
      expect(clearButton().props().text).toBe('Clear filters');
    });

    it('should call resetAppliedFilters when clear filters button is clicked', async () => {
      const resetAppliedFiltersSpy = vi.spyOn(
        wrapper.vm,
        'resetAppliedFilters',
      );

      await clearButton().trigger('click');
      expect(resetAppliedFiltersSpy).toHaveBeenCalled();
    });

    it('should close the modal when the modal close event is emitted', async () => {
      await wrapper.setData({ filterModalOpened: true });
      const modal = wrapper.findComponent('[data-testid="modal-filters"]');
      await modal.vm.$emit('close');
      expect(wrapper.vm.filterModalOpened).toBe(false);
    });
  });

});
