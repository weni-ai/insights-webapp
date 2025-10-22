import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import Monitoring from '../Monitoring.vue';

const mockHumanSupportMonitoringStore = {
  loadAllData: vi.fn(),
  setRefreshDataMonitoring: vi.fn(),
};

vi.mock('@/store/modules/humanSupport/monitoring', () => ({
  useHumanSupportMonitoring: () => mockHumanSupportMonitoringStore,
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
    Object.assign(mockHumanSupportMonitoringStore, storeOverrides);
    return mount(Monitoring, {
      global: {
        stubs: {
          ServiceStatus: true,
          TimeMetrics: true,
          ServicesOpenByHour: true,
          DetailedMonitoring: true,
        },
      },
    });
  };

  const section = () => wrapper.find('[data-testid="monitoring"]');

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    Object.assign(mockHumanSupportMonitoringStore, {
      loadAllData: vi.fn(),
      setRefreshDataMonitoring: vi.fn(),
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

    it('should render all child components', () => {
      expect(wrapper.findComponent({ name: 'ServiceStatus' }).exists()).toBe(
        true,
      );
      expect(wrapper.findComponent({ name: 'TimeMetrics' }).exists()).toBe(
        true,
      );
      expect(
        wrapper.findComponent({ name: 'ServicesOpenByHour' }).exists(),
      ).toBe(true);
      expect(
        wrapper.findComponent({ name: 'DetailedMonitoring' }).exists(),
      ).toBe(true);
    });

    it('should have correct data-testids for child components', () => {
      const serviceStatus = wrapper.findComponent({ name: 'ServiceStatus' });
      const timeMetrics = wrapper.findComponent({ name: 'TimeMetrics' });
      const servicesOpenByHour = wrapper.findComponent({
        name: 'ServicesOpenByHour',
      });
      const detailedMonitoring = wrapper.findComponent({
        name: 'DetailedMonitoring',
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
      expect(detailedMonitoring.attributes('data-testid')).toBe(
        'monitoring-detailed-monitoring',
      );
    });
  });

  describe('Component structure', () => {
    it('should have correct CSS classes', () => {
      expect(section().classes()).toContain('monitoring');
    });
  });

  describe('Lifecycle management', () => {
    it('should call setRefreshDataMonitoring on mount', () => {
      expect(
        mockHumanSupportMonitoringStore.setRefreshDataMonitoring,
      ).toHaveBeenCalledWith(true);
    });

    it('should start auto refresh on mount', async () => {
      expect(vi.getTimerCount()).toBeGreaterThan(0);
    });

    it('should cleanup interval on unmount', async () => {
      vi.clearAllTimers();

      const testWrapper = createWrapper();

      const timersBeforeUnmount = vi.getTimerCount();
      expect(timersBeforeUnmount).toBeGreaterThan(0);

      testWrapper.unmount();

      const timersAfterUnmount = vi.getTimerCount();
      expect(timersAfterUnmount).toBeLessThan(timersBeforeUnmount);
    });
  });

  describe('Data loading', () => {
    it('should set refresh flag to true immediately', () => {
      expect(
        mockHumanSupportMonitoringStore.setRefreshDataMonitoring,
      ).toHaveBeenCalledWith(true);
    });

    it('should set refresh flag to false after 500ms', async () => {
      wrapper.unmount();
      vi.clearAllTimers();
      vi.clearAllMocks();

      const newWrapper = createWrapper();

      await vi.advanceTimersByTimeAsync(500);

      expect(
        mockHumanSupportMonitoringStore.setRefreshDataMonitoring,
      ).toHaveBeenCalledTimes(2);
      expect(
        mockHumanSupportMonitoringStore.setRefreshDataMonitoring,
      ).toHaveBeenNthCalledWith(1, true);
      expect(
        mockHumanSupportMonitoringStore.setRefreshDataMonitoring,
      ).toHaveBeenNthCalledWith(2, false);

      newWrapper.unmount();
    });
  });
});
