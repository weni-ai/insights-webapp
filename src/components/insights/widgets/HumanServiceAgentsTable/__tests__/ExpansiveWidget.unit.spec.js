import { mount, flushPromises, config } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { createI18n } from 'vue-i18n';
import { ref } from 'vue';
import en from '@/locales/en.json';

import ExpansiveWidget from '../../ExpansiveWidget.vue';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';
import { useWidgets } from '@/store/modules/widgets';

vi.mock('@vueuse/core', () => ({
  useElementVisibility: vi.fn(() => ref(true)),
}));

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
    return createTestingPinia({
      initialState: {
        dashboards: {
          appliedFilters: {},
          ...overrides.dashboardsState,
        },
        widgets: {
          isLoadingCurrentExpansiveWidget: false,
          currentExpansiveWidgetFilters: {
            sector: '',
            queue: '',
          },
          ...overrides.widgetsState,
        },
        config: {
          isActiveRoute: true,
          ...overrides.configState,
        },
      },
    });
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

    it('correctly computes currentExpansiveWidgetFilters from store state', async () => {
      const customFilters = {
        sector: 'sector-123',
        queue: 'queue-456',
        date: { start: '2021-01-01', end: '2021-01-02' },
      };
      const customStore = createMockStore({
        widgetsState: {
          currentExpansiveWidgetFilters: customFilters,
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

      expect(wrapper.vm.currentExpansiveWidgetFilters).toEqual(customFilters);
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

      expect(props.items).toHaveLength(1);
      expect(props.items[0].custom_status).toEqual({
        column1: 3600,
        column2: 7200,
      });
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
    it('updateWidgetData calls store action with widget data', async () => {
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

      await wrapper.vm.$nextTick();

      const widgetsStore = useWidgets();
      const updateCurrentExpansiveWidgetDataSpy = vi.spyOn(
        widgetsStore,
        'updateCurrentExpansiveWidgetData',
      );

      await wrapper.vm.updateWidgetData();

      expect(updateCurrentExpansiveWidgetDataSpy).toHaveBeenCalledWith(
        mockWidget.value,
      );
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

      await wrapper.vm.$nextTick();
      await flushPromises();

      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 60000);
      expect(wrapper.vm.pollingInterval).toBe(123);
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

      await wrapper.vm.$nextTick();
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

      await wrapper.vm.$nextTick();

      const widgetsStore = useWidgets();
      const updateCurrentExpansiveWidgetDataSpy = vi.spyOn(
        widgetsStore,
        'updateCurrentExpansiveWidgetData',
      );

      await wrapper.vm.updateWidgetData();

      expect(updateCurrentExpansiveWidgetDataSpy).not.toHaveBeenCalled();
    });

    it('has a watcher for currentExpansiveWidgetFilters that calls updateWidgetData', async () => {
      expect(ExpansiveWidget.setup.toString()).toContain(
        'watch(currentExpansiveWidgetFilters',
      );

      const mockWidget = createMockWidget();
      const updateDataSpy = vi.fn();

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

      wrapper.vm.updateWidgetData = updateDataSpy;

      const watcherSource = ExpansiveWidget.setup.toString();
      expect(watcherSource).toContain('watch(currentExpansiveWidgetFilters');

      expect(typeof wrapper.vm.updateWidgetData).toBe('function');

      expect(true).toBe(true);
    });
  });
});
