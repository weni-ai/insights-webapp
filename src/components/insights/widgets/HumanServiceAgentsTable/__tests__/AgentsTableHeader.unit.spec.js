import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shallowMount, config } from '@vue/test-utils';
import { createStore } from 'vuex';
import AgentsTableHeader from '../AgentsTableHeader.vue';
import i18n from '@/utils/plugins/i18n';

beforeAll(() => {
  config.global.plugins = config.global.plugins.filter(
    (plugin) => plugin !== i18n,
  );
});

afterAll(() => {
  if (!config.global.plugins.includes(i18n)) {
    config.global.plugins.push(i18n);
  }
});

vi.mock('@/components/insights/Layout/HeaderFilters/DynamicFilter.vue', () => ({
  default: {
    name: 'DynamicFilter',
    template: '<div class="dynamic-filter-mock"></div>',
    props: ['modelValue', 'filter', 'disabled', 'dependsOnValue'],
    emits: ['update:model-value'],
  },
}));

const sampleHeaders = [
  { name: 'status', display: true, hidden_name: false },
  { name: 'agent', display: true, hidden_name: false },
  { name: 'in_progress', display: true, hidden_name: false },
  { name: 'closeds', display: true, hidden_name: false },
  { name: 'column1', display: true, hidden_name: false },
  { name: 'column2', display: true, hidden_name: false },
  { name: 'hidden_column', display: true, hidden_name: true },
  { name: 'not_displayed', display: false, hidden_name: false },
];

const dashboardFilters = [
  { name: 'sectors', source: 'sectors', depends_on: null },
  { name: 'queues', source: 'queues', depends_on: null },
  { name: 'other_filter', source: 'other', depends_on: null },
];

const storageColumns = ['column1', 'column2'];

const createMockStore = (overrideState = {}) => {
  return createStore({
    modules: {
      agentsColumnsFilter: {
        namespaced: true,
        state: {
          visibleColumns: [...storageColumns],
          hasInitialized: true,
          ...overrideState.agentsColumnsFilter,
        },
        actions: {
          initializeFromStorage: vi.fn(),
          setVisibleColumns: vi.fn(),
        },
      },
      dashboards: {
        namespaced: true,
        state: {
          currentDashboardFilters: [...dashboardFilters],
          appliedFilters: {},
          ...overrideState.dashboards,
        },
        actions: {
          setAppliedFilters: vi.fn(),
          resetAppliedFilters: vi.fn(),
        },
      },
    },
  });
};

const createWrapper = (props = {}, overrideState = {}) => {
  const store = createMockStore(overrideState);

  vi.spyOn(store, 'dispatch');

  return {
    wrapper: shallowMount(AgentsTableHeader, {
      props: {
        headers: sampleHeaders,
        isLoading: false,
        ...props,
      },
      global: {
        plugins: [store],
        stubs: {
          UnnnicLabel: true,
          UnnnicSelectSmart: true,
          UnnnicButton: true,
          DynamicFilter: true,
        },
        mocks: {
          $t: (key) => key,
        },
      },
    }),
    store,
  };
};

describe('AgentsTableHeader', () => {
  let wrapper;
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    const created = createWrapper();
    wrapper = created.wrapper;
    store = created.store;
  });

  afterEach(() => {
    wrapper.unmount();
  });

  describe('Component rendering', () => {
    it('renders the component correctly', () => {
      expect(wrapper.find('[data-testid="agents-table-header"]').exists()).toBe(
        true,
      );
      expect(
        wrapper.find('[data-testid="dynamic-columns-filter"]').exists(),
      ).toBe(true);
      expect(wrapper.find('[data-testid="columns-select"]').exists()).toBe(
        true,
      );
      expect(wrapper.find('[data-testid="refresh-button"]').exists()).toBe(
        true,
      );
      expect(
        wrapper.find('[data-testid="clear-filters-button"]').exists(),
      ).toBe(true);
    });

    it('renders the dynamic filters based on currentDashboardFilters', () => {
      const filters = wrapper.findAllComponents(
        '[data-testid="dynamic-filter"]',
      );
      expect(filters.length).toBe(2);
    });

    it('disables refresh button when isLoading is true', async () => {
      await wrapper.setProps({ isLoading: true });
      const refreshButton = wrapper.find('[data-testid="refresh-button"]');
      expect(refreshButton.attributes('disabled')).toBeDefined();
    });

    it('disables clear filters button when no filters or isLoading', async () => {
      const clearButton = wrapper.find('[data-testid="clear-filters-button"]');
      expect(clearButton.attributes('disabled')).toBeDefined();

      wrapper.vm.filtersInternal.value = { sectors: ['sector1'] };
      await wrapper.vm.$nextTick();

      await wrapper.setProps({ isLoading: true });
      expect(clearButton.attributes('disabled')).toBeDefined();
    });

    it('enables clear filters button when has filters and not loading', async () => {
      wrapper.vm.filtersInternal.value = { sectors: ['sector1'] };
      await wrapper.vm.$nextTick();

      const clearButton = wrapper.find('[data-testid="clear-filters-button"]');
      expect(
        clearButton.attributes('disabled') === 'false' ||
          !clearButton.attributes('disabled'),
      ).toBeTruthy();
    });
  });

  describe('Computed properties', () => {
    it('headerOptions filters out static and hidden columns', () => {
      const headerOptions = wrapper.vm.headerOptions;
      expect(headerOptions.length).toBe(2);
      expect(headerOptions[0].value).toBe('column1');
      expect(headerOptions[1].value).toBe('column2');
    });

    it('headerOptions handles invalid headers prop', async () => {
      const { wrapper } = createWrapper({ headers: 'invalid' });
      expect(wrapper.vm.headerOptions).toEqual([]);
    });

    it('currentDashboardFilters filters based on source', () => {
      const filters = wrapper.vm.currentDashboardFilters;
      expect(filters.length).toBe(2);
      expect(filters[0].name).toBe('sectors');
      expect(filters[1].name).toBe('queues');
    });

    it('appliedFilters returns the correct state value', () => {
      const { wrapper } = createWrapper(
        {},
        {
          dashboards: { appliedFilters: { sectors: ['sector1'] } },
        },
      );
      expect(wrapper.vm.appliedFilters).toEqual({ sectors: ['sector1'] });
    });

    it('hasFiltersInternal returns true when filters exist', async () => {
      wrapper.vm.filtersInternal.value = { sectors: ['sector1'] };
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.hasFiltersInternal).toBe(true);
    });

    it('hasFiltersInternal returns false when no filters exist', () => {
      expect(wrapper.vm.hasFiltersInternal).toBe(false);
    });

    it('areStoreFiltersAndInternalEqual compares filters correctly', async () => {
      expect(wrapper.vm.areStoreFiltersAndInternalEqual).toBe(true);

      wrapper.vm.filtersInternal.value = { sectors: ['sector1'] };
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.areStoreFiltersAndInternalEqual).toBe(false);

      const { wrapper: newWrapper } = createWrapper(
        {},
        {
          dashboards: { appliedFilters: { sectors: ['sector1'] } },
        },
      );

      newWrapper.vm.filtersInternal.value = { sectors: ['sector1'] };
      await newWrapper.vm.$nextTick();

      expect(newWrapper.vm.areStoreFiltersAndInternalEqual).toBe(true);
    });
  });

  describe('Methods', () => {
    it('handleVisibleColumnsUpdate dispatches action with column names', async () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      const columns = [
        { value: 'column1', label: 'Column 1' },
        { value: 'column2', label: 'Column 2' },
      ];

      await wrapper.vm.handleVisibleColumnsUpdate(columns);

      expect(dispatchSpy).toHaveBeenCalledWith(
        'agentsColumnsFilter/setVisibleColumns',
        ['column1', 'column2'],
      );
      expect(wrapper.vm.selectedColumns).toEqual(columns);
    });

    it('handleVisibleColumnsUpdate does nothing when not initialized', async () => {
      const { wrapper, store } = createWrapper(
        {},
        {
          agentsColumnsFilter: { hasInitialized: false },
        },
      );

      const dispatchSpy = vi.spyOn(store, 'dispatch');
      const columns = [{ value: 'column1', label: 'Column 1' }];

      await wrapper.vm.handleVisibleColumnsUpdate(columns);

      expect(dispatchSpy).not.toHaveBeenCalled();
      expect(wrapper.vm.selectedColumns).not.toEqual(columns);
    });

    it('handleVisibleColumnsUpdate does nothing with invalid input', async () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      await wrapper.vm.handleVisibleColumnsUpdate('invalid');
      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('getDynamicFiltersDependsOnValues handles missing search_param', () => {
      const filter = { depends_on: { filter: 'sectors' } };
      expect(wrapper.vm.getDynamicFiltersDependsOnValues(filter)).toBeNull();
    });

    it('getDynamicFiltersDependsOnValues handles null depends_on', () => {
      const filter = { name: 'test' };
      expect(wrapper.vm.getDynamicFiltersDependsOnValues(filter)).toBeNull();
    });

    it('updateTableData dispatches resetAppliedFilters', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      wrapper.vm.updateTableData();
      expect(dispatchSpy).toHaveBeenCalledWith(
        'dashboards/resetAppliedFilters',
      );
    });

    it('syncFiltersInternal does nothing when filters are the same', async () => {
      const { wrapper } = createWrapper(
        {},
        {
          dashboards: { appliedFilters: { sectors: ['sector1'] } },
        },
      );

      wrapper.vm.filtersInternal.value = { sectors: ['sector1'] };
      await wrapper.vm.$nextTick();

      const originalValue = wrapper.vm.filtersInternal.value;

      wrapper.vm.syncFiltersInternal();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.filtersInternal.value).toBe(originalValue);
    });
  });

  describe('Component lifecycle and watchers', () => {
    it('initializes with stored columns on mount', () => {
      const { store, wrapper } = createWrapper();

      expect(store.dispatch).toHaveBeenCalledWith(
        'agentsColumnsFilter/initializeFromStorage',
      );

      expect(wrapper.vm.selectedColumns.length).toBeGreaterThan(0);
    });

    it('initializes with all available columns when none stored', () => {
      const { store, wrapper } = createWrapper(
        {},
        {
          agentsColumnsFilter: { visibleColumns: [] },
        },
      );

      expect(store.dispatch).toHaveBeenCalledWith(
        'agentsColumnsFilter/initializeFromStorage',
      );

      expect(wrapper.vm.selectedColumns.length).toBe(2);
    });
  });
});
