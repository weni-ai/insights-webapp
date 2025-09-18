import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { shallowMount, config } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import HeaderRefresh from '../HeaderRefresh.vue';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';

config.global.plugins = [
  createI18n({
    legacy: false,
    messages: {
      en: {
        'insights_header.refresh': 'Refresh',
      },
    },
  }),
];

// Mock the store
vi.mock('@/store/modules/humanSupport/monitoring');

const createWrapper = (options = {}) => {
  return shallowMount(HeaderRefresh, {
    global: {
      stubs: {
        UnnnicButton: true,
      },
      ...options.global,
    },
    ...options,
  });
};

describe('HeaderRefresh.vue', () => {
  let wrapper;
  let monitoringStore;

  beforeEach(() => {
    setActivePinia(createPinia());

    // Setup mock store
    monitoringStore = {
      isLoadingData: false,
      loadData: vi.fn(),
    };
    useHumanSupportMonitoring.mockReturnValue(monitoringStore);

    wrapper = createWrapper();
  });

  describe('Component Structure', () => {
    it('should render the UnnnicButton component', () => {
      const refreshButton = wrapper.findComponent({ name: 'UnnnicButton' });
      expect(refreshButton.exists()).toBe(true);
    });

    it('should pass correct props to UnnnicButton', () => {
      const refreshButton = wrapper.findComponent({ name: 'UnnnicButton' });
      const props = refreshButton.props();

      expect(props.text).toBe('insights_header.refresh');
      expect(props.type).toBe('tertiary');
      expect(props.iconLeft).toBe('refresh');
      expect(refreshButton.attributes('data-testid')).toBe('refresh-button');
    });
  });

  describe('Loading State', () => {
    it('should pass isLoadingData to disabled prop', () => {
      const refreshButton = wrapper.findComponent({ name: 'UnnnicButton' });

      // Check that disabled prop receives the value from isLoadingData
      expect(refreshButton.props('disabled')).toBe(
        monitoringStore.isLoadingData,
      );
    });

    it('should connect disabled prop to loading state', () => {
      // Verify that the component template binds disabled to isLoadingData
      const refreshButton = wrapper.findComponent({ name: 'UnnnicButton' });

      // The disabled prop should be bound to the store's loading state
      expect(refreshButton.props('disabled')).toBe(
        monitoringStore.isLoadingData,
      );
    });
  });

  describe('User Interactions', () => {
    it('should call refreshData when button is clicked', async () => {
      const refreshButton = wrapper.findComponent({ name: 'UnnnicButton' });

      await refreshButton.vm.$emit('click');

      expect(monitoringStore.loadData).toHaveBeenCalledTimes(1);
    });

    it('should call loadData from store when refreshData is executed', () => {
      wrapper.vm.refreshData();

      expect(monitoringStore.loadData).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple refresh clicks', async () => {
      const refreshButton = wrapper.findComponent({ name: 'UnnnicButton' });

      await refreshButton.vm.$emit('click');
      await refreshButton.vm.$emit('click');
      await refreshButton.vm.$emit('click');

      expect(monitoringStore.loadData).toHaveBeenCalledTimes(3);
    });
  });

  describe('Component Behavior', () => {
    it('should have proper template structure', () => {
      // Verify the component renders correctly
      const refreshButton = wrapper.findComponent({ name: 'UnnnicButton' });
      expect(refreshButton.exists()).toBe(true);

      // Verify the button is configured correctly
      expect(refreshButton.props('type')).toBe('tertiary');
      expect(refreshButton.props('iconLeft')).toBe('refresh');
    });
  });

  describe('Store Integration', () => {
    it('should use the correct store', () => {
      expect(useHumanSupportMonitoring).toHaveBeenCalled();
    });

    it('should have access to store methods', () => {
      expect(typeof wrapper.vm.refreshData).toBe('function');
    });

    it('should access loadData function from store', () => {
      expect(wrapper.vm.loadData).toBe(monitoringStore.loadData);
    });
  });

  describe('Component Props and Attributes', () => {
    it('should have correct data-testid', () => {
      const refreshButton = wrapper.findComponent({ name: 'UnnnicButton' });
      expect(refreshButton.attributes('data-testid')).toBe('refresh-button');
    });

    it('should use correct button styling', () => {
      const refreshButton = wrapper.findComponent({ name: 'UnnnicButton' });
      const props = refreshButton.props();

      expect(props.type).toBe('tertiary');
      expect(props.iconLeft).toBe('refresh');
    });
  });

  describe('Edge Cases', () => {
    it('should handle store being defined with expected properties', () => {
      expect(monitoringStore.isLoadingData).toBeDefined();
      expect(monitoringStore.loadData).toBeDefined();
      expect(typeof monitoringStore.loadData).toBe('function');
    });

    it('should handle loadData throwing an error', async () => {
      monitoringStore.loadData.mockRejectedValue(new Error('Load failed'));

      const refreshButton = wrapper.findComponent({ name: 'UnnnicButton' });

      await refreshButton.vm.$emit('click');
      expect(monitoringStore.loadData).toHaveBeenCalled();
    });
  });
});
