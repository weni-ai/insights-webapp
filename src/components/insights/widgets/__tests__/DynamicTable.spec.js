import { nextTick } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { beforeEach, describe, it, vi, beforeAll, afterAll } from 'vitest';
import { shallowMount, config } from '@vue/test-utils';

import { createTestingPinia } from '@pinia/testing';
import i18n from '@/utils/plugins/i18n';

import DynamicTable from '../DynamicTable.vue';
import TableHumanServiceAgents from '../HumanServiceAgentsTable/index.vue';
import TableGroup from '@/components/insights/widgets/TableGroup.vue';

beforeAll(() => {
  config.global.plugins = config.global.plugins.filter(
    (plugin) => plugin !== i18n,
  );
});

afterAll(() => {
  vi.restoreAllMocks();
});

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/:dashboardUuid/widget/:widgetUuid/report',
      name: 'report',
      component: { template: '<div>Report</div>' },
    },
    {
      path: '/dashboard/:dashboardUuid',
      name: 'dashboard',
      component: { template: '<div>Dashboard</div>' },
    },
  ],
});

const createWrapper = (props = {}, storeState = {}) => {
  const store = createTestingPinia({
    initialState: {
      dashboards: {
        dashboards: [{ name: 'Dashboard 1', uuid: '1' }],
        currentDashboard: {
          name: 'Dashboard 1',
          uuid: '1',
          config: {
            currency_type: 'USD',
          },
        },
        appliedFilters: {
          filter1: { __gte: '2023-01-01', __lte: '2023-01-07' },
        },
        ...storeState.dashboards,
      },
    },
  });

  return shallowMount(DynamicTable, {
    props: {
      widget: { type: 'table_group', config: {}, uuid: '123' },
      isLoading: false,
      isRequestingData: false,
      hasError: false,
      isConfigured: true,
      appliedFilters: {},
      ...props,
    },
    global: {
      plugins: [store, router],
      mocks: {
        $i18n: {
          locale: 'en-US',
        },
      },
    },
  });
};

describe('DynamicTable', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  describe('Component Rendering', () => {
    it('should render TableHumanServiceAgents for table_dynamic_by_filter type widgets', () => {
      wrapper = createWrapper({
        widget: { type: 'table_dynamic_by_filter', config: {}, uuid: '123' },
      });
      expect(wrapper.findComponent(TableHumanServiceAgents).exists()).toBe(
        true,
      );
      expect(
        wrapper
          .find('[data-testid="dynamic-table-table_dynamic_by_filter"]')
          .exists(),
      ).toBe(true);
    });

    it('should render TableGroup for table_group type widgets', () => {
      wrapper = createWrapper({
        widget: { type: 'table_group', config: {}, uuid: '123' },
      });
      expect(wrapper.findComponent(TableGroup).exists()).toBe(true);
      expect(
        wrapper.find('[data-testid="dynamic-table-table_group"]').exists(),
      ).toBe(true);
    });

    it('should not render any component for unknown widget types', () => {
      wrapper = createWrapper({
        widget: { type: 'unknown_type', config: {}, uuid: '123' },
      });
      expect(wrapper.html()).toBe('');
    });
  });

  describe('Computed Properties', () => {
    describe('currentComponent', () => {
      it('should return correct component for each widget type', () => {
        const testCases = [
          {
            type: 'table_dynamic_by_filter',
            expected: TableHumanServiceAgents,
          },
          { type: 'table_group', expected: TableGroup },
        ];

        testCases.forEach(({ type, expected }) => {
          wrapper = createWrapper({
            widget: { type, config: {}, uuid: '123' },
          });
          expect(wrapper.vm.currentComponent).toBe(expected);
        });
      });

      it('should return null for unknown widget types', () => {
        wrapper = createWrapper({
          widget: { type: 'unknown_type', config: {}, uuid: '123' },
        });
        expect(wrapper.vm.currentComponent).toBeNull();
      });
    });

    describe('widgetProps', () => {
      it('should generate correct props for table_dynamic_by_filter widget', () => {
        const mockData = {
          results: [
            { id: 1, name: 'Agent 1', status: 'online' },
            { id: 2, name: 'Agent 2', status: 'offline' },
          ],
        };

        const mockConfig = {
          default: {
            name_overwrite: 'Custom Table Name',
            fields: [
              {
                name: 'Name',
                value: 'name',
                display: true,
                hidden_name: false,
              },
              { name: 'ID', value: 'id', display: true, hidden_name: false },
            ],
          },
        };

        wrapper = createWrapper({
          widget: {
            type: 'table_dynamic_by_filter',
            name: 'Original Table Name',
            config: mockConfig,
            uuid: '123',
            data: mockData,
          },
        });

        const props = wrapper.vm.widgetProps;
        expect(props.headerTitle).toBe('Custom Table Name');
        expect(props.items).toEqual(mockData.results);
        expect(props.headers).toHaveLength(3);
        expect(props.headers[0]).toEqual({
          name: 'status',
          value: 'status',
          display: true,
          hidden_name: false,
        });
      });

      it('should use widget name when no name_overwrite is provided', () => {
        const mockConfig = {
          default: {
            fields: [
              {
                name: 'Name',
                value: 'name',
                display: true,
                hidden_name: false,
              },
            ],
          },
        };

        wrapper = createWrapper({
          widget: {
            type: 'table_dynamic_by_filter',
            name: 'Original Table Name',
            config: mockConfig,
            uuid: '123',
            data: { results: [] },
          },
        });

        const props = wrapper.vm.widgetProps;
        expect(props.headerTitle).toBe('Original Table Name');
      });

      it('should generate correct props for table_group widget', () => {
        const mockConfig = {
          tab1: { name: 'Tab 1', filters: {} },
          tab2: { name: 'Tab 2', filters: {} },
        };

        const mockData = {
          results: [{ id: 1, value: 100 }],
          count: 50,
        };

        wrapper = createWrapper({
          widget: {
            type: 'table_group',
            config: mockConfig,
            uuid: '123',
            data: mockData,
          },
        });

        const props = wrapper.vm.widgetProps;
        expect(props.tabs).toEqual(mockConfig);
        expect(props.data).toEqual(mockData.results);
        expect(props.paginationTotal).toBe(50);
      });

      it('should handle missing data gracefully', () => {
        wrapper = createWrapper({
          widget: {
            type: 'table_dynamic_by_filter',
            name: 'Test Table',
            config: { default: { fields: [] } },
            uuid: '123',
          },
        });

        const props = wrapper.vm.widgetProps;
        expect(props.items).toEqual([]);
      });
    });
  });

  describe('Methods', () => {
    describe('getTableDynamicFilterConfig', () => {
      it('should return created_on config when created_on filter is applied', () => {
        const mockConfig = {
          created_on: {
            name_overwrite: 'Filtered Table',
            fields: [{ name: 'Date', value: 'date' }],
          },
          default: {
            name_overwrite: 'Default Table',
            fields: [{ name: 'Name', value: 'name' }],
          },
        };

        wrapper = createWrapper({
          widget: {
            type: 'table_dynamic_by_filter',
            config: mockConfig,
            uuid: '123',
          },
          appliedFilters: { created_on: { start: '2023-01-01' } },
        });

        const result = wrapper.vm.getTableDynamicFilterConfig();
        expect(result).toEqual(mockConfig.created_on);
      });

      it('should return default config when no created_on filter is applied', () => {
        const mockConfig = {
          created_on: {
            name_overwrite: 'Filtered Table',
            fields: [{ name: 'Date', value: 'date' }],
          },
          default: {
            name_overwrite: 'Default Table',
            fields: [{ name: 'Name', value: 'name' }],
          },
        };

        wrapper = createWrapper({
          widget: {
            type: 'table_dynamic_by_filter',
            config: mockConfig,
            uuid: '123',
          },
          appliedFilters: { other_filter: 'value' },
        });

        const result = wrapper.vm.getTableDynamicFilterConfig();
        expect(result).toEqual(mockConfig.default);
      });

      it('should handle missing config gracefully', () => {
        wrapper = createWrapper({
          widget: {
            type: 'table_dynamic_by_filter',
            config: {},
            uuid: '123',
          },
        });

        const result = wrapper.vm.getTableDynamicFilterConfig();
        expect(result).toBeUndefined();
      });
    });

    describe('redirectToTableAgents', () => {
      it('should emit redirect-to-expansive event with widget data', async () => {
        const testWidget = {
          type: 'table_dynamic_by_filter',
          config: {},
          uuid: '123',
        };

        wrapper = createWrapper({ widget: testWidget });

        wrapper.vm.redirectToTableAgents();
        await nextTick();

        expect(wrapper.emitted('redirect-to-expansive')).toBeTruthy();
        expect(wrapper.emitted('redirect-to-expansive')[0][0]).toEqual(
          testWidget,
        );
      });
    });
  });

  describe('Props Validation', () => {
    it('should handle all props correctly', () => {
      const testProps = {
        widget: { type: 'table_group', config: {}, uuid: '123' },
        isLoading: true,
        isRequestingData: true,
        hasError: true,
        isConfigured: false,
        appliedFilters: { test: 'filter' },
      };

      wrapper = createWrapper(testProps);

      expect(wrapper.props()).toEqual(expect.objectContaining(testProps));
    });

    it('should use default prop values', () => {
      wrapper = createWrapper({
        widget: { type: 'table_group', config: {}, uuid: '123' },
      });

      expect(wrapper.props('isLoading')).toBe(false);
      expect(wrapper.props('isRequestingData')).toBe(false);
      expect(wrapper.props('hasError')).toBe(false);
      expect(wrapper.props('isConfigured')).toBe(true);
      expect(wrapper.props('appliedFilters')).toEqual({});
    });
  });

  describe('Event Handling', () => {
    it('should emit redirect-to-expansive when seeMore is called for table_dynamic_by_filter', async () => {
      const testWidget = {
        type: 'table_dynamic_by_filter',
        config: {},
        uuid: '123',
      };

      wrapper = createWrapper({ widget: testWidget });

      const events = wrapper.vm.widgetEvents;
      events.seeMore();
      await nextTick();

      expect(wrapper.emitted('redirect-to-expansive')).toBeTruthy();
      expect(wrapper.emitted('redirect-to-expansive')[0][0]).toEqual(
        testWidget,
      );
    });

    it('should emit request-data when requestData is called for table_group', async () => {
      wrapper = createWrapper({
        widget: { type: 'table_group', config: {}, uuid: '123' },
      });

      const requestParams = { offset: 10, limit: 20 };
      const events = wrapper.vm.widgetEvents;
      events.requestData(requestParams);
      await nextTick();

      expect(wrapper.emitted('request-data')).toBeTruthy();
      expect(wrapper.emitted('request-data')[0][0]).toEqual(requestParams);
    });
  });

  describe('Widget Events Mapping', () => {
    it('should return correct events for table_dynamic_by_filter widget', () => {
      wrapper = createWrapper({
        widget: { type: 'table_dynamic_by_filter', config: {}, uuid: '123' },
      });

      const events = wrapper.vm.widgetEvents;
      expect(events).toHaveProperty('seeMore');
      expect(typeof events.seeMore).toBe('function');
    });

    it('should return correct events for table_group widget', () => {
      wrapper = createWrapper({
        widget: { type: 'table_group', config: {}, uuid: '123' },
      });

      const events = wrapper.vm.widgetEvents;
      expect(events).toHaveProperty('requestData');
      expect(typeof events.requestData).toBe('function');
    });

    it('should return empty events object for unknown widget types', () => {
      wrapper = createWrapper({
        widget: { type: 'unknown_type', config: {}, uuid: '123' },
      });

      const events = wrapper.vm.widgetEvents;
      expect(events).toEqual({});
    });
  });

  describe('Edge Cases', () => {
    it('should handle widget without data', () => {
      wrapper = createWrapper({
        widget: { type: 'table_group', config: {}, uuid: '123' },
      });

      const props = wrapper.vm.widgetProps;
      expect(props.data).toBeUndefined();
      expect(props.paginationTotal).toBeUndefined();
    });

    it('should handle widget with null data', () => {
      wrapper = createWrapper({
        widget: {
          type: 'table_group',
          config: {},
          uuid: '123',
          data: null,
        },
      });

      const props = wrapper.vm.widgetProps;
      expect(props.data).toBeUndefined();
      expect(props.paginationTotal).toBeUndefined();
    });

    it('should handle widget without config', () => {
      wrapper = createWrapper({
        widget: { type: 'table_dynamic_by_filter', uuid: '123' },
      });

      const config = wrapper.vm.getTableDynamicFilterConfig();
      expect(config).toBeUndefined();
    });

    it('should handle empty table data for table_dynamic_by_filter', () => {
      wrapper = createWrapper({
        widget: {
          type: 'table_dynamic_by_filter',
          name: 'Empty Table',
          config: { default: { fields: [] } },
          uuid: '123',
          data: { results: [] },
        },
      });

      const props = wrapper.vm.widgetProps;
      expect(props.items).toEqual([]);
      expect(props.headers).toHaveLength(1);
    });

    it('should handle missing fields in config', () => {
      wrapper = createWrapper({
        widget: {
          type: 'table_dynamic_by_filter',
          name: 'Test Table',
          config: { default: {} },
          uuid: '123',
          data: { results: [] },
        },
      });

      const props = wrapper.vm.widgetProps;
      expect(props.headers).toHaveLength(1);
      expect(props.headers[0].name).toBe('status');
    });

    it('should handle missing widget properties', () => {
      wrapper = createWrapper({
        widget: { type: 'table_group', uuid: '123' },
      });

      const events = wrapper.vm.widgetEvents;
      expect(events).toHaveProperty('requestData');
    });
  });

  describe('Configuration Switching', () => {
    it('should switch between default and created_on config based on filters', () => {
      const mockConfig = {
        created_on: {
          name_overwrite: 'Date Filtered Table',
          fields: [{ name: 'Date', value: 'created_on' }],
        },
        default: {
          name_overwrite: 'Default Table',
          fields: [{ name: 'Name', value: 'name' }],
        },
      };

      wrapper = createWrapper({
        widget: {
          type: 'table_dynamic_by_filter',
          config: mockConfig,
          uuid: '123',
        },
        appliedFilters: { created_on: { start: '2023-01-01' } },
      });

      let props = wrapper.vm.widgetProps;
      expect(props.headerTitle).toBe('Date Filtered Table');
      expect(props.headers[1].name).toBe('Date');

      wrapper = createWrapper({
        widget: {
          type: 'table_dynamic_by_filter',
          config: mockConfig,
          uuid: '123',
        },
        appliedFilters: {},
      });

      props = wrapper.vm.widgetProps;
      expect(props.headerTitle).toBe('Default Table');
      expect(props.headers[1].name).toBe('Name');
    });

    it('should handle partial config objects', () => {
      const mockConfig = {
        default: {
          name_overwrite: 'Partial Config',
        },
      };

      wrapper = createWrapper({
        widget: {
          type: 'table_dynamic_by_filter',
          config: mockConfig,
          uuid: '123',
        },
      });

      const props = wrapper.vm.widgetProps;
      expect(props.headerTitle).toBe('Partial Config');
      expect(props.headers).toHaveLength(1);
    });
  });

  describe('Widget Props Integration', () => {
    it('should integrate all default props correctly', () => {
      wrapper = createWrapper({
        widget: { type: 'table_group', config: {}, uuid: '123' },
        isLoading: true,
      });

      const props = wrapper.vm.widgetProps;
      expect(props.isLoading).toBe(true);
    });

    it('should combine default and specific props correctly for table_dynamic_by_filter', () => {
      const mockData = { results: [{ id: 1 }] };
      wrapper = createWrapper({
        widget: {
          type: 'table_dynamic_by_filter',
          name: 'Test',
          config: { default: {} },
          uuid: '123',
          data: mockData,
        },
        isLoading: false,
      });

      const props = wrapper.vm.widgetProps;
      expect(props.isLoading).toBe(false);
      expect(props.headerTitle).toBe('Test');
      expect(props.items).toEqual(mockData.results);
    });

    it('should combine default and specific props correctly for table_group', () => {
      const mockConfig = { tab1: {} };
      const mockData = { results: [], count: 0 };

      wrapper = createWrapper({
        widget: {
          type: 'table_group',
          config: mockConfig,
          uuid: '123',
          data: mockData,
        },
        isLoading: true,
      });

      const props = wrapper.vm.widgetProps;
      expect(props.isLoading).toBe(true);
      expect(props.tabs).toEqual(mockConfig);
      expect(props.data).toEqual(mockData.results);
      expect(props.paginationTotal).toBe(0);
    });
  });
});
