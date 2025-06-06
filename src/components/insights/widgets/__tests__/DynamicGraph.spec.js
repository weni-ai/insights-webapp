import { nextTick } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import {
  afterEach,
  beforeEach,
  describe,
  it,
  vi,
  beforeAll,
  afterAll,
} from 'vitest';
import { shallowMount, config } from '@vue/test-utils';

import { createTestingPinia } from '@pinia/testing';
import i18n from '@/utils/plugins/i18n';

import DynamicGraph from '../DynamicGraph.vue';
import LineChart from '@/components/insights/charts/LineChart.vue';
import HorizontalBarChart from '@/components/insights/charts/HorizontalBarChart.vue';
import CardFunnel from '@/components/insights/cards/CardFunnel.vue';

beforeAll(() => {
  config.global.plugins = config.global.plugins.filter(
    (plugin) => plugin !== i18n,
  );
});

afterAll(() => {
  vi.restoreAllMocks();
});

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key) => key,
    locale: 'en-US',
  }),
}));

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

  return shallowMount(DynamicGraph, {
    props: {
      widget: { type: 'graph_column', config: {}, uuid: '123' },
      isLoading: false,
      isRequestingData: false,
      hasError: false,
      isConfigured: true,
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

describe('DynamicGraph', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  describe('Component Rendering', () => {
    it('should render LineChart for graph_column type widgets', () => {
      wrapper = createWrapper({
        widget: { type: 'graph_column', config: {}, uuid: '123' },
      });
      expect(wrapper.findComponent(LineChart).exists()).toBe(true);
      expect(
        wrapper.find('[data-testid="dynamic-graph-graph_column"]').exists(),
      ).toBe(true);
    });

    it('should render HorizontalBarChart for graph_bar type widgets', () => {
      wrapper = createWrapper({
        widget: { type: 'graph_bar', config: {}, uuid: '123' },
      });
      expect(wrapper.findComponent(HorizontalBarChart).exists()).toBe(true);
      expect(
        wrapper.find('[data-testid="dynamic-graph-graph_bar"]').exists(),
      ).toBe(true);
    });

    it('should render CardFunnel for graph_funnel type widgets', () => {
      wrapper = createWrapper({
        widget: { type: 'graph_funnel', config: {}, uuid: '123' },
      });
      expect(wrapper.findComponent(CardFunnel).exists()).toBe(true);
      expect(
        wrapper.find('[data-testid="dynamic-graph-graph_funnel"]').exists(),
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
          { type: 'graph_column', expected: LineChart },
          { type: 'graph_bar', expected: HorizontalBarChart },
          { type: 'graph_funnel', expected: CardFunnel },
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

    describe('widgetGraphData', () => {
      it('should format graph data correctly for graph_column', () => {
        const mockData = {
          data: [
            { label: 'Jan', value: 100, full_value: 1000 },
            { label: 'Feb', value: 200, full_value: 2000 },
          ],
        };

        wrapper = createWrapper({
          widget: {
            type: 'graph_column',
            config: {},
            uuid: '123',
            data: mockData,
          },
        });

        const result = wrapper.vm.widgetGraphData;
        expect(result.labels).toEqual(['Jan', 'Feb']);
        expect(result.datasets[0].data).toEqual([100, 200]);
        expect(result.datasets[0].fullValues).toEqual([1000, 2000]);
      });

      it('should format graph data correctly with results property', () => {
        const mockData = {
          results: [
            { label: 'Q1', value: 300, full_value: 3000 },
            { label: 'Q2', value: 400, full_value: 4000 },
          ],
        };

        wrapper = createWrapper({
          widget: {
            type: 'graph_bar',
            config: {},
            uuid: '123',
            data: mockData,
          },
        });

        const result = wrapper.vm.widgetGraphData;
        expect(result.labels).toEqual(['Q1', 'Q2']);
        expect(result.datasets[0].data).toEqual([300, 400]);
        expect(result.datasets[0].fullValues).toEqual([3000, 4000]);
      });

      it('should return undefined for graph_funnel widgets', () => {
        wrapper = createWrapper({
          widget: {
            type: 'graph_funnel',
            config: {},
            uuid: '123',
            data: { data: [{ label: 'Test', value: 100 }] },
          },
        });

        expect(wrapper.vm.widgetGraphData).toBeUndefined();
      });

      it('should return undefined for non-graph widgets', () => {
        wrapper = createWrapper({
          widget: {
            type: 'card',
            config: {},
            uuid: '123',
            data: { data: [{ label: 'Test', value: 100 }] },
          },
        });

        expect(wrapper.vm.widgetGraphData).toBeUndefined();
      });

      it('should return undefined when no data exists', () => {
        wrapper = createWrapper({
          widget: { type: 'graph_column', config: {}, uuid: '123' },
        });

        expect(wrapper.vm.widgetGraphData).toBeUndefined();
      });
    });
  });

  describe('Methods', () => {
    describe('redirectToReport', () => {
      beforeEach(() => {
        vi.spyOn(router, 'push').mockImplementation(() => {});
        vi.spyOn(window, 'open').mockImplementation(() => {});
      });

      afterEach(() => {
        vi.restoreAllMocks();
      });

      it('should redirect to internal report', async () => {
        await router.push({
          name: 'dashboard',
          params: { dashboardUuid: '1' },
        });

        wrapper = createWrapper({
          widget: {
            type: 'graph_column',
            uuid: '123',
            report: { type: 'internal' },
            config: {},
          },
        });

        wrapper.vm.redirectToReport();

        expect(router.push).toHaveBeenCalledWith({
          name: 'report',
          params: {
            dashboardUuid: '1',
            widgetUuid: '123',
          },
          query: {},
        });
      });

      it('should open external report in new window', () => {
        wrapper = createWrapper({
          widget: {
            type: 'graph_column',
            uuid: '123',
            report: { type: 'external', url: 'https://example.com' },
            config: {},
          },
        });

        wrapper.vm.redirectToReport();

        expect(window.open).toHaveBeenCalledWith(
          'https://example.com',
          '_blank',
        );
      });

      it('should do nothing if no report is configured', () => {
        wrapper = createWrapper({
          widget: { type: 'graph_column', uuid: '123', config: {} },
        });

        wrapper.vm.redirectToReport();

        expect(router.push).not.toHaveBeenCalled();
        expect(window.open).not.toHaveBeenCalled();
      });

      it('should handle unknown report type', () => {
        wrapper = createWrapper({
          widget: {
            type: 'graph_column',
            uuid: '123',
            report: { type: 'unknown' },
            config: {},
          },
        });

        wrapper.vm.redirectToReport();

        expect(router.push).not.toHaveBeenCalled();
        expect(window.open).not.toHaveBeenCalled();
      });
    });
  });

  describe('Props Validation', () => {
    it('should handle all props correctly', () => {
      const testProps = {
        widget: { type: 'graph_column', config: {}, uuid: '123' },
        isLoading: true,
        isRequestingData: true,
        hasError: true,
        isConfigured: false,
      };

      wrapper = createWrapper(testProps);

      expect(wrapper.props()).toEqual(expect.objectContaining(testProps));
    });

    it('should use default prop values', () => {
      wrapper = createWrapper({
        widget: { type: 'graph_column', config: {}, uuid: '123' },
      });

      expect(wrapper.props('isLoading')).toBe(false);
      expect(wrapper.props('isRequestingData')).toBe(false);
      expect(wrapper.props('hasError')).toBe(false);
      expect(wrapper.props('isConfigured')).toBe(true);
    });
  });

  describe('Event Handling', () => {
    it('should emit open-config for graph_funnel widget', async () => {
      wrapper = createWrapper({
        widget: { type: 'graph_funnel', config: {}, uuid: '123' },
      });

      const events = wrapper.vm.widgetEvents;
      events.openConfig();
      await nextTick();

      expect(wrapper.emitted('open-config')).toBeTruthy();
    });

    it('should emit request-data for graph_funnel widget', async () => {
      const testWidget = {
        type: 'graph_funnel',
        uuid: '123',
        config: { test: 'config' },
      };
      wrapper = createWrapper({ widget: testWidget });

      const events = wrapper.vm.widgetEvents;
      events.requestData();
      await nextTick();

      expect(wrapper.emitted('request-data')).toBeTruthy();
      expect(wrapper.emitted('request-data')[0][0]).toEqual({
        uuid: '123',
        config: testWidget.config,
      });
    });

    it('should emit clickData for graph_bar widget with flow data', async () => {
      const testWidget = {
        type: 'graph_bar',
        uuid: '123',
        config: {
          flow: { uuid: 'flow-123' },
          op_field: 'test-field',
        },
      };
      wrapper = createWrapper({ widget: testWidget });

      const eventData = { data: 'test' };
      const events = wrapper.vm.widgetEvents;
      events.clickData(eventData);
      await nextTick();

      expect(wrapper.emitted('clickData')).toBeTruthy();
      expect(wrapper.emitted('clickData')[0][0]).toEqual({
        data: 'test',
        flow: {
          uuid: 'flow-123',
          result: 'test-field',
        },
      });
    });

    it('should handle flow from filter config for graph_bar widget', async () => {
      const testWidget = {
        type: 'graph_bar',
        uuid: '123',
        config: {
          filter: { flow: 'filter-flow-123' },
          op_field: 'filter-field',
        },
      };
      wrapper = createWrapper({ widget: testWidget });

      const eventData = { data: 'test' };
      const events = wrapper.vm.widgetEvents;
      events.clickData(eventData);
      await nextTick();

      expect(wrapper.emitted('clickData')).toBeTruthy();
      expect(wrapper.emitted('clickData')[0][0]).toEqual({
        data: 'test',
        flow: {
          uuid: 'filter-flow-123',
          result: 'filter-field',
        },
      });
    });

    it('should call seeMore event for graph_column widget', async () => {
      const testWidget = {
        type: 'graph_column',
        uuid: '123',
        config: {},
        report: { type: 'internal' },
      };

      const redirectSpy = vi.spyOn(router, 'push').mockImplementation(() => {});
      wrapper = createWrapper({ widget: testWidget });

      const events = wrapper.vm.widgetEvents;
      events.seeMore();
      await nextTick();

      expect(redirectSpy).toHaveBeenCalled();
    });
  });

  describe('Widget Props Generation', () => {
    it('should generate correct props for graph_column widget', () => {
      const mockData = {
        data: [{ label: 'Test', value: 100, full_value: 1000 }],
      };

      wrapper = createWrapper({
        widget: {
          type: 'graph_column',
          name: 'Test Column Chart',
          config: {},
          uuid: '123',
          data: mockData,
          report: { type: 'internal' },
        },
      });

      const props = wrapper.vm.widgetProps;
      expect(props.title).toBe('Test Column Chart');
      expect(props.seeMore).toBe(true);
      expect(props.chartData).toBeDefined();
      expect(props.chartData.labels).toEqual(['Test']);
    });

    it('should generate correct props for graph_bar widget', () => {
      const mockData = {
        data: [{ label: 'Test', value: 200, full_value: 2000 }],
      };

      wrapper = createWrapper({
        widget: {
          type: 'graph_bar',
          name: 'Test Bar Chart',
          config: { data_suffix: '%' },
          uuid: '123',
          data: mockData,
          report: { type: 'external', url: 'https://example.com' },
        },
      });

      const props = wrapper.vm.widgetProps;
      expect(props.title).toBe('Test Bar Chart');
      expect(props.datalabelsSuffix).toBe('%');
      expect(props.seeMore).toBe(true);
      expect(props.chartData).toBeDefined();
    });

    it('should generate correct props for graph_funnel widget', () => {
      const mockData = [{ stage: 'A', value: 100 }];

      wrapper = createWrapper({
        widget: {
          type: 'graph_funnel',
          name: 'Test Funnel',
          config: {},
          uuid: '123',
          data: mockData,
          is_configurable: true,
        },
        isConfigured: true,
        hasError: false,
        isRequestingData: true,
      });

      const props = wrapper.vm.widgetProps;
      expect(props.widget).toBeDefined();
      expect(props.chartData).toEqual(mockData);
      expect(props.configurable).toBe(true);
      expect(props.configured).toBe(true);
      expect(props.hasError).toBe(false);
      expect(props.isLoading).toBe(true);
    });

    it('should handle empty chart data', () => {
      wrapper = createWrapper({
        widget: {
          type: 'graph_column',
          name: 'Empty Chart',
          config: {},
          uuid: '123',
        },
      });

      const props = wrapper.vm.widgetProps;
      expect(props.chartData).toEqual({});
    });
  });

  describe('Edge Cases', () => {
    it('should handle widget without data', () => {
      wrapper = createWrapper({
        widget: { type: 'graph_column', config: {}, uuid: '123' },
      });

      expect(wrapper.vm.widgetGraphData).toBeUndefined();
    });

    it('should handle widget with null data', () => {
      wrapper = createWrapper({
        widget: {
          type: 'graph_column',
          config: {},
          uuid: '123',
          data: null,
        },
      });

      expect(wrapper.vm.widgetGraphData).toBeUndefined();
    });

    it('should handle widget without config', () => {
      wrapper = createWrapper({
        widget: { type: 'graph_column', uuid: '123' },
      });

      const events = wrapper.vm.widgetEvents;
      expect(events).toHaveProperty('seeMore');
      expect(typeof events.seeMore).toBe('function');
    });

    it('should handle empty graph data', () => {
      wrapper = createWrapper({
        widget: {
          type: 'graph_column',
          config: {},
          uuid: '123',
          data: { data: [] },
        },
      });

      const result = wrapper.vm.widgetGraphData;
      expect(result.labels).toEqual([]);
      expect(result.datasets[0].data).toEqual([]);
    });

    it('should handle missing widget properties', () => {
      wrapper = createWrapper({
        widget: { type: 'graph_funnel', uuid: '123' },
      });

      const events = wrapper.vm.widgetEvents;
      expect(events).toHaveProperty('openConfig');
      expect(events).toHaveProperty('requestData');
    });

    it('should return empty events object for unknown widget types', () => {
      wrapper = createWrapper({
        widget: { type: 'unknown_type', config: {}, uuid: '123' },
      });

      const events = wrapper.vm.widgetEvents;
      expect(events).toEqual({});
    });
  });

  describe('Widget Events Mapping', () => {
    it('should return correct events for graph_column widget', () => {
      wrapper = createWrapper({
        widget: { type: 'graph_column', config: {}, uuid: '123' },
      });

      const events = wrapper.vm.widgetEvents;
      expect(events).toHaveProperty('seeMore');
      expect(typeof events.seeMore).toBe('function');
    });

    it('should return correct events for graph_bar widget', () => {
      wrapper = createWrapper({
        widget: { type: 'graph_bar', config: {}, uuid: '123' },
      });

      const events = wrapper.vm.widgetEvents;
      expect(events).toHaveProperty('clickData');
      expect(typeof events.clickData).toBe('function');
    });

    it('should return correct events for graph_funnel widget', () => {
      wrapper = createWrapper({
        widget: { type: 'graph_funnel', config: {}, uuid: '123' },
      });

      const events = wrapper.vm.widgetEvents;
      expect(events).toHaveProperty('openConfig');
      expect(events).toHaveProperty('requestData');
      expect(typeof events.openConfig).toBe('function');
      expect(typeof events.requestData).toBe('function');
    });
  });
});
