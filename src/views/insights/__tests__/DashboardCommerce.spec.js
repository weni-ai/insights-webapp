import { mount, config } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardCommerce from '@/views/insights/DashboardCommerce.vue';
import CardMetric from '@/components/home/CardMetric.vue';
import DropdownFilter from '@/components/home/DropdownFilter.vue';
import { createI18n } from 'vue-i18n';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';
import api from '@/services/api/resources/metrics';

vi.mock('@/services/api/resources/metrics', () => ({
  default: {
    getMetrics: vi.fn(() =>
      Promise.resolve({
        data: [
          { id: 'sent-messages', value: 1325, percentage: 5.08 },
          { id: 'delivered-messages', value: 1259, percentage: -1.12 },
          { id: 'read-messages', value: 956, percentage: -2.08 },
          { id: 'interactions', value: 569, percentage: 6.13 },
          { id: 'utm-revenue', value: 44566.0, percentage: 12.2, prefix: 'R$' },
          { id: 'orders-placed', value: 86, percentage: 0 },
        ],
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

const mockGetTodayDate = vi.fn(() => ({
  start: '2024-01-01',
  end: '2024-01-01',
}));
const mockGetLastNDays = vi.fn((days) => ({
  start: '2024-01-01',
  end: days === 30 ? '2024-01-30' : days === 14 ? '2024-01-14' : '2024-01-07',
}));

vi.mock('@/utils/time', () => ({
  getTodayDate: () => mockGetTodayDate(),
  getLastNDays: (days) => mockGetLastNDays(days),
}));

describe('DashboardCommerce', () => {
  let wrapper;
  const consoleSpy = vi.spyOn(console, 'error');

  beforeEach(async () => {
    wrapper = mount(DashboardCommerce, {
      propsData: {
        auth: { token: 'mock-token', uuid: 'mock-uuid' },
      },
      global: {
        plugins: [i18n, UnnnicSystem],
        components: {
          CardMetric,
          DropdownFilter,
        },
        mocks: {
          $t: (key) => key,
        },
      },
    });
    consoleSpy.mockClear();
    // Wait for initial data fetch
    await wrapper.vm.$nextTick();
  });

  describe('loading state', () => {
    it('shows loading state while fetching data', async () => {
      wrapper = mount(DashboardCommerce, {
        propsData: {
          auth: { token: 'mock-token', uuid: 'mock-uuid' },
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          components: {
            CardMetric,
            DropdownFilter,
          },
          mocks: {
            $t: (key) => key,
          },
        },
      });
      expect(wrapper.find('.dashboard-commerce__loading').exists()).toBe(true);
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.dashboard-commerce__loading').exists()).toBe(false);
    });
  });

  describe('API interactions', () => {
    it('calls getMetrics on mount with correct date range and auth token', () => {
      expect(api.getMetrics).toHaveBeenCalledWith(
        {
          start_date: expect.any(String),
          end_date: expect.any(String),
          project_uuid: 'mock-uuid',
        },
        'mock-token',
      );
    });

    it('calls getMetrics when filter changes with correct auth token', async () => {
      const dropdownFilter = wrapper.findComponent(DropdownFilter);
      await dropdownFilter.vm.$emit('select', 'Today');

      expect(api.getMetrics).toHaveBeenCalledWith(
        {
          start_date: expect.any(String),
          end_date: expect.any(String),
          project_uuid: 'mock-uuid',
        },
        'mock-token',
      );
    });

    it('handles API error gracefully', async () => {
      vi.spyOn(api, 'getMetrics').mockRejectedValueOnce(new Error('API Error'));
      const consoleSpy = vi.spyOn(console, 'error');

      await wrapper.vm.getMetrics('2024-01-01', '2024-01-07');

      expect(consoleSpy).toHaveBeenCalledWith(
        'error getMetrics',
        expect.any(Error),
      );
      expect(wrapper.find('.metrics-container').exists()).toBe(true);
    });

    it('does not fetch metrics when token is not present', async () => {
      const getMetricsSpy = vi.spyOn(api, 'getMetrics');

      wrapper = mount(DashboardCommerce, {
        propsData: {
          auth: null,
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          components: {
            CardMetric,
            DropdownFilter,
          },
          mocks: {
            $t: (key) => key,
          },
        },
      });
      await wrapper.vm.$nextTick();

      expect(getMetricsSpy).not.toHaveBeenCalled();
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

    it('renders the filter section', () => {
      const filterSection = wrapper.find('[data-test-id="filter-type"]');
      expect(filterSection.exists()).toBeTruthy();
      expect(filterSection.text()).toContain('filter-by');
    });

    it('renders the DropdownFilter component', () => {
      const dropdownFilter = wrapper.findComponent(DropdownFilter);
      expect(dropdownFilter.exists()).toBeTruthy();
    });
  });

  describe('filter functionality', () => {
    it('initializes with correct default filter', () => {
      const dropdownFilter = wrapper.findComponent(DropdownFilter);
      expect(dropdownFilter.props('defaultItem')).toEqual({
        name: 'dashboard_commerce.filters.last_7_days',
      });
    });

    it('provides all required filter options', () => {
      const dropdownFilter = wrapper.findComponent(DropdownFilter);
      const filterItems = dropdownFilter.props('items');

      const expectedOptions = [
        'dashboard_commerce.filters.today',
        'dashboard_commerce.filters.last_7_days',
        'dashboard_commerce.filters.last_14_days',
        'dashboard_commerce.filters.last_30_days',
      ];

      const filterNames = filterItems.map((item) => item.name);
      expect(filterNames).toEqual(expectedOptions);
    });

    it('updates metrics when filter changes', async () => {
      const dropdownFilter = wrapper.findComponent(DropdownFilter);
      const initialMetrics = [...wrapper.vm.metrics.data];

      vi.spyOn(api, 'getMetrics').mockResolvedValueOnce({
        data: [{ id: 'sent-messages', value: 999, percentage: 1.0 }],
      });

      await dropdownFilter.vm.$emit('select', 'Today');
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.metrics).not.toEqual(initialMetrics);
    });
  });

  describe('metrics data structure', () => {
    it('verifies all metrics have required properties', () => {
      const metrics = wrapper.findAllComponents(CardMetric);

      metrics.forEach((metric) => {
        const props = metric.props();
        expect(props).toHaveProperty('title');
        expect(props).toHaveProperty('value');
        expect(props).toHaveProperty('percentage');
        expect(props).toHaveProperty('tooltipInfo');
      });
    });
  });
});
