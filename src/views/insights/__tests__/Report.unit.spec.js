import { describe, it, beforeEach, expect } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ReportView from '@/views/insights/Report.vue';

describe('ReportView', () => {
  let wrapper;
  let store;

  const createWrapper = (stateOverrides = {}) => {
    store = createTestingPinia({
      initialState: {
        reports: { report: null, isLoadingReport: false, ...stateOverrides },
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
