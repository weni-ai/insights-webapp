import { nextTick, ref } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { beforeEach, describe, it, vi, beforeAll, afterAll } from 'vitest';
import { shallowMount, config, flushPromises } from '@vue/test-utils';

import { createTestingPinia } from '@pinia/testing';
import i18n from '@/utils/plugins/i18n';

import DynamicWidget from '../DynamicWidget.vue';
import DynamicCard from '../DynamicCard.vue';
import DynamicGraph from '../DynamicGraph.vue';
import DynamicTable from '../DynamicTable.vue';
import { useDashboards } from '@/store/modules/dashboards';
import { useWidgets } from '@/store/modules/widgets';
import { useReports } from '@/store/modules/reports';

vi.mock('@weni/unnnic-system', () => ({
  default: {
    unnnicCallAlert: vi.fn(),
  },
}));

vi.mock('@vueuse/core', () => ({
  useElementVisibility: vi.fn(() => ref(true)),
}));

beforeAll(() => {
  config.global.plugins = config.global.plugins.filter(
    (plugin) => plugin !== i18n,
  );

  vi.stubGlobal('setInterval', vi.fn());
  vi.stubGlobal('clearInterval', vi.fn());
});

afterAll(() => {
  vi.unstubAllGlobals();
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
      widgets: {
        ...storeState.widgets,
      },
      reports: {
        ...storeState.reports,
      },
      config: {
        isActiveRoute: true,
        ...storeState.config,
      },
    },
  });

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
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  describe('Widget Categorization', () => {
    it('should categorize graph widgets correctly', () => {
      const graphTypes = ['graph_column', 'graph_bar', 'graph_funnel'];
      graphTypes.forEach((type) => {
        expect(wrapper.vm.getWidgetCategory(type)).toBe('graph');
      });
    });

    it('should categorize card widgets correctly', () => {
      const cardTypes = [
        'card',
        'empty_column',
        'vtex_order',
        'vtex_conversions',
        'recurrence',
      ];
      cardTypes.forEach((type) => {
        expect(wrapper.vm.getWidgetCategory(type)).toBe('card');
      });
    });

    it('should categorize table widgets correctly', () => {
      const tableTypes = ['table_dynamic_by_filter', 'table_group'];
      tableTypes.forEach((type) => {
        expect(wrapper.vm.getWidgetCategory(type)).toBe('table');
      });
    });

    it('should return null for unknown widget types', () => {
      expect(wrapper.vm.getWidgetCategory('unknown_type')).toBeNull();
    });
  });

  describe('Component Delegation', () => {
    it('should render DynamicCard for card-type widgets', () => {
      wrapper = createWrapper({ widget: { type: 'card', config: {} } });
      expect(wrapper.findComponent(DynamicCard).exists()).toBe(true);
      expect(wrapper.findComponent(DynamicGraph).exists()).toBe(false);
      expect(wrapper.findComponent(DynamicTable).exists()).toBe(false);
    });

    it('should render DynamicGraph for graph-type widgets', () => {
      wrapper = createWrapper({ widget: { type: 'graph_column', config: {} } });
      expect(wrapper.findComponent(DynamicGraph).exists()).toBe(true);
      expect(wrapper.findComponent(DynamicCard).exists()).toBe(false);
      expect(wrapper.findComponent(DynamicTable).exists()).toBe(false);
    });

    it('should render DynamicTable for table-type widgets', () => {
      wrapper = createWrapper({ widget: { type: 'table_group', config: {} } });
      expect(wrapper.findComponent(DynamicTable).exists()).toBe(true);
      expect(wrapper.findComponent(DynamicCard).exists()).toBe(false);
      expect(wrapper.findComponent(DynamicGraph).exists()).toBe(false);
    });

    it('should not render any component for unknown widget types', () => {
      wrapper = createWrapper({ widget: { type: 'unknown_type', config: {} } });
      // Should have div wrapper but no component inside
      expect(wrapper.html()).toContain('<div');
      expect(wrapper.html()).toContain('<!---->');
    });
  });

  describe('Props Passing', () => {
    it('should pass correct props to child components', () => {
      const testWidget = { type: 'card', config: { test: 'config' } };
      wrapper = createWrapper({ widget: testWidget });

      const childComponent = wrapper.findComponent(DynamicCard);
      const props = childComponent.props();

      expect(props.widget).toEqual(testWidget);
      expect(props).toHaveProperty('isLoading');
      expect(props).toHaveProperty('isRequestingData');
      expect(props).toHaveProperty('hasError');
      expect(props).toHaveProperty('isConfigured');
      expect(props).toHaveProperty('appliedFilters');
    });
  });

  describe('Computed Properties', () => {
    describe('isConfigured', () => {
      it('should return true when widget has valid config', () => {
        wrapper = createWrapper({
          widget: { type: 'card', config: { test: 'value' } },
        });
        expect(wrapper.vm.isConfigured).toBe(true);
      });

      it('should return false when widget config is empty', () => {
        wrapper = createWrapper({ widget: { type: 'card', config: {} } });
        expect(wrapper.vm.isConfigured).toBe(false);
      });

      it('should return false when widget config is null', () => {
        wrapper = createWrapper({ widget: { type: 'card', config: null } });
        expect(wrapper.vm.isConfigured).toBe(false);
      });
    });

    describe('isLoading', () => {
      it('should return true when configured but requesting data', () => {
        wrapper = createWrapper({
          widget: { type: 'card', config: { test: 'value' } },
        });
        wrapper.vm.isRequestingData = true;
        expect(wrapper.vm.isLoading).toBe(true);
      });

      it('should return false when not configured', () => {
        wrapper = createWrapper({ widget: { type: 'card', config: {} } });
        expect(wrapper.vm.isLoading).toBe(false);
      });
    });

    describe('isHumanServiceDashboard', () => {
      it('should return true for human service dashboard', () => {
        wrapper = createWrapper(
          {},
          {
            dashboards: {
              currentDashboard: { name: 'human_service_dashboard.title' },
            },
          },
        );
        expect(wrapper.vm.isHumanServiceDashboard).toBe(true);
      });

      it('should return false for other dashboards', () => {
        wrapper = createWrapper(
          {},
          {
            dashboards: { currentDashboard: { name: 'other_dashboard' } },
          },
        );
        expect(wrapper.vm.isHumanServiceDashboard).toBe(false);
      });
    });

    describe('hasDateFiltering', () => {
      it('should return true when created_on filter exists', () => {
        wrapper = createWrapper(
          {},
          {
            dashboards: {
              appliedFilters: { created_on: { start: '2023-01-01' } },
            },
          },
        );
        expect(wrapper.vm.hasDateFiltering).toBe(true);
      });

      it('should return false when created_on filter does not exist', () => {
        wrapper = createWrapper(
          {},
          {
            dashboards: { appliedFilters: { other_filter: 'value' } },
          },
        );
        expect(wrapper.vm.hasDateFiltering).toBe(false);
      });
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      wrapper = createWrapper({
        widget: { type: 'card', config: { test: 'config' } },
      });
    });

    it('should emit open-config when child emits open-config', async () => {
      const childComponent = wrapper.findComponent(DynamicCard);
      childComponent.vm.$emit('open-config');
      await nextTick();

      expect(wrapper.emitted('open-config')).toBeTruthy();
    });

    it('should emit clickData when child emits clickData', async () => {
      const eventData = { test: 'data' };
      const childComponent = wrapper.findComponent(DynamicCard);
      childComponent.vm.$emit('clickData', eventData);
      await nextTick();

      expect(wrapper.emitted('clickData')).toBeTruthy();
      expect(wrapper.emitted('clickData')[0][0]).toEqual(eventData);
    });

    it('should handle request-data event from child', async () => {
      const widgetsStore = useWidgets();
      const spy = vi
        .spyOn(widgetsStore, 'getWidgetVtexOrderData')
        .mockResolvedValue();

      const requestParams = {
        type: 'vtex_order',
        uuid: '123',
        config: { filter: { utm: 'test_utm' } },
      };

      const childComponent = wrapper.findComponent(DynamicCard);
      childComponent.vm.$emit('request-data', requestParams);
      await nextTick();

      expect(spy).toHaveBeenCalledWith({
        uuid: '123',
        utm_source: 'test_utm',
      });
    });

    it('should handle redirect-to-expansive event from child', async () => {
      const widgetsStore = useWidgets();
      const updateSpy = vi
        .spyOn(widgetsStore, 'updateCurrentExpansiveWidgetData')
        .mockImplementation(() => {});

      const childComponent = wrapper.findComponent(DynamicCard);
      childComponent.vm.$emit('redirect-to-expansive', wrapper.vm.widget);
      await nextTick();

      expect(updateSpy).toHaveBeenCalledWith(wrapper.vm.widget);
    });
  });

  describe('Data Request Handling', () => {
    let widgetsStore;

    beforeEach(() => {
      widgetsStore = useWidgets();
      vi.spyOn(
        widgetsStore,
        'getCurrentDashboardWidgetData',
      ).mockResolvedValue();
      vi.spyOn(widgetsStore, 'getWidgetVtexOrderData').mockResolvedValue();
      vi.spyOn(widgetsStore, 'getWidgetRecurrenceData').mockResolvedValue();
      vi.spyOn(widgetsStore, 'getWidgetGraphFunnelData').mockResolvedValue();
    });

    it('should handle VTEX order data requests', async () => {
      const requestParams = {
        type: 'vtex_order',
        uuid: '123',
        config: { filter: { utm: 'test_utm' } },
      };

      await wrapper.vm.handleRequestData(requestParams);

      expect(widgetsStore.getWidgetVtexOrderData).toHaveBeenCalledWith({
        uuid: '123',
        utm_source: 'test_utm',
      });
    });

    it('should handle recurrence data requests', async () => {
      const requestParams = { type: 'recurrence', uuid: '123' };
      await wrapper.vm.handleRequestData(requestParams);

      expect(widgetsStore.getWidgetRecurrenceData).toHaveBeenCalledWith({
        uuid: '123',
      });
    });

    it('should handle graph funnel data requests', async () => {
      const requestParams = { uuid: '123', config: { test: 'config' } };
      await wrapper.vm.handleRequestData(requestParams);

      expect(widgetsStore.getWidgetGraphFunnelData).toHaveBeenCalledWith({
        uuid: '123',
        widgetFunnelConfig: { test: 'config' },
      });
    });

    it('should set hasError on request failure', async () => {
      widgetsStore.getWidgetVtexOrderData.mockRejectedValueOnce(
        new Error('Test error'),
      );
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const requestParams = {
        type: 'vtex_order',
        uuid: '123',
        config: { filter: { utm: 'test' } },
      };
      await wrapper.vm.handleRequestData(requestParams);

      expect(wrapper.vm.hasError).toBe(true);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle general requests through requestWidgetData', async () => {
      wrapper = createWrapper({
        widget: { type: 'card', config: { test: 'value' } },
      });

      const requestParams = { offset: 0, limit: 10 };
      await expect(
        wrapper.vm.handleRequestData(requestParams),
      ).resolves.not.toThrow();

      expect(wrapper.vm.isRequestingData).toBe(false);
      expect(wrapper.vm.hasError).toBe(false);
    });
  });

  describe('Widget Configuration and State', () => {
    it('should handle route-based data requests for report pages', async () => {
      await router.push({
        name: 'report',
        params: { dashboardUuid: '1', widgetUuid: '1' },
      });
      await flushPromises();

      wrapper = createWrapper({
        widget: { type: 'card', config: { test: 'value' } },
      });

      expect(wrapper.vm.$route.name).toBe('report');

      await expect(
        wrapper.vm.requestWidgetData({ offset: 0, limit: 10 }),
      ).resolves.not.toThrow();
    });

    it('should show error alert when report data request fails', async () => {
      await router.push({
        name: 'report',
        params: { dashboardUuid: '1', widgetUuid: '1' },
      });
      await flushPromises();

      wrapper = createWrapper({
        widget: { type: 'card', config: { test: 'value' } },
      });

      const reportsStore = useReports();
      const mockError = new Error('Report data error');
      vi.spyOn(reportsStore, 'getWidgetReportData').mockRejectedValueOnce(
        mockError,
      );

      const Unnnic = await import('@weni/unnnic-system');
      const alertSpy = vi.spyOn(Unnnic.default, 'unnnicCallAlert');

      await wrapper.vm.requestWidgetData({ offset: 0, limit: 10 });

      expect(alertSpy).toHaveBeenCalledWith({
        props: {
          text: i18n.global.t('get_data_error'),
          type: 'error',
        },
      });

      expect(wrapper.vm.isRequestingData).toBe(false);
    });

    it('should handle dashboard route data requests', async () => {
      await router.push({ name: 'dashboard', params: { dashboardUuid: '1' } });
      await flushPromises();

      wrapper = createWrapper({
        widget: { type: 'card', config: { test: 'value' } },
      });

      expect(wrapper.vm.$route.name).toBe('dashboard');

      await expect(wrapper.vm.requestWidgetData()).resolves.not.toThrow();
    });

    it('should handle silence parameter in data requests', async () => {
      wrapper = createWrapper({
        widget: { type: 'card', config: { test: 'value' } },
      });

      await expect(
        wrapper.vm.requestWidgetData({ silence: true }),
      ).resolves.not.toThrow();

      expect(wrapper.vm.isRequestingData).toBe(false);
    });

    it('should handle request errors gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      wrapper = createWrapper({
        widget: { type: 'card', config: { test: 'value' } },
      });

      const widgetsStore = useWidgets();
      vi.spyOn(
        widgetsStore,
        'getCurrentDashboardWidgetData',
      ).mockRejectedValueOnce(new Error('Test error'));

      await wrapper.vm.requestWidgetData();

      expect(wrapper.vm.isRequestingData).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Route Query Watcher', () => {
    it('should respond to route changes for eligible widgets', async () => {
      await router.push({ name: 'dashboard', params: { dashboardUuid: '1' } });
      await flushPromises();

      wrapper = createWrapper({
        widget: { type: 'card', config: { test: 'value' } },
      });

      await router.push({
        name: 'dashboard',
        params: { dashboardUuid: '1' },
        query: { filter: 'new' },
      });
      await flushPromises();

      expect(wrapper.vm.$route.query.filter).toBe('new');
    });

    it('should handle route changes for excluded widget types', async () => {
      const excludedTypes = [
        'table_group',
        'graph_funnel',
        'empty_column',
        'vtex_order',
        'recurrence',
      ];

      for (const type of excludedTypes) {
        await router.push({
          name: 'dashboard',
          params: { dashboardUuid: '1' },
        });
        await flushPromises();

        wrapper = createWrapper({ widget: { type, config: {} } });

        await router.push({
          name: 'dashboard',
          params: { dashboardUuid: '1' },
          query: { filter: type },
        });
        await flushPromises();

        expect(wrapper.vm.$route.query.filter).toBe(type);
      }
    });
  });

  describe('Lifecycle Management', () => {
    beforeEach(() => {
      vi.mocked(global.setInterval).mockReturnValue(123);
    });

    it('should initialize polling for human service dashboard without date filtering', () => {
      wrapper = createWrapper(
        {},
        {
          dashboards: {
            currentDashboard: { name: 'human_service_dashboard.title' },
            appliedFilters: {},
          },
        },
      );

      wrapper.vm.initRequestDataInterval();

      expect(global.setInterval).toHaveBeenCalledWith(
        expect.any(Function),
        60000,
      );
      expect(wrapper.vm.interval).toBe(123);
    });

    it('should not initialize polling for non-human service dashboards', () => {
      wrapper = createWrapper(
        {},
        {
          dashboards: {
            currentDashboard: { name: 'other_dashboard' },
            appliedFilters: {},
          },
        },
      );

      wrapper.vm.initRequestDataInterval();
      expect(global.setInterval).not.toHaveBeenCalled();
    });

    it('should clear interval on component unmount', () => {
      wrapper.vm.interval = 123;
      wrapper.unmount();

      expect(global.clearInterval).toHaveBeenCalledWith(123);
    });

    it('should manage interval based on date filtering changes', async () => {
      wrapper = createWrapper(
        {},
        {
          dashboards: {
            currentDashboard: { name: 'human_service_dashboard.title' },
            appliedFilters: {},
          },
        },
      );

      await nextTick();

      const dashboardsStore = useDashboards();

      dashboardsStore.appliedFilters = { created_on: { start: '2023-01-01' } };
      await nextTick();

      expect(global.clearInterval).toHaveBeenCalled();
    });

    it('should initialize polling on mount for human service dashboard', async () => {
      wrapper = createWrapper(
        {},
        {
          dashboards: {
            currentDashboard: { name: 'human_service_dashboard.title' },
            appliedFilters: {},
          },
        },
      );

      await nextTick();

      expect(global.setInterval).toHaveBeenCalled();
    });
  });
});
