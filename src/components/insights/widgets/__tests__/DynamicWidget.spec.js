import { nextTick } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { afterEach, beforeEach, describe, it, vi } from 'vitest';
import { shallowMount, config, flushPromises } from '@vue/test-utils';
import { createStore } from 'vuex';
import i18n from '@/utils/plugins/i18n';

import DynamicWidget from '../DynamicWidget.vue';
import CardEmpty from '@/components/insights/cards/CardEmpty.vue';

beforeAll(() => {
  config.global.plugins = config.global.plugins.filter(
    (plugin) => plugin !== i18n,
  );
});

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/:dashboardUuid/widget/:widgetUuid/report',
      name: 'report',
    },
  ],
});

const store = createStore({
  modules: {
    widgets: {
      namespaced: true,
      actions: {
        getCurrentDashboardWidgetData: vi.fn(),
        getWidgetGraphFunnelData: vi.fn(),
        getWidgetVtexOrderData: vi.fn(),
      },
    },
    reports: {
      namespaced: true,
      actions: {
        getWidgetReportData: vi.fn(),
      },
    },
    dashboards: {
      namespaced: true,
      state: {
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
      },
    },
  },
});

const createWrapper = (props = {}) => {
  return shallowMount(DynamicWidget, {
    props: {
      widget: { type: 'empty_column', config: { operation: '' } },
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

describe('DynamicWidget', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  it('should render the correct child component based on widget type', () => {
    expect(wrapper.findComponent(CardEmpty).exists()).toBe(true);
  });

  it('should pass the correct props to the child component', () => {
    wrapper = createWrapper({
      widget: { type: 'invalid_type', config: { operation: '' } },
    });

    expect(wrapper.html()).toBe('');
  });

  it('should bind the correct events to the child component', () => {
    const childComponent = wrapper.findComponent(CardEmpty);
    expect(childComponent.props('widget')).toEqual({
      type: 'empty_column',
      config: { operation: '' },
    });
  });

  describe('isConfigured computed property', () => {
    it('should return true if the widget has a valid config', () => {
      expect(wrapper.vm.isConfigured).toBe(true);
    });

    it('should return false if the widget does not have a config', () => {
      wrapper.vm.widget.config = null;
      nextTick();

      expect(wrapper.vm.isConfigured).toBe(false);
    });
  });

  describe('isLoading computed property', () => {
    it('should return true if widget is configured but data is loading', () => {
      wrapper = createWrapper();
      expect(wrapper.vm.isLoading).toBe(true);
    });

    it('should return false if widget is not configured', () => {
      wrapper.vm.widget.config = null;
      nextTick();

      expect(wrapper.vm.isLoading).toBe(false);
    });
  });

  describe('currentComponent computed property', () => {
    it('should return the correct component for each widget type', () => {
      const componentMap = {
        graph_column: 'LineChart',
        graph_bar: 'HorizontalBarChart',
        graph_funnel: 'CardFunnel',
        table_dynamic_by_filter: 'WidgetTableDynamicByFilter',
        table_group: 'TableGroup',
        card: 'CardDashboard',
        empty_column: 'CardEmpty',
        vtex_order: 'CardVtexOrder',
        insight: null,
      };

      Object.entries(componentMap).forEach(([widgetType, expectedName]) => {
        const localWrapper = createWrapper({
          widget: { type: widgetType },
        });

        const currentComponentName = localWrapper.vm.currentComponent?.name;

        if (expectedName) {
          expect(currentComponentName).toBe(expectedName);
        }
      });
    });

    it('should return null if widget type is not in the component map', () => {
      wrapper.vm.widget.type = 'invalid_type';
      nextTick();

      expect(wrapper.vm.currentComponent).toBeNull();
    });
  });

  describe('widgetProps computed property', () => {
    it('should merge default props with mapping props based on widget type', () => {
      wrapper = createWrapper({
        widget: { type: 'card', name: 'Test name' },
      });

      expect(wrapper.vm.widgetProps).toMatchObject({
        description: 'Test name',
      });
    });

    it('should include default props even if mapping props are undefined', () => {
      const defaultProps = { isLoading: expect.any(Boolean) };
      expect(wrapper.vm.widgetProps).toMatchObject(defaultProps);
    });
  });

  describe('widgetGraphData computed property', () => {
    it('should return an object with labels and datasets when the condition is met', () => {
      wrapper = createWrapper({
        widget: {
          type: 'graph',
          data: {
            data: [
              { label: 'January', value: 30 },
              { label: 'February', value: 40 },
              { label: 'March', value: 50 },
            ],
          },
        },
      });

      expect(wrapper.vm.widgetGraphData).toEqual({
        labels: ['January', 'February', 'March'],
        datasets: [
          {
            data: [30, 40, 50],
          },
        ],
      });
    });

    it('should return undefined when widget.type does not include "graph"', () => {
      wrapper = createWrapper({
        widget: { type: 'card' },
      });

      expect(wrapper.vm.widgetGraphData).toBeUndefined();
    });

    it('should return undefined when widget.type is "graph_funnel"', () => {
      wrapper = createWrapper({
        widget: { type: 'graph_funnel' },
      });

      expect(wrapper.vm.widgetGraphData).toBeUndefined();
    });

    it('should return undefined when widget.data is falsy', () => {
      wrapper = createWrapper({
        widget: { type: 'graph', data: null },
      });

      expect(wrapper.vm.widgetGraphData).toBeUndefined();
    });

    it('should use widget.data.results when widget.data.data is not present', () => {
      wrapper = createWrapper({
        widget: {
          type: 'graph',
          data: {
            results: [
              { label: 'A', value: 10 },
              { label: 'B', value: 20 },
            ],
          },
        },
      });

      expect(wrapper.vm.widgetGraphData).toEqual({
        labels: ['A', 'B'],
        datasets: [
          {
            data: [10, 20],
          },
        ],
      });
    });
  });

  describe('widgetEvents computed property', () => {
    const createWrapperAndSetSpies = (widget) => {
      wrapper = createWrapper({ widget });

      return {
        redirectToReportSpy: vi.spyOn(wrapper.vm, 'redirectToReport'),
        requestVtexOrderDataSpy: vi
          .spyOn(wrapper.vm, 'requestVtexOrderData')
          .mockImplementation(() => Promise.resolve()),
        getWidgetGraphFunnelDataSpy: vi
          .spyOn(wrapper.vm, 'getWidgetGraphFunnelData')
          .mockImplementation(() => Promise.resolve()),
        requestWidgetDataSpy: vi.spyOn(wrapper.vm, 'requestWidgetData'),
      };
    };

    const events = () => wrapper.vm.widgetEvents;

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should return card events', () => {
      const { redirectToReportSpy } = createWrapperAndSetSpies({
        type: 'card',
      });

      expect(events()).toHaveProperty('click');
      expect(events()).toHaveProperty('openConfig');

      events().click();
      expect(redirectToReportSpy).toHaveBeenCalled();

      events().openConfig();
      expect(wrapper.emitted('open-config')).toBeTruthy();
    });

    it('should return graph_column events', () => {
      const { redirectToReportSpy } = createWrapperAndSetSpies({
        type: 'graph_column',
      });

      expect(events()).toHaveProperty('seeMore');

      events().seeMore();
      expect(redirectToReportSpy).toHaveBeenCalled();
    });

    it('should return empty_column events', () => {
      createWrapperAndSetSpies({ type: 'empty_column' });

      expect(events()).toHaveProperty('openConfig');

      events().openConfig();
      expect(wrapper.emitted('open-config')).toBeTruthy();
    });

    it('should return vtex_order events', () => {
      const { requestVtexOrderDataSpy } = createWrapperAndSetSpies({
        type: 'vtex_order',
      });

      expect(events()).toHaveProperty('openConfig');
      expect(events()).toHaveProperty('requestData');

      events().openConfig();
      expect(wrapper.emitted('open-config')).toBeTruthy();

      events().requestData();
      expect(requestVtexOrderDataSpy).toHaveBeenCalled();
    });

    it('should return graph_funnel events', async () => {
      const { getWidgetGraphFunnelDataSpy } = createWrapperAndSetSpies({
        type: 'graph_funnel',
        uuid: '123',
        config: { test: 'config' },
      });

      expect(events()).toHaveProperty('openConfig');
      expect(events()).toHaveProperty('requestData');

      events().openConfig();
      expect(wrapper.emitted('open-config')).toBeTruthy();

      await events().requestData();
      expect(getWidgetGraphFunnelDataSpy).toHaveBeenCalledWith({
        uuid: '123',
        widgetFunnelConfig: { test: 'config' },
      });
    });

    it('should return table_group events', () => {
      const { requestWidgetDataSpy } = createWrapperAndSetSpies({
        type: 'table_group',
      });

      expect(events()).toHaveProperty('requestData');

      events().requestData({ offset: 10, limit: 20 });
      expect(requestWidgetDataSpy).toHaveBeenCalledWith({
        offset: 10,
        limit: 20,
      });
    });

    it('should return an empty object for invalid type', () => {
      createWrapperAndSetSpies({ type: 'invalid_type' });

      expect(events()).toEqual({});
    });
  });

  describe('widgetEvents computed property', () => {
    it("should return the correct events for widget type 'empty_column'", () => {
      const events = wrapper.vm.widgetEvents;

      expect(events).toHaveProperty('openConfig');
      expect(typeof events.openConfig).toBe('function');
    });

    it('should return an empty object if widget type does not have event mappings', () => {
      wrapper.vm.widget.type = 'invalid_type';
      nextTick();

      expect(wrapper.vm.widgetEvents).toEqual({});
    });
  });

  describe('requestWidgetData method', () => {
    let getCurrentDashboardWidgetDataSpy;

    beforeEach(() => {
      vi.clearAllMocks();

      getCurrentDashboardWidgetDataSpy = vi.spyOn(
        wrapper.vm,
        'getCurrentDashboardWidgetData',
      );
    });

    it('should fetch widget data when widget is configured', async () => {
      await wrapper.vm.requestWidgetData();

      expect(getCurrentDashboardWidgetDataSpy).toHaveBeenCalled();
    });

    it('should not fetch data if widget is not configured', async () => {
      wrapper.vm.widget.config = null;
      nextTick();

      await wrapper.vm.requestWidgetData();

      expect(getCurrentDashboardWidgetDataSpy).not.toHaveBeenCalled();
    });

    it('should handle errors correctly', async () => {
      getCurrentDashboardWidgetDataSpy.mockRejectedValueOnce(new Error());

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await wrapper.vm.requestWidgetData();

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('redirectToReport method', () => {
    beforeEach(() => {
      vi.spyOn(router, 'push');
      global.open = vi.fn();

      wrapper = createWrapper({
        widget: {
          uuid: 'uuid-123',
          type: 'card',
          name: 'Test name',
          report: {
            url: 'Test url',
          },
        },
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should not do anything if report does not exist', () => {
      wrapper.vm.widget.report = undefined;
      nextTick();

      wrapper.vm.redirectToReport();

      expect(global.open).not.toHaveBeenCalled();
      expect(router.push).not.toHaveBeenCalled();
    });

    it("should navigate to internal report when report type is 'internal'", () => {
      wrapper.vm.widget.report.type = 'internal';
      nextTick();

      wrapper.vm.redirectToReport();

      expect(router.push).toHaveBeenCalledWith({
        name: 'report',
        params: {
          dashboardUuid: '1',
          widgetUuid: 'uuid-123',
        },
        query: {},
      });
      expect(global.open).not.toHaveBeenCalled();
    });

    it("should open external report in a new tab when report type is 'external'", () => {
      wrapper.vm.widget.report.type = 'external';
      nextTick();

      wrapper.vm.redirectToReport();

      expect(global.open).toHaveBeenCalledWith('Test url', '_blank');
      expect(router.push).not.toHaveBeenCalled();
    });
  });

  describe('requestVtexOrderData method', () => {
    it('should fetch VTEX order data when invoked', async () => {
      wrapper = createWrapper({
        widget: {
          type: 'vtex_order',
          name: 'Test name',
          uuid: 'uuid-123',
          data: {},
          config: {
            filter: {
              utm: 'Test utm',
            },
          },
        },
      });

      const getWidgetVtexOrderDataSpy = vi.spyOn(
        wrapper.vm,
        'getWidgetVtexOrderData',
      );

      await wrapper.vm.requestVtexOrderData();

      expect(getWidgetVtexOrderDataSpy).toHaveBeenCalledWith({
        uuid: 'uuid-123',
        utm_source: 'Test utm',
      });
    });
  });

  describe('getWidgetFormattedData method', () => {
    const getWidgetFormattedData = (widget) =>
      wrapper.vm.getWidgetFormattedData(widget);

    it("should format data correctly for 'recurrence' operation", () => {
      const result = getWidgetFormattedData({
        data: { value: 1 },
        config: { operation: 'recurrence' },
      });
      expect(result).toBe('1.00%');
    });

    describe("should format data correctly for 'sec' data type", () => {
      const config = { data_type: 'sec' };

      const testCases = [
        { value: 1, expected: '1s' },
        { value: 60, expected: '1m' },
        { value: 3600, expected: '1h' },
        { value: 3661, expected: '1h 1m 1s' },
      ];

      testCases.forEach(({ value, expected }) => {
        it(`should format ${value} correctly`, () => {
          const result = getWidgetFormattedData({ data: { value }, config });
          expect(result).toBe(expected);
        });
      });
    });

    it('should format data with currency symbol if configured', () => {
      const result = getWidgetFormattedData({
        data: { value: 1000 },
        config: { currency: true },
      });
      expect(result).toBe('$ 1,000.00');
    });

    it('should return a default formatted value if no specific format is applied', () => {
      const result = getWidgetFormattedData({
        data: { value: 1000 },
        config: null,
      });
      expect(result).toBe('1,000');
    });
  });

  describe('Route query watcher', () => {
    it('should fetch widget data when route query changes', async () => {
      wrapper = createWrapper({
        widget: { type: 'card' },
      });

      const requestWidgetDataSpy = vi.spyOn(wrapper.vm, 'requestWidgetData');

      router.push({
        name: 'report',
        query: { filter: 'newFilter' },
      });
      await flushPromises();

      expect(requestWidgetDataSpy).toHaveBeenCalled();
    });

    it('should not fetch data for excluded widget types', () => {
      const excludedRequestDataWidgets = [
        'table_group',
        'graph_funnel',
        'empty_column',
        'vtex_order',
      ];

      excludedRequestDataWidgets.forEach(async (widgetType) => {
        wrapper = createWrapper({
          widget: { type: widgetType },
        });
        const requestWidgetDataSpy = vi.spyOn(wrapper.vm, 'requestWidgetData');

        router.push({
          name: 'report',
          query: { filter: 'newFilter' },
        });
        await flushPromises();

        expect(requestWidgetDataSpy).not.toHaveBeenCalled();
      });
    });
  });
});
