import { mount, flushPromises, config } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createI18n } from 'vue-i18n';
import en from '@/locales/en.json';

import ExpansiveWidget from '../../ExpansiveWidget.vue';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n, UnnnicSystem];

vi.stubGlobal(
  'setInterval',
  vi.fn(() => 123),
);
vi.stubGlobal('clearInterval', vi.fn());

describe('ExpansiveWidget', () => {
  let wrapper;
  let store;
  let actions;
  let state;

  const createMockWidget = (type = 'table_dynamic_by_filter', data = {}) => ({
    value: {
      type,
      name: 'Test Widget',
      data: {
        results: data.results || [
          {
            id: 1,
            agent: 'John',
            status: { status: 'green', label: 'Online' },
            opened: 5,
            closed: 3,
            custom_status: [
              { status_type: 'column1', break_time: 3600 },
              { status_type: 'column2', break_time: 7200 },
            ],
          },
        ],
      },
      config: {
        default: {
          name_overwrite: '',
          fields: [
            {
              name: 'agent',
              value: 'agent',
              display: true,
              hidden_name: false,
            },
            {
              name: 'in_progress',
              value: 'opened',
              display: true,
              hidden_name: false,
            },
            {
              name: 'closeds',
              value: 'closed',
              display: true,
              hidden_name: false,
            },
          ],
        },
        created_on: {
          name_overwrite: 'Created On Widget',
          fields: [
            {
              name: 'agent',
              value: 'agent',
              display: true,
              hidden_name: false,
            },
            {
              name: 'in_progress',
              value: 'opened',
              display: true,
              hidden_name: false,
            },
          ],
        },
      },
    },
  });

  const createMockStore = (overrides = {}) => {
    actions = {
      'widgets/updateCurrentExpansiveWidgetData': vi.fn(),
      ...overrides.actions,
    };

    state = {
      widgets: {
        isLoadingCurrentExpansiveWidget: false,
        ...overrides.widgetsState,
      },
      dashboards: {
        appliedFilters: {},
        ...overrides.dashboardsState,
      },
    };

    return {
      state,
      dispatch: (action, payload) => {
        if (actions[action]) {
          return actions[action]({}, payload);
        }
        return null;
      },
    };
  };

  beforeEach(() => {
    store = createMockStore();

    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) wrapper.unmount();
  });

  describe('Component rendering', () => {
    it('renders correctly with the provided widget prop', async () => {
      const mockWidget = createMockWidget();
      wrapper = mount(ExpansiveWidget, {
        props: {
          widget: mockWidget,
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          provide: {
            store: store,
          },
          stubs: {
            HumanServiceAgentsTable: true,
          },
        },
      });

      await flushPromises();

      const container = wrapper.find('[data-testid="expansive-widget"]');
      expect(container.exists()).toBe(true);
    });

    it('does not render any component for unsupported widget type', async () => {
      const mockWidget = createMockWidget('unsupported_type');
      wrapper = mount(ExpansiveWidget, {
        props: {
          widget: mockWidget,
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          provide: {
            store: store,
          },
          stubs: {
            HumanServiceAgentsTable: true,
          },
        },
      });

      await flushPromises();

      expect(wrapper.vm.currentComponent).toBe(null);
    });
  });

  describe('Computed properties', () => {
    it('correctly computes isLoading from store state', async () => {
      const customStore = createMockStore({
        widgetsState: {
          isLoadingCurrentExpansiveWidget: true,
        },
      });

      const mockWidget = createMockWidget();
      wrapper = mount(ExpansiveWidget, {
        props: {
          widget: mockWidget,
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          provide: {
            store: customStore,
          },
          stubs: {
            HumanServiceAgentsTable: true,
          },
        },
      });

      expect(wrapper.vm.isLoading).toBe(true);
    });

    it('correctly computes appliedFilters from store state', async () => {
      const customFilters = { created_on: '2023-01-01' };
      const customStore = createMockStore({
        dashboardsState: {
          appliedFilters: customFilters,
        },
      });

      const mockWidget = createMockWidget();
      wrapper = mount(ExpansiveWidget, {
        props: {
          widget: mockWidget,
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          provide: {
            store: customStore,
          },
          stubs: {
            HumanServiceAgentsTable: true,
          },
        },
      });

      expect(wrapper.vm.appliedFilters).toEqual(customFilters);
    });

    it('computes correct widgetProps for table_dynamic_by_filter with default config', async () => {
      const mockWidget = createMockWidget();
      wrapper = mount(ExpansiveWidget, {
        props: {
          widget: mockWidget,
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          provide: {
            store: store,
          },
          stubs: {
            HumanServiceAgentsTable: true,
          },
        },
      });

      const props = wrapper.vm.widgetProps;

      expect(props.isExpansive).toBe(true);
      expect(props.isLoading).toBe(false);
      expect(props.headerTitle).toBe('Test Widget');
      expect(props.headers).toHaveLength(6);

      // Check first item is transformed correctly
      expect(props.items).toHaveLength(1);
      expect(props.items[0].custom_status).toEqual({
        column1: 3600,
        column2: 7200,
      });
    });

    it('computes correct widgetProps for table_dynamic_by_filter with created_on config', async () => {
      const customFilters = { created_on: '2023-01-01' };
      const customStore = createMockStore({
        dashboardsState: {
          appliedFilters: customFilters,
        },
      });

      const mockWidget = createMockWidget();
      wrapper = mount(ExpansiveWidget, {
        props: {
          widget: mockWidget,
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          provide: {
            store: customStore,
          },
          stubs: {
            HumanServiceAgentsTable: true,
          },
        },
      });

      const props = wrapper.vm.widgetProps;

      expect(props.headerTitle).toBe('Created On Widget');
      expect(props.headers).toHaveLength(5);
    });

    it('computes correct widgetProps with missing data', async () => {
      const mockWidget = createMockWidget();
      mockWidget.value.data.results = undefined;

      wrapper = mount(ExpansiveWidget, {
        props: {
          widget: mockWidget,
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          provide: {
            store: store,
          },
          stubs: {
            HumanServiceAgentsTable: true,
          },
        },
      });

      const props = wrapper.vm.widgetProps;

      expect(props.items).toEqual([]);
      expect(props.headers).toHaveLength(4);
    });
  });

  describe('Methods and Lifecycle', () => {
    it('calls updateWidgetData on mount', async () => {
      const mockWidget = createMockWidget();
      wrapper = mount(ExpansiveWidget, {
        props: {
          widget: mockWidget,
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          provide: {
            store: store,
          },
          stubs: {
            HumanServiceAgentsTable: true,
          },
        },
      });

      await flushPromises();

      expect(
        actions['widgets/updateCurrentExpansiveWidgetData'],
      ).toHaveBeenCalledWith(expect.anything(), mockWidget.value);
    });

    it('sets up polling interval on mount', async () => {
      const mockWidget = createMockWidget();
      wrapper = mount(ExpansiveWidget, {
        props: {
          widget: mockWidget,
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          provide: {
            store: store,
          },
          stubs: {
            HumanServiceAgentsTable: true,
          },
        },
      });

      await flushPromises();

      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 60000);
      expect(wrapper.vm.pollingInterval).toBe(123); // The mock return value
    });

    it('clears polling interval on unmount', async () => {
      const mockWidget = createMockWidget();
      wrapper = mount(ExpansiveWidget, {
        props: {
          widget: mockWidget,
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          provide: {
            store: store,
          },
          stubs: {
            HumanServiceAgentsTable: true,
          },
        },
      });

      await flushPromises();
      wrapper.unmount();

      expect(clearInterval).toHaveBeenCalledWith(123);
    });

    it('updateWidgetData does not call store action for unsupported widget type', async () => {
      const mockWidget = createMockWidget('unsupported_type');
      wrapper = mount(ExpansiveWidget, {
        props: {
          widget: mockWidget,
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          provide: {
            store: store,
          },
          stubs: {
            HumanServiceAgentsTable: true,
          },
        },
      });

      await flushPromises();

      actions['widgets/updateCurrentExpansiveWidgetData'].mockClear();

      await wrapper.vm.updateWidgetData();

      expect(
        actions['widgets/updateCurrentExpansiveWidgetData'],
      ).not.toHaveBeenCalled();
    });
  });
});
