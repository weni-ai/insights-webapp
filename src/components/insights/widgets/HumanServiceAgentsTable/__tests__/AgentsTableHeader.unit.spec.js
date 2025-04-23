import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shallowMount, config } from '@vue/test-utils';
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

vi.mock('@/components/insights/Layout/HeaderFilters/FilterSelect.vue', () => ({
  default: {
    name: 'FilterSelect',
    template:
      '<div class="filter-select-mock" :data-testid="$attrs[\'data-testid\']"></div>',
    props: [
      'modelValue',
      'placeholder',
      'keyValueField',
      'source',
      'disabled',
      'dependsOn',
      'dependsOnValue',
    ],
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

const storageColumns = ['in_progress', 'closeds', 'column1', 'column2'];

const createMockStore = (overrideState = {}) => {
  const state = {
    agentsColumnsFilter: {
      visibleColumns: [...storageColumns],
      hasInitialized: true,
      ...overrideState.agentsColumnsFilter,
    },
    widgets: {
      currentExpansiveWidget: {
        type: 'table_dynamic_by_filter',
        data: {},
        uuid: 'test-uuid',
      },
      currentExpansiveWidgetFilters: {
        sector: '',
        queue: '',
      },
      ...overrideState.widgets,
    },
  };

  const actions = {
    'agentsColumnsFilter/initializeFromStorage': vi.fn(),
    'agentsColumnsFilter/setVisibleColumns': vi.fn(),
    'widgets/updateCurrentExpansiveWidgetFilters': vi.fn(),
    'widgets/resetCurrentExpansiveWidgetFilters': vi.fn(),
    'widgets/updateCurrentExpansiveWidgetData': vi.fn(),
  };

  return {
    state,
    dispatch: (action, payload) => {
      if (actions[action]) {
        return actions[action](payload);
      }
      return null;
    },
    actions,
  };
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
        provide: {
          store,
        },
        stubs: {
          UnnnicLabel: true,
          UnnnicSelectSmart: true,
          UnnnicButton: true,
          FilterSelect: true,
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

    it('disables refresh button when isLoading is true', async () => {
      await wrapper.setProps({ isLoading: true });
      const refreshButton = wrapper.find('[data-testid="refresh-button"]');
      expect(refreshButton.attributes('disabled')).toBeDefined();
    });

    it('disables clear filters button when no filters applied', async () => {
      const clearButton = wrapper.find('[data-testid="clear-filters-button"]');
      expect(clearButton.attributes('disabled')).toBeDefined();

      wrapper.vm.selectedSector = 'sector-123';
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.hasFiltersInternal).toBe(true);
    });
  });

  describe('Computed properties', () => {
    it('headerOptions filters out static and hidden columns', () => {
      const headerOptions = wrapper.vm.headerOptions;

      expect(headerOptions.length).toBe(4);

      const columnNames = headerOptions.map((option) => option.value);
      expect(columnNames).toContain('column1');
      expect(columnNames).toContain('column2');
      expect(columnNames).toContain('in_progress');
      expect(columnNames).toContain('closeds');

      expect(columnNames).not.toContain('status');
      expect(columnNames).not.toContain('agent');

      expect(columnNames).not.toContain('hidden_column');
      expect(columnNames).not.toContain('not_displayed');
    });

    it('hasFiltersInternal returns true when sector is set', async () => {
      wrapper.vm.selectedSector = 'sector-123';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.hasFiltersInternal).toBe(true);
    });

    it('hasFiltersInternal returns true when queue is set', async () => {
      wrapper.vm.selectedQueue = 'queue-123';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.hasFiltersInternal).toBe(true);
    });

    it('hasFiltersInternal returns false when both sector and queue are empty', () => {
      wrapper.vm.selectedSector = '';
      wrapper.vm.selectedQueue = '';
      expect(wrapper.vm.hasFiltersInternal).toBe(false);
    });
  });

  describe('Methods', () => {
    it('handleVisibleColumnsUpdate dispatches action with column names', async () => {
      const columns = [
        { value: 'column1', label: 'Column 1' },
        { value: 'column2', label: 'Column 2' },
      ];

      await wrapper.vm.handleVisibleColumnsUpdate(columns);

      expect(store.dispatch).toHaveBeenCalledWith(
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

      const columns = [{ value: 'column1', label: 'Column 1' }];

      await wrapper.vm.handleVisibleColumnsUpdate(columns);

      expect(store.dispatch).not.toHaveBeenCalledWith(
        'agentsColumnsFilter/setVisibleColumns',
        expect.anything(),
      );
      expect(wrapper.vm.selectedColumns).not.toEqual(columns);
    });

    it('updateSector updates local state and clears queue when sector changes', async () => {
      wrapper.vm.selectedSector = 'sector-123';
      wrapper.vm.selectedQueue = 'queue-456';
      await wrapper.vm.$nextTick();

      wrapper.vm.updateSector('sector-789');

      expect(wrapper.vm.selectedSector).toBe('sector-789');
      expect(wrapper.vm.selectedQueue).toBe('');
    });

    it('updateSector clears both sector and queue when value is empty', async () => {
      wrapper.vm.selectedSector = 'sector-123';
      wrapper.vm.selectedQueue = 'queue-456';
      await wrapper.vm.$nextTick();

      wrapper.vm.updateSector('');

      expect(wrapper.vm.selectedSector).toBe('');
      expect(wrapper.vm.selectedQueue).toBe('');

      expect(store.dispatch).toHaveBeenCalledWith(
        'widgets/updateCurrentExpansiveWidgetFilters',
        { queue: '' },
      );
    });

    it('updateQueue updates local state', async () => {
      wrapper.vm.updateQueue('queue-456');
      expect(wrapper.vm.selectedQueue).toBe('queue-456');
    });

    it('refreshData dispatches updateCurrentExpansiveWidgetData action', async () => {
      const mockWidget = { type: 'table_dynamic_by_filter', uuid: 'test-uuid' };
      store.state.widgets.currentExpansiveWidget = mockWidget;

      wrapper.vm.refreshData();

      expect(store.dispatch).toHaveBeenCalledWith(
        'widgets/updateCurrentExpansiveWidgetData',
        mockWidget,
      );
    });

    it('clearFilters resets local state and store filters', async () => {
      wrapper.vm.selectedSector = 'sector-123';
      wrapper.vm.selectedQueue = 'queue-456';
      await wrapper.vm.$nextTick();

      wrapper.vm.clearFilters();

      expect(wrapper.vm.selectedSector).toBe('');
      expect(wrapper.vm.selectedQueue).toBe('');

      expect(store.dispatch).toHaveBeenCalledWith(
        'widgets/resetCurrentExpansiveWidgetFilters',
      );
    });

    it('getDynamicFiltersDependsOnValues returns null when no search_param', () => {
      const result = wrapper.vm.getDynamicFiltersDependsOnValues({});
      expect(result).toBe(null);
    });

    it('getDynamicFiltersDependsOnValues returns object with sector_id', () => {
      wrapper.vm.selectedSector = 'sector-123';
      const result = wrapper.vm.getDynamicFiltersDependsOnValues({
        search_param: 'sector_id',
      });
      expect(result).toEqual({ sector_id: 'sector-123' });
    });
  });

  describe('Watchers', () => {
    it('updates store when selectedSector changes', async () => {
      wrapper.vm.selectedSector = 'sector-123';
      await wrapper.vm.$nextTick();

      expect(store.dispatch).toHaveBeenCalledWith(
        'widgets/updateCurrentExpansiveWidgetFilters',
        { sector: 'sector-123' },
      );
    });

    it('updates store when selectedQueue changes', async () => {
      wrapper.vm.selectedQueue = 'queue-456';
      await wrapper.vm.$nextTick();

      expect(store.dispatch).toHaveBeenCalledWith(
        'widgets/updateCurrentExpansiveWidgetFilters',
        { queue: 'queue-456' },
      );
    });

    it('initializes selectedColumns when headerOptions change', async () => {
      const { wrapper, store } = createWrapper(
        { headers: sampleHeaders.slice(0, 4) },
        {
          agentsColumnsFilter: { visibleColumns: [] },
        },
      );

      store.dispatch.mockClear();

      await wrapper.setProps({
        headers: [
          ...sampleHeaders,
          { name: 'new_column1', display: true, hidden_name: false },
          { name: 'new_column2', display: true, hidden_name: false },
        ],
      });

      await wrapper.vm.$nextTick();

      expect(store.dispatch).toHaveBeenCalledWith(
        'agentsColumnsFilter/setVisibleColumns',
        expect.any(Array),
      );
    });
  });

  describe('Initialization', () => {
    it('initializes with stored filter values on mount', async () => {
      const { wrapper } = createWrapper(
        {},
        {
          widgets: {
            currentExpansiveWidgetFilters: {
              sector: 'sector-123',
              queue: 'queue-456',
            },
          },
        },
      );

      expect(wrapper.vm.selectedSector).toBe('sector-123');
      expect(wrapper.vm.selectedQueue).toBe('queue-456');
    });

    it('initializes with stored columns on mount', () => {
      const { store } = createWrapper();

      expect(store.dispatch).toHaveBeenCalledWith(
        'agentsColumnsFilter/initializeFromStorage',
      );
    });

    it('initializes columns based on stored values when length > 2', () => {
      const { wrapper } = createWrapper(
        {},
        {
          agentsColumnsFilter: {
            visibleColumns: ['in_progress', 'closeds', 'column1'],
          },
        },
      );

      const selectedValues = wrapper.vm.selectedColumns.map((col) => col.value);
      expect(selectedValues).toContain('in_progress');
      expect(selectedValues).toContain('closeds');
      expect(selectedValues).toContain('column1');
      expect(selectedValues).not.toContain('column2');
    });
  });
});
