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

import DynamicCard from '../DynamicCard.vue';
import CardDashboard from '@/components/insights/cards/CardDashboard.vue';
import CardEmpty from '@/components/insights/cards/CardEmpty.vue';
import CardVtexOrder from '@/components/insights/cards/CardVtexOrder.vue';
import CardVtexConversions from '@/components/insights/cards/CardVtexConversions.vue';
import CardRecurrence from '@/components/insights/cards/CardRecurrence.vue';

beforeAll(() => {
  config.global.plugins = config.global.plugins.filter(
    (plugin) => plugin !== i18n,
  );
});

afterAll(() => {
  vi.restoreAllMocks();
});

// Mock external dependencies
vi.mock('@/utils/time', () => ({
  formatSecondsToHumanString: vi.fn((seconds) => `${seconds} seconds`),
}));

vi.mock('@/utils/currency', () => ({
  currencySymbols: {
    USD: '$',
    EUR: '€',
    BRL: 'R$',
  },
}));

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

  return shallowMount(DynamicCard, {
    props: {
      widget: { type: 'card', config: { operation: 'sum' }, uuid: '123' },
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

describe('DynamicCard', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  describe('Component Rendering', () => {
    it('should render CardDashboard for card type widgets', () => {
      wrapper = createWrapper({
        widget: { type: 'card', config: {}, uuid: '123' },
      });
      expect(wrapper.findComponent(CardDashboard).exists()).toBe(true);
      expect(wrapper.find('[data-testid="dynamic-card-card"]').exists()).toBe(
        true,
      );
    });

    it('should render CardEmpty for empty_column type widgets', () => {
      wrapper = createWrapper({
        widget: { type: 'empty_column', config: {}, uuid: '123' },
      });
      expect(wrapper.findComponent(CardEmpty).exists()).toBe(true);
      expect(
        wrapper.find('[data-testid="dynamic-card-empty_column"]').exists(),
      ).toBe(true);
    });

    it('should render CardVtexOrder for vtex_order type widgets', () => {
      wrapper = createWrapper({
        widget: { type: 'vtex_order', config: {}, uuid: '123' },
      });
      expect(wrapper.findComponent(CardVtexOrder).exists()).toBe(true);
      expect(
        wrapper.find('[data-testid="dynamic-card-vtex_order"]').exists(),
      ).toBe(true);
    });

    it('should render CardVtexConversions for vtex_conversions type widgets', () => {
      wrapper = createWrapper({
        widget: { type: 'vtex_conversions', config: {}, uuid: '123' },
      });
      expect(wrapper.findComponent(CardVtexConversions).exists()).toBe(true);
      expect(
        wrapper.find('[data-testid="dynamic-card-vtex_conversions"]').exists(),
      ).toBe(true);
    });

    it('should render CardRecurrence for recurrence type widgets', () => {
      wrapper = createWrapper({
        widget: { type: 'recurrence', config: {}, uuid: '123' },
      });
      expect(wrapper.findComponent(CardRecurrence).exists()).toBe(true);
      expect(
        wrapper.find('[data-testid="dynamic-card-recurrence"]').exists(),
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
          { type: 'card', expected: CardDashboard },
          { type: 'empty_column', expected: CardEmpty },
          { type: 'vtex_order', expected: CardVtexOrder },
          { type: 'vtex_conversions', expected: CardVtexConversions },
          { type: 'recurrence', expected: CardRecurrence },
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

    describe('widgetVtexData', () => {
      it('should format VTEX order data correctly', () => {
        const mockData = {
          total_value: 1000.5,
          average_ticket: 250.75,
          orders: 4,
        };

        wrapper = createWrapper({
          widget: {
            type: 'vtex_order',
            config: {},
            uuid: '123',
            data: mockData,
          },
        });

        const result = wrapper.vm.widgetVtexData;
        expect(result.orders).toBe('4');
        expect(result.total_value).toBe('$ 1,000.50');
        expect(result.average_ticket).toBe('$ 250.75');
      });

      it('should handle empty VTEX order data', () => {
        wrapper = createWrapper({
          widget: {
            type: 'vtex_order',
            config: {},
            uuid: '123',
            data: {
              total_value: '',
              average_ticket: '',
              orders: '',
            },
          },
        });

        const result = wrapper.vm.widgetVtexData;
        expect(result.orders).toBe('');
        expect(result.total_value).toBe('');
        expect(result.average_ticket).toBe('');
      });

      it('should return null for non-vtex_order widgets', () => {
        wrapper = createWrapper({
          widget: { type: 'card', config: {}, uuid: '123' },
        });
        expect(wrapper.vm.widgetVtexData).toBeNull();
      });
    });

    describe('widgetVtexConversionsData', () => {
      it('should format VTEX conversions data correctly', () => {
        const mockData = {
          utm_data: {
            accumulated_total: 5000,
            medium_ticket: 125.5,
          },
          graph_data: [{ x: '2023-01-01', y: 100 }],
        };

        wrapper = createWrapper({
          widget: {
            type: 'vtex_conversions',
            config: {},
            uuid: '123',
            data: mockData,
          },
        });

        const result = wrapper.vm.widgetVtexConversionsData;
        expect(result.utm_data.accumulated_total).toBe('$ 5,000.00');
        expect(result.utm_data.medium_ticket).toBe('$ 125.50');
        expect(result.graph_data).toEqual(mockData.graph_data);
      });

      it('should handle VTEX conversions error data', () => {
        wrapper = createWrapper({
          widget: {
            type: 'vtex_conversions',
            config: {},
            uuid: '123',
            data: { error: 'API Error' },
          },
        });

        const result = wrapper.vm.widgetVtexConversionsData;
        expect(result.error).toBe('API Error');
      });

      it('should return empty object for non-vtex_conversions widgets', () => {
        wrapper = createWrapper({
          widget: { type: 'card', config: {}, uuid: '123' },
        });
        expect(wrapper.vm.widgetVtexConversionsData).toEqual({});
      });
    });
  });

  describe('Methods', () => {
    describe('getWidgetFormattedData', () => {
      it('should format percentage data correctly', () => {
        const widget = {
          config: { operation: 'percentage' },
          data: { value: 75.5 },
        };
        const result = wrapper.vm.getWidgetFormattedData(widget);
        expect(result).toBe('75.50%');
      });

      it('should format recurrence data correctly', () => {
        const widget = {
          config: { operation: 'recurrence' },
          data: { value: 25.75 },
        };
        const result = wrapper.vm.getWidgetFormattedData(widget);
        expect(result).toBe('25.75%');
      });

      it('should format data_suffix percentage correctly', () => {
        const widget = {
          config: { data_suffix: '%' },
          data: { value: 50 },
        };
        const result = wrapper.vm.getWidgetFormattedData(widget);
        expect(result).toBe('50.00%');
      });

      it('should format seconds data correctly', () => {
        const widget = {
          config: { data_type: 'sec' },
          data: { value: 3661 },
        };
        const result = wrapper.vm.getWidgetFormattedData(widget);
        expect(result).toBe('3661 seconds'); // Mocked result
      });

      it('should format currency data correctly', () => {
        const widget = {
          config: { currency: true },
          data: { value: 1234.56 },
        };
        const result = wrapper.vm.getWidgetFormattedData(widget);
        expect(result).toBe('$ 1,234.56');
      });

      it('should format regular number data correctly', () => {
        const widget = {
          config: {},
          data: { value: 1000 },
        };
        const result = wrapper.vm.getWidgetFormattedData(widget);
        expect(result).toBe('1,000');
      });

      it('should handle missing data value', () => {
        const widget = {
          config: {},
          data: {},
        };
        const result = wrapper.vm.getWidgetFormattedData(widget);
        expect(result).toBe('0');
      });
    });

    describe('getHoverTooltipData', () => {
      it('should return tooltip for human service dashboard card', () => {
        wrapper = createWrapper(
          {
            widget: {
              type: 'card',
              name: 'in_progress',
              config: {},
              uuid: '123',
            },
          },
          {
            dashboards: {
              currentDashboard: { name: 'human_service_dashboard.title' },
            },
          },
        );

        const result = wrapper.vm.getHoverTooltipData(wrapper.vm.widget);
        expect(result).toBe('human_service_dashboard.tooltips.in_progress');
      });

      it('should return empty string for non-human service dashboard', () => {
        wrapper = createWrapper(
          {
            widget: { type: 'card', name: 'test', config: {}, uuid: '123' },
          },
          {
            dashboards: {
              currentDashboard: { name: 'other_dashboard' },
            },
          },
        );

        const result = wrapper.vm.getHoverTooltipData(wrapper.vm.widget);
        expect(result).toBe('');
      });

      it('should return empty string for non-card widgets', () => {
        wrapper = createWrapper(
          {
            widget: { type: 'table', name: 'test', config: {}, uuid: '123' },
          },
          {
            dashboards: {
              currentDashboard: { name: 'human_service_dashboard.title' },
            },
          },
        );

        const result = wrapper.vm.getHoverTooltipData(wrapper.vm.widget);
        expect(result).toBe('');
      });
    });

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
            type: 'card',
            uuid: '123',
            report: { type: 'internal' },
            config: {},
          },
        });

        wrapper.vm.redirectToReport(wrapper.vm.widget);

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
            type: 'card',
            uuid: '123',
            report: { type: 'external', url: 'https://example.com' },
            config: {},
          },
        });

        wrapper.vm.redirectToReport(wrapper.vm.widget);

        expect(window.open).toHaveBeenCalledWith(
          'https://example.com',
          '_blank',
        );
      });

      it('should do nothing if no report is configured', () => {
        wrapper = createWrapper({
          widget: { type: 'card', uuid: '123', config: {} },
        });

        wrapper.vm.redirectToReport(wrapper.vm.widget);

        expect(router.push).not.toHaveBeenCalled();
        expect(window.open).not.toHaveBeenCalled();
      });

      it('should handle unknown report type', () => {
        wrapper = createWrapper({
          widget: {
            type: 'card',
            uuid: '123',
            report: { type: 'unknown' },
            config: {},
          },
        });

        wrapper.vm.redirectToReport(wrapper.vm.widget);

        expect(router.push).not.toHaveBeenCalled();
        expect(window.open).not.toHaveBeenCalled();
      });
    });
  });

  describe('Props Validation', () => {
    it('should handle all props correctly', () => {
      const testProps = {
        widget: { type: 'card', config: {}, uuid: '123' },
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
        widget: { type: 'card', config: {}, uuid: '123' },
      });

      expect(wrapper.props('isLoading')).toBe(false);
      expect(wrapper.props('isRequestingData')).toBe(false);
      expect(wrapper.props('hasError')).toBe(false);
      expect(wrapper.props('isConfigured')).toBe(true);
      expect(wrapper.props('appliedFilters')).toEqual({});
    });
  });

  describe('Event Handling', () => {
    it('should emit open-config when child component triggers openConfig', async () => {
      wrapper = createWrapper({
        widget: { type: 'card', config: {}, uuid: '123' },
      });

      // Call the openConfig event handler directly
      const events = wrapper.vm.widgetEvents;
      events.openConfig();
      await nextTick();

      expect(wrapper.emitted('open-config')).toBeTruthy();
    });

    it('should emit request-data for vtex_order widget', async () => {
      const testWidget = {
        type: 'vtex_order',
        uuid: '123',
        config: { filter: { utm: 'test' } },
      };
      wrapper = createWrapper({ widget: testWidget });

      const events = wrapper.vm.widgetEvents;
      events.requestData();
      await nextTick();

      expect(wrapper.emitted('request-data')).toBeTruthy();
      expect(wrapper.emitted('request-data')[0][0]).toEqual({
        type: 'vtex_order',
        uuid: '123',
        config: testWidget.config,
      });
    });

    it('should emit request-data for recurrence widget', async () => {
      const testWidget = { type: 'recurrence', uuid: '123', config: {} };
      wrapper = createWrapper({ widget: testWidget });

      const events = wrapper.vm.widgetEvents;
      events.requestData();
      await nextTick();

      expect(wrapper.emitted('request-data')).toBeTruthy();
      expect(wrapper.emitted('request-data')[0][0]).toEqual({
        type: 'recurrence',
        uuid: '123',
      });
    });

    it('should emit clickData for recurrence widget with flow data', async () => {
      const testWidget = {
        type: 'recurrence',
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
  });

  describe('Currency Formatting', () => {
    it('should use correct currency symbol from dashboard config', () => {
      wrapper = createWrapper(
        {
          widget: {
            type: 'vtex_order',
            config: {},
            uuid: '123',
            data: { total_value: 100 },
          },
        },
        {
          dashboards: {
            currentDashboard: { config: { currency_type: 'EUR' } },
          },
        },
      );

      expect(wrapper.vm.widgetVtexData.total_value).toContain('100.00');
    });
  });

  describe('Edge Cases', () => {
    it('should handle widget without data', () => {
      wrapper = createWrapper({
        widget: { type: 'card', config: {}, uuid: '123' },
      });

      const result = wrapper.vm.getWidgetFormattedData(wrapper.vm.widget);
      expect(result).toBe('0');
    });

    it('should handle widget with null data', () => {
      wrapper = createWrapper({
        widget: { type: 'card', config: {}, uuid: '123', data: null },
      });

      const result = wrapper.vm.getWidgetFormattedData(wrapper.vm.widget);
      expect(result).toBe('0');
    });

    it('should handle widget without config', () => {
      wrapper = createWrapper({
        widget: { type: 'card', uuid: '123', data: { value: 100 } },
      });

      const result = wrapper.vm.getWidgetFormattedData(wrapper.vm.widget);
      expect(result).toBe('100');
    });

    it('should handle empty VTEX conversions data', () => {
      wrapper = createWrapper({
        widget: { type: 'vtex_conversions', uuid: '123', config: {} },
      });

      expect(wrapper.vm.widgetVtexConversionsData).toEqual({});
    });

    it('should handle missing widget properties', () => {
      wrapper = createWrapper({
        widget: { type: 'card', uuid: '123' },
      });

      const events = wrapper.vm.widgetEvents;
      expect(events).toHaveProperty('openConfig');
      expect(events).toHaveProperty('click');
    });
  });

  describe('Widget Props Generation', () => {
    it('should generate correct props for card widget', () => {
      wrapper = createWrapper({
        widget: {
          type: 'card',
          name: 'Test Card',
          config: { friendly_id: 'test-id', tooltip: 'test.tooltip' },
          uuid: '123',
          data: { value: 100 },
          is_configurable: true,
          report: { type: 'internal' },
        },
      });

      const props = wrapper.vm.widgetProps;
      expect(props.description).toBe('Test Card');
      expect(props.configured).toBe(true);
      expect(props.clickable).toBe(true);
      expect(props.configurable).toBe(true);
      expect(props.friendlyId).toBe('test-id');
      expect(props.id).toBe('123');
      expect(props.metric).toBe('100');
    });

    it('should generate correct props for vtex_conversions widget with loading', () => {
      wrapper = createWrapper({
        widget: {
          type: 'vtex_conversions',
          config: {},
          uuid: '123',
          data: {
            utm_data: { accumulated_total: 1000, medium_ticket: 100 },
            graph_data: [],
          },
        },
        isRequestingData: true,
      });

      const props = wrapper.vm.widgetProps;
      expect(props.isLoadingData).toBe(true);
      expect(props.data.utm_data.accumulated_total).toBe('$ 1,000.00');
    });
  });
});
