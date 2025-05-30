import { describe, it, beforeEach, expect, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ReportView from '@/views/insights/Report.vue';

const DynamicWidget = {
  name: 'DynamicWidget',
  template: '<div class="dynamic-widget-mock"></div>',
  props: ['widget'],
  emits: ['click-data'],
};

const IconLoading = {
  name: 'IconLoading',
  template: '<div class="icon-loading-mock"></div>',
};

const FlowResultContactListModal = {
  name: 'FlowResultContactListModal',
  template: '<div class="flow-result-contact-list-modal-mock"></div>',
  props: ['flowResultLabel', 'flow'],
  emits: ['close'],
};

vi.mock('@/components/insights/widgets/DynamicWidget.vue', () => ({
  default: DynamicWidget,
}));

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
        components: {
          DynamicWidget,
          IconLoading,
          FlowResultContactListModal,
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

  describe('Flow Result Contact List', () => {
    it('should open flow result contact list modal with correct data', async () => {
      const mockData = {
        label: 'Test Label',
        flow: { id: 1, name: 'Test Flow' },
      };

      wrapper = createWrapper();
      await wrapper.vm.openFlowResultContactList(mockData);

      expect(wrapper.vm.showFlowResultsContactListModal).toBe(true);
      expect(wrapper.vm.flowResultsContactListParams).toEqual(mockData);
    });

    it('should close flow result contact list modal and reset params', async () => {
      wrapper = createWrapper();

      const mockData = {
        label: 'Test Label',
        flow: { id: 1, name: 'Test Flow' },
      };
      await wrapper.vm.openFlowResultContactList(mockData);

      await wrapper.vm.closeFlowResultContactList();

      expect(wrapper.vm.showFlowResultsContactListModal).toBe(false);
      expect(wrapper.vm.flowResultsContactListParams).toEqual({});
    });

    it('should render FlowResultContactListModal when showFlowResultsContactListModal is true', async () => {
      const mockData = {
        label: 'Test Label',
        flow: { id: 1, name: 'Test Flow' },
      };

      wrapper = createWrapper();
      await wrapper.vm.openFlowResultContactList(mockData);

      const modal = wrapper.findComponent({
        name: 'FlowResultContactListModal',
      });
      expect(modal.exists()).toBe(true);
      expect(modal.props('flowResultLabel')).toBe(mockData.label);
      expect(modal.props('flow')).toEqual(mockData.flow);
    });

    it('should call closeFlowResultContactList when modal emits close event', async () => {
      const mockData = {
        label: 'Test Label',
        flow: { id: 1, name: 'Test Flow' },
      };

      wrapper = createWrapper();
      await wrapper.vm.openFlowResultContactList(mockData);

      const modal = wrapper.findComponent({
        name: 'FlowResultContactListModal',
      });
      await modal.vm.$emit('close');

      expect(wrapper.vm.showFlowResultsContactListModal).toBe(false);
      expect(wrapper.vm.flowResultsContactListParams).toEqual({});
    });
  });

  describe('Async Component Loading', () => {
    it('should load DynamicWidget component asynchronously', async () => {
      const reportData = { id: 1, name: 'Sample Report' };
      wrapper = createWrapper({ report: reportData, isLoadingReport: false });

      await flushPromises();

      const dynamicWidget = wrapper.findComponent({ name: 'DynamicWidget' });
      expect(dynamicWidget.exists()).toBe(true);
      expect(dynamicWidget.props('widget')).toEqual(reportData);
    });
  });
});
