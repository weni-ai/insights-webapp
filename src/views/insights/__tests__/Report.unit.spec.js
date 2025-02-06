import { describe, it, beforeEach, expect, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { createRouter, createMemoryHistory } from 'vue-router';

import ReportView from '@/views/insights/Report.vue';

describe('ReportView', () => {
  let wrapper;
  let store;
  let router;

  const createWrapper = (stateOverrides = {}, routeQuery = {}) => {
    const reportsModule = {
      namespaced: true,
      state: {
        report: null,
        isLoadingReport: false,
        ...stateOverrides,
      },
      mutations: {
        RESET_REPORT: vi.fn(),
      },
      actions: {
        getWidgetReport: vi.fn(),
      },
    };

    const widgetsModule = {
      namespaced: true,
      state: {
        currentDashboardWidgets: [],
      },
      mutations: {
        RESET_CURRENT_DASHBOARD_WIDGETS: vi.fn(),
        RESET_REPORT: vi.fn(),
      },
      actions: {
        getCurrentDashboardWidgets: vi.fn(),
      },
    };

    store = createStore({
      modules: {
        reports: reportsModule,
        widgets: widgetsModule,
      },
    });

    router = createRouter({
      history: createMemoryHistory(),
      routes: [],
    });

    router.currentRoute.value.query = routeQuery;

    return mount(ReportView, {
      global: {
        plugins: [store, router],
        stubs: {
          DynamicWidget: true,
          IconLoading: true,
          FlowResultContactListModal: true,
        },
      },
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Loading State', () => {
    it('should show IconLoading component when isLoadingReport is true', async () => {
      wrapper = createWrapper({ isLoadingReport: true });
      await flushPromises();

      const iconLoading = wrapper.findComponent({ name: 'IconLoading' });
      expect(iconLoading.exists()).toBe(true);
    });

    it('should not show DynamicWidget component when isLoadingReport is true', async () => {
      wrapper = createWrapper({ isLoadingReport: true });
      await flushPromises();

      const dynamicWidget = wrapper.findComponent({ name: 'DynamicWidget' });
      expect(dynamicWidget.exists()).toBe(false);
    });
  });

  describe('Report Display', () => {
    it('should show DynamicWidget component when report is available and isLoadingReport is false', async () => {
      const reportData = { id: 1, name: 'Sample Report' };
      wrapper = createWrapper({ report: reportData, isLoadingReport: false });
      await flushPromises();

      const dynamicWidget = wrapper.findComponent({ name: 'DynamicWidget' });
      expect(dynamicWidget.exists()).toBe(true);
      expect(dynamicWidget.props('widget')).toEqual(reportData);
    });

    it('should not show IconLoading component when report is available', async () => {
      const reportData = { id: 1, name: 'Sample Report' };
      wrapper = createWrapper({ report: reportData });
      await flushPromises();

      const iconLoading = wrapper.findComponent({ name: 'IconLoading' });
      expect(iconLoading.exists()).toBe(false);
    });
  });

  describe('isAgentsTable logic', () => {
    it('should set isAgentsTable to true if query contains "widget=human-service-agents-table"', async () => {
      wrapper = createWrapper({}, { widget: 'human-service-agents-table' });
      await flushPromises();

      expect(wrapper.vm.isAgentsTable).toBe(true);
    });

    it('should set isAgentsTable to false if query does not contain "widget=human-service-agents-table"', async () => {
      wrapper = createWrapper({}, {});
      await flushPromises();

      expect(wrapper.vm.isAgentsTable).toBe(false);
    });
    it('should call getCurrentDashboardWidgets when isAgentsTable is true', async () => {
      const getCurrentDashboardWidgetsMock = vi.fn();

      const component = {
        ...ReportView,
        methods: {
          ...ReportView.methods,
          getCurrentDashboardWidgets: getCurrentDashboardWidgetsMock,
        },
      };

      wrapper = mount(component, {
        global: {
          plugins: [store],
          mocks: {
            $route: {
              query: { widget: 'human-service-agents-table' },
            },
          },
        },
      });

      await wrapper.vm.$nextTick();

      expect(getCurrentDashboardWidgetsMock).toHaveBeenCalled();
    });
  });

  describe('FlowResultContactListModal behavior', () => {
    it('should open modal when openFlowResultContactList is called', async () => {
      expect(wrapper.vm.showFlowResultsContactListModal).toBe(false);

      const mockData = { label: 'Test Label', flow: 'Test Flow' };
      wrapper.vm.openFlowResultContactList(mockData);
      await flushPromises();

      expect(wrapper.vm.showFlowResultsContactListModal).toBe(true);
      expect(wrapper.vm.flowResultsContactListParams).toEqual(mockData);
    });

    it('should close modal when closeFlowResultContactList is called', async () => {
      wrapper.vm.showFlowResultsContactListModal = true;
      wrapper.vm.flowResultsContactListParams = {
        label: 'Test',
        flow: 'FlowTest',
      };

      wrapper.vm.closeFlowResultContactList();
      await flushPromises();

      expect(wrapper.vm.showFlowResultsContactListModal).toBe(false);
      expect(wrapper.vm.flowResultsContactListParams).toEqual({});
    });
  });

  describe('Snapshot Testing', () => {
    it('should match the snapshot', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
