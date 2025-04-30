import { mount, config, flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardCommerce from '@/views/insights/DashboardCommerce.vue';
import CardMetric from '@/components/home/CardMetric.vue';
import { createI18n } from 'vue-i18n';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';
import api from '@/services/api/resources/metrics';
import { format, subDays } from 'date-fns';

const useSharedStoreMock = vi.fn(() => ({
  auth: { token: 'mock-token' },
  current: { project: { uuid: 'mock-uuid' } },
}));

vi.mock('host/sharedStore', () => ({
  useSharedStore: useSharedStoreMock,
}));

vi.mock('@/utils/time', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getLastNDays: vi.fn((days) => ({
      start: format(subDays(new Date(), days - 1), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd'),
    })),
    getTodayDate: vi.fn(() => ({
      start: format(new Date(), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd'),
    })),
  };
});

vi.mock('@/services/api/resources/metrics', () => ({
  default: {
    getMetrics: vi.fn(() =>
      Promise.resolve({
        'sent-messages': { value: 1325, prefix: '' },
        'delivered-messages': { value: 1259, prefix: '' },
        'read-messages': { value: 956, prefix: '' },
        interactions: { value: 569, prefix: '' },
        'utm-revenue': { value: 44566.0, prefix: 'R$' },
        'orders-placed': { value: 86, prefix: '' },
      }),
    ),
  },
}));

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {},
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n, UnnnicSystem];
config.global.mocks = {
  $t: (key) => key,
};

describe('DashboardCommerce', () => {
  let wrapper;
  const consoleSpy = vi.spyOn(console, 'error');

  beforeEach(async () => {
    api.getMetrics.mockClear();

    wrapper = mount(DashboardCommerce, {
      propsData: {},
      global: {
        plugins: [i18n, UnnnicSystem],
        components: {
          CardMetric,
        },
        stubs: {
          UnnnicInputDatePicker: true,
        },
        mocks: {
          $t: (key) => key,
        },
      },
    });
    consoleSpy.mockClear();

    await wrapper.vm.$nextTick();
  });

  describe('loading state', () => {
    it('shows loading state while fetching data', async () => {
      wrapper = mount(DashboardCommerce, {
        propsData: {},
        global: {
          plugins: [i18n, UnnnicSystem],
          components: {
            CardMetric,
          },
          mocks: {
            $t: (key) => key,
          },
          stubs: {
            UnnnicInputDatePicker: true,
          },
        },
      });

      await flushPromises();

      wrapper.vm.isLoading = true;
      await wrapper.vm.$nextTick();

      expect(
        wrapper.find('[data-test-id="dashboard-commerce__loading"]').exists(),
      ).toBe(true);

      wrapper.vm.isLoading = false;
      await wrapper.vm.$nextTick();

      await vi.waitFor(() => {
        return !wrapper.vm.isLoading;
      });

      expect(
        wrapper.find('[data-test-id="dashboard-commerce__loading"]').exists(),
      ).toBe(false);
    });
  });

  describe('API interactions', () => {
    it('calls getMetrics on mount with correct date range and auth token', async () => {
      await flushPromises();

      const initialStartDate = format(subDays(new Date(), 6), 'yyyy-MM-dd');
      const initialEndDate = format(new Date(), 'yyyy-MM-dd');

      expect(api.getMetrics).toHaveBeenCalledWith(
        {
          start_date: initialStartDate,
          end_date: initialEndDate,
          project_uuid: 'mock-uuid',
        },
        'mock-token',
      );
    });

    it('handles API error gracefully', async () => {
      api.getMetrics.mockRejectedValueOnce(new Error('API Error'));
      const consoleSpy = vi.spyOn(console, 'error');

      wrapper = mount(DashboardCommerce, {
        propsData: {},
        global: {
          plugins: [i18n, UnnnicSystem],
          components: {
            CardMetric,
          },
          stubs: {
            UnnnicInputDatePicker: true,
          },
          mocks: {
            $t: (key) => key,
          },
        },
      });

      await flushPromises();
      await wrapper.vm.$nextTick();

      expect(consoleSpy).toHaveBeenCalledWith(
        'error getMetrics',
        expect.any(Error),
      );
    });

    it('does not fetch metrics when token is not present', async () => {
      api.getMetrics.mockClear();

      useSharedStoreMock.mockResolvedValueOnce(() => ({
        auth: { token: null },
        current: { project: { uuid: null } },
      }));

      wrapper = mount(DashboardCommerce, {
        propsData: {},
        global: {
          plugins: [i18n, UnnnicSystem],
          components: {
            CardMetric,
          },
          mocks: {
            $t: (key) => key,
          },
          stubs: {
            UnnnicInputDatePicker: true,
          },
        },
      });
      await wrapper.vm.$nextTick();

      expect(api.getMetrics).not.toHaveBeenCalled();
    });
  });

  describe('rendering', () => {
    it('renders the component properly', () => {
      expect(wrapper.exists()).toBeTruthy();
      expect(
        wrapper.find('[data-test-id="dashboard-commerce"]').exists(),
      ).toBeTruthy();
    });

    it('renders the header title correctly', () => {
      const headerTitle = wrapper.find(
        '[data-test-id="dashboard-commerce__header-title"]',
      );
      expect(headerTitle.text()).toBe('dashboard_commerce.title');
    });

    it('renders the date picker filter with correct min/max dates', () => {
      const datePicker = wrapper.findComponent(
        '[data-test-id="filter-type__date-picker"]',
      );
      expect(datePicker.exists()).toBeTruthy();
      expect(datePicker.props('disableClear')).toBe(true);
      expect(datePicker.props('position')).toBe('right');

      const expectedMinDate = format(subDays(new Date(), 89), 'yyyy-MM-dd');
      const expectedMaxDate = format(new Date(), 'yyyy-MM-dd');

      expect(datePicker.props('minDate')).toBe(expectedMinDate);
      expect(datePicker.props('maxDate')).toBe(expectedMaxDate);
    });
  });

  describe('filter functionality', () => {
    it('provides all required filter options', () => {
      const expectedOptions = [
        'Last 7 days',
        'Last 14 days',
        'Last 30 days',
        'Last 45 days',
        'Last 90 days',
      ];

      expect(wrapper.vm.filterOptions.map((opt) => opt.name)).toEqual(
        expectedOptions,
      );
    });

    it('updates metrics when date filter changes', async () => {
      await flushPromises();

      const initialMetrics = { ...wrapper.vm.metrics };
      const newDate = { start: '2024-01-01', end: '2024-01-15' };

      api.getMetrics.mockClear();
      api.getMetrics.mockResolvedValueOnce({
        'sent-messages': { value: 999, prefix: '' },
      });

      await wrapper.vm.updateFilter(newDate);
      await wrapper.vm.$nextTick();

      expect(api.getMetrics).toHaveBeenCalledWith(
        {
          start_date: newDate.start,
          end_date: newDate.end,
          project_uuid: 'mock-uuid',
        },
        'mock-token',
      );
      expect(wrapper.vm.metrics).not.toEqual(initialMetrics);
      expect(wrapper.vm.metrics['sent-messages'].value).toBe(999);
    });
  });

  describe('metrics data structure', () => {
    it('verifies all metrics have required properties', async () => {
      if (wrapper.vm.isLoading) {
        return;
      }
      await flushPromises();
      const metrics = wrapper.findAllComponents(CardMetric);
      expect(metrics.length).toBeGreaterThan(0);

      metrics.forEach((metric) => {
        const props = metric.props();

        expect(props).toHaveProperty('title');
        expect(props).toHaveProperty('value');
        expect(props).toHaveProperty('prefix');
        expect(props).toHaveProperty('tooltipInfo');
      });
    });
  });
});
