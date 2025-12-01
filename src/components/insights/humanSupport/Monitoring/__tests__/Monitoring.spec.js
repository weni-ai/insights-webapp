import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { ref } from 'vue';

import Monitoring from '../Monitoring.vue';

const mockHumanSupportMonitoringStore = {
  setRefreshDataMonitoring: vi.fn(),
};

vi.mock('@/store/modules/humanSupport/monitoring', () => ({
  useHumanSupportMonitoring: () => mockHumanSupportMonitoringStore,
}));

const mockTimeoutStop = vi.fn();

vi.mock('@vueuse/core', () => ({
  useTimeoutFn: vi.fn((fn, delay) => {
    setTimeout(fn, delay);
    return { stop: mockTimeoutStop };
  }),
  useElementVisibility: vi.fn(() => ref(true)),
}));

vi.mock('@/utils/storage', () => ({
  moduleStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
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
  let mockModuleStorage;

  const createWrapper = (storeOverrides = {}) => {
    Object.assign(mockHumanSupportMonitoringStore, storeOverrides);
    return mount(Monitoring, {
      global: {
        stubs: {
          StatusCards: true,
          TimeMetrics: true,
          ServicesOpenByHour: true,
          DetailedMonitoring: true,
          NewsHumanSupportModal: true,
        },
      },
    });
  };

  const section = () => wrapper.find('[data-testid="monitoring"]');

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    Object.assign(mockHumanSupportMonitoringStore, {
      setRefreshDataMonitoring: vi.fn(),
    });

    const { moduleStorage } = await import('@/utils/storage');
    mockModuleStorage = moduleStorage;
    mockModuleStorage.getItem.mockReturnValue(false);
    mockModuleStorage.setItem.mockClear();

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
      expect(wrapper.findComponent({ name: 'StatusCards' }).exists()).toBe(
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
      const statusCards = wrapper.findComponent({ name: 'StatusCards' });
      const timeMetrics = wrapper.findComponent({ name: 'TimeMetrics' });
      const servicesOpenByHour = wrapper.findComponent({
        name: 'ServicesOpenByHour',
      });
      const detailedMonitoring = wrapper.findComponent({
        name: 'DetailedMonitoring',
      });

      expect(statusCards.attributes('data-testid')).toBe(
        'monitoring-status-cards',
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
    it('should start auto refresh on mount when visible', async () => {
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
    it('should load data on first auto refresh interval', async () => {
      wrapper.unmount();
      vi.clearAllTimers();
      vi.clearAllMocks();

      const newWrapper = createWrapper();

      await vi.advanceTimersByTimeAsync(60000);

      expect(
        mockHumanSupportMonitoringStore.setRefreshDataMonitoring,
      ).toHaveBeenCalledWith(true);

      newWrapper.unmount();
    });

    it('should set refresh flag to false after 500ms of loading', async () => {
      wrapper.unmount();
      vi.clearAllTimers();
      vi.clearAllMocks();

      const newWrapper = createWrapper();

      await vi.advanceTimersByTimeAsync(60000);

      expect(
        mockHumanSupportMonitoringStore.setRefreshDataMonitoring,
      ).toHaveBeenCalledWith(true);

      await vi.advanceTimersByTimeAsync(500);

      expect(
        mockHumanSupportMonitoringStore.setRefreshDataMonitoring,
      ).toHaveBeenCalledWith(false);

      newWrapper.unmount();
    });
  });

  describe('Auto refresh functionality', () => {
    it('should refresh data every 60 seconds', async () => {
      wrapper.unmount();
      vi.clearAllTimers();
      vi.clearAllMocks();

      const newWrapper = createWrapper();

      expect(
        mockHumanSupportMonitoringStore.setRefreshDataMonitoring,
      ).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(60000);

      expect(
        mockHumanSupportMonitoringStore.setRefreshDataMonitoring,
      ).toHaveBeenCalledWith(true);

      newWrapper.unmount();
    });

    it('should refresh data flag on each auto refresh', async () => {
      wrapper.unmount();
      vi.clearAllTimers();
      vi.clearAllMocks();

      const newWrapper = createWrapper();

      await vi.advanceTimersByTimeAsync(60000);

      expect(
        mockHumanSupportMonitoringStore.setRefreshDataMonitoring,
      ).toHaveBeenCalledWith(true);

      await vi.advanceTimersByTimeAsync(500);

      expect(
        mockHumanSupportMonitoringStore.setRefreshDataMonitoring,
      ).toHaveBeenCalledWith(false);

      newWrapper.unmount();
    });

    it('should stop auto refresh on unmount', async () => {
      wrapper.unmount();
      vi.clearAllTimers();
      vi.clearAllMocks();

      const newWrapper = createWrapper();

      expect(
        mockHumanSupportMonitoringStore.setRefreshDataMonitoring,
      ).not.toHaveBeenCalled();

      newWrapper.unmount();
      await vi.advanceTimersByTimeAsync(60000);

      expect(
        mockHumanSupportMonitoringStore.setRefreshDataMonitoring,
      ).not.toHaveBeenCalled();
    });
  });

  describe('Constants and configuration', () => {
    it('should use 60 second auto refresh interval', async () => {
      wrapper.unmount();
      vi.clearAllTimers();
      vi.clearAllMocks();

      const newWrapper = createWrapper();

      await vi.advanceTimersByTimeAsync(59000);

      expect(
        mockHumanSupportMonitoringStore.setRefreshDataMonitoring,
      ).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1000);

      expect(
        mockHumanSupportMonitoringStore.setRefreshDataMonitoring,
      ).toHaveBeenCalledWith(true);

      newWrapper.unmount();
    });
  });

  describe('News Modal functionality', () => {
    it('should render NewsHumanSupportModal component', () => {
      const modal = wrapper.findComponent({ name: 'NewsHumanSupportModal' });
      expect(modal.exists()).toBe(true);
    });

    it('should show modal on first visit', async () => {
      wrapper.unmount();
      mockModuleStorage.getItem.mockReturnValue(false);

      const newWrapper = createWrapper();
      await newWrapper.vm.$nextTick();

      const modal = newWrapper.findComponent({ name: 'NewsHumanSupportModal' });
      expect(modal.props('modelValue')).toBe(true);

      newWrapper.unmount();
    });

    it('should not show modal if already shown', async () => {
      wrapper.unmount();
      mockModuleStorage.getItem.mockReturnValue(true);

      const newWrapper = createWrapper();
      await newWrapper.vm.$nextTick();

      const modal = newWrapper.findComponent({ name: 'NewsHumanSupportModal' });
      expect(modal.props('modelValue')).toBe(false);

      newWrapper.unmount();
    });

    it('should save to storage when modal is closed', async () => {
      mockModuleStorage.getItem.mockReturnValue(false);

      const newWrapper = createWrapper();
      await newWrapper.vm.$nextTick();

      const modal = newWrapper.findComponent({ name: 'NewsHumanSupportModal' });
      await modal.vm.$emit('close');

      expect(mockModuleStorage.setItem).toHaveBeenCalledWith(
        'news_modal_monitoring_shown',
        true,
      );

      newWrapper.unmount();
    });

    it('should hide modal after close event', async () => {
      mockModuleStorage.getItem.mockReturnValue(false);

      const newWrapper = createWrapper();
      await newWrapper.vm.$nextTick();

      const modal = newWrapper.findComponent({ name: 'NewsHumanSupportModal' });
      expect(modal.props('modelValue')).toBe(true);

      await modal.vm.$emit('close');
      await newWrapper.vm.$nextTick();

      expect(modal.props('modelValue')).toBe(false);

      newWrapper.unmount();
    });

    it('should pass correct type prop to NewsHumanSupportModal', () => {
      const modal = wrapper.findComponent({ name: 'NewsHumanSupportModal' });
      expect(modal.props('type')).toBe('monitoring');
    });
  });
});
