import { describe, it, beforeEach, expect, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createStore } from 'vuex';

import ReportView from '@/views/insights/Report.vue';

describe('ReportView', () => {
  let wrapper;
  let store;

  const createWrapper = (stateOverrides = {}) => {
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
      mutations: {
        RESET_CURRENT_DASHBOARD_WIDGETS: vi.fn(),
      },
    };

    store = createStore({
      modules: {
        reports: reportsModule,
        widgets: widgetsModule,
      },
    });

    return mount(ReportView, {
      global: {
        plugins: [store],
        stubs: {
          DynamicWidget: true,
          IconLoading: true,
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

  describe('Snapshot Testing', () => {
    it('should match the snapshot', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
