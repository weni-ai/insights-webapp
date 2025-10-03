import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import Monitoring from '../Monitoring.vue';

const mockDashboardStore = {
  updateLastUpdatedRequest: vi.fn(),
};

vi.mock('@/store/modules/dashboards', () => ({
  useDashboards: () => mockDashboardStore,
}));

vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    storeToRefs: (store) => store,
  };
});

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {},
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

describe('Monitoring', () => {
  let wrapper;

  const createWrapper = (storeOverrides = {}) => {
    Object.assign(mockDashboardStore, storeOverrides);
    return mount(Monitoring, {
      global: {
        stubs: {
          ServiceStatus: true,
          TimeMetrics: true,
          ServicesOpenByHour: true,
        },
      },
    });
  };

  const section = () => wrapper.find('[data-testid="monitoring"]');

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    Object.assign(mockDashboardStore, {
      updateLastUpdatedRequest: vi.fn(),
    });

    wrapper = createWrapper();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  describe('Component rendering', () => {
    it('should render main section', () => {
      expect(section().exists()).toBe(true);
    });

    it('should render both child components', () => {
      expect(wrapper.findComponent({ name: 'ServiceStatus' }).exists()).toBe(
        true,
      );
      expect(wrapper.findComponent({ name: 'TimeMetrics' }).exists()).toBe(
        true,
      );
      expect(
        wrapper.findComponent({ name: 'ServicesOpenByHour' }).exists(),
      ).toBe(true);
    });

    it('should have correct data-testids for child components', () => {
      const serviceStatus = wrapper.findComponent({ name: 'ServiceStatus' });
      const timeMetrics = wrapper.findComponent({ name: 'TimeMetrics' });
      const servicesOpenByHour = wrapper.findComponent({
        name: 'ServicesOpenByHour',
      });

      expect(serviceStatus.attributes('data-testid')).toBe(
        'monitoring-service-status',
      );
      expect(timeMetrics.attributes('data-testid')).toBe(
        'monitoring-time-metrics',
      );
      expect(servicesOpenByHour.attributes('data-testid')).toBe(
        'monitoring-services-open-by-hour',
      );
    });
  });

  describe('Component structure', () => {
    it('should have correct CSS classes', () => {
      expect(section().classes()).toContain('monitoring');
    });
  });

  describe('Lifecycle management', () => {
    it('should initialize with correct default values', () => {
      const vm = wrapper.vm;

      expect(vm.isLoading).toBe(false);
      expect(vm.autoRefreshInterval).not.toBe(null);
      expect(vm.AUTO_REFRESH_INTERVAL).toBe(60000);
    });

    it('should call loadData on mount', () => {
      expect(mockDashboardStore.updateLastUpdatedRequest).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Monitoring mounted');
    });

    it('should start auto refresh on mount', () => {
      const vm = wrapper.vm;
      expect(vm.autoRefreshInterval).not.toBe(null);
    });

    it('should cleanup on unmount', () => {
      const vm = wrapper.vm;
      wrapper.unmount();

      expect(console.log).toHaveBeenCalledWith('Monitoring unmounted');
      expect(vm.autoRefreshInterval).toBe(null);
    });
  });

  describe('Data loading', () => {
    it('should handle loadData correctly', async () => {
      const vm = wrapper.vm;

      expect(vm.isLoading).toBe(false);

      await vm.loadData();
      expect(mockDashboardStore.updateLastUpdatedRequest).toHaveBeenCalled();
    });

    it('should prevent concurrent loads', async () => {
      const vm = wrapper.vm;

      vm.isLoading = true;
      const loadResult = await vm.loadData();

      expect(loadResult).toBeUndefined();
    });

    it('should handle errors gracefully', async () => {
      const vm = wrapper.vm;
      const error = new Error('Load error');

      mockDashboardStore.updateLastUpdatedRequest.mockImplementationOnce(() => {
        throw error;
      });

      await vm.loadData();

      expect(console.error).toHaveBeenCalledWith('Erro to get data:', error);
      expect(vm.isLoading).toBe(false);
    });
  });

  describe('Auto refresh functionality', () => {
    it('should start auto refresh with correct interval', () => {
      const vm = wrapper.vm;

      vm.startAutoRefresh();

      expect(vm.autoRefreshInterval).not.toBe(null);
    });

    it('should execute loadData on interval', () => {
      const vm = wrapper.vm;

      const originalSetInterval = globalThis.setInterval;
      const mockCallback = vi.fn();
      globalThis.setInterval = vi.fn(() => {
        mockCallback();
        return 123;
      });

      vm.startAutoRefresh();

      expect(globalThis.setInterval).toHaveBeenCalledWith(
        expect.any(Function),
        60000,
      );

      globalThis.setInterval = originalSetInterval;
    });

    it('should stop auto refresh correctly', () => {
      const vm = wrapper.vm;

      vm.startAutoRefresh();
      expect(vm.autoRefreshInterval).not.toBe(null);

      vm.stopAutoRefresh();
      expect(vm.autoRefreshInterval).toBe(null);
    });

    it('should handle multiple stop calls gracefully', () => {
      const vm = wrapper.vm;

      expect(() => {
        vm.stopAutoRefresh();
        vm.stopAutoRefresh();
      }).not.toThrow();
    });

    it('should clear existing interval before starting new one', () => {
      const vm = wrapper.vm;
      const originalInterval = vm.autoRefreshInterval;

      vm.startAutoRefresh();

      expect(vm.autoRefreshInterval).not.toBe(originalInterval);
    });
  });

  describe('Error handling', () => {
    it('should handle missing dashboard store gracefully', () => {
      wrapper = createWrapper({ updateLastUpdatedRequest: null });

      expect(wrapper.exists()).toBe(true);
    });

    it('should handle component unmount during loading', async () => {
      const vm = wrapper.vm;

      const loadPromise = vm.loadData();
      wrapper.unmount();

      await loadPromise;
      expect(vm.isLoading).toBe(false);
    });
  });

  describe('Constants and configuration', () => {
    it('should have correct auto refresh interval', () => {
      const vm = wrapper.vm;
      expect(vm.AUTO_REFRESH_INTERVAL).toBe(60 * 1000);
    });
  });
});
