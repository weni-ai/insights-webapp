import { mount, config } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardCommerce from '@/views/insights/DashboardCommerce.vue';
import CardMetric from '@/components/home/CardMetric.vue';
import DropdownFilter from '@/components/home/DropdownFilter.vue';
import { createI18n } from 'vue-i18n';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      'filter-by': 'Filter by',
    },
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
const mockGetLastNDays = vi.fn(() => ({
  start: '2024-01-01',
  end: '2024-01-07',
}));
const mockGetLastMonthRange = vi.fn(() => ({
  start: '2024-01-01',
  end: '2024-01-31',
}));

vi.mock('@/utils/time', () => ({
  getTodayDate: () => mockGetTodayDate(),
  getLastNDays: () => mockGetLastNDays(),
  getLastMonthRange: () => mockGetLastMonthRange(),
}));

describe('DashboardCommerce', () => {
  let wrapper;
  const consoleSpy = vi.spyOn(console, 'log');

  beforeEach(() => {
    wrapper = mount(DashboardCommerce, {
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
      expect(headerTitle.text()).toBe("See what's happening in: Commerce");
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

  describe('metrics rendering', () => {
    it('renders all metrics correctly', () => {
      const metrics = wrapper.findAllComponents(CardMetric);
      expect(metrics).toHaveLength(6);
    });

    it('passes correct props to CardMetric components', () => {
      const firstMetric = wrapper.findComponent(CardMetric);
      expect(firstMetric.props()).toMatchObject({
        title: 'Sent messages',
        value: 1325,
        percentage: 5.08,
        hasInfo: true,
        leftColumn: true,
        rightColumn: false,
        middleColumn: false,
        firstRow: true,
      });
    });

    it('calculates column positions correctly', () => {
      const metrics = wrapper.findAllComponents(CardMetric);

      expect(metrics[0].props('leftColumn')).toBe(true);
      expect(metrics[0].props('middleColumn')).toBe(false);
      expect(metrics[0].props('rightColumn')).toBe(false);

      expect(metrics[1].props('leftColumn')).toBe(false);
      expect(metrics[1].props('middleColumn')).toBe(true);
      expect(metrics[1].props('rightColumn')).toBe(false);

      expect(metrics[2].props('leftColumn')).toBe(false);
      expect(metrics[2].props('middleColumn')).toBe(false);
      expect(metrics[2].props('rightColumn')).toBe(true);
    });

    it('calculates row positions correctly', () => {
      const metrics = wrapper.findAllComponents(CardMetric);

      expect(metrics[0].props('firstRow')).toBe(true);
      expect(metrics[1].props('firstRow')).toBe(true);
      expect(metrics[2].props('firstRow')).toBe(true);

      expect(metrics[3].props('lastRow')).toBe(true);
      expect(metrics[4].props('lastRow')).toBe(true);
      expect(metrics[5].props('lastRow')).toBe(true);
    });
  });

  describe('filter functionality', () => {
    it('initializes with correct default filter', () => {
      const dropdownFilter = wrapper.findComponent(DropdownFilter);
      expect(dropdownFilter.props('defaultItem')).toEqual({
        name: 'Last 7 days',
      });
    });

    it('provides all required filter options', () => {
      const dropdownFilter = wrapper.findComponent(DropdownFilter);
      const filterItems = dropdownFilter.props('items');

      const expectedOptions = [
        'today',
        'Last 7 days',
        'Last week',
        'Last month',
      ];

      const filterNames = filterItems.map((item) => item.name);
      expect(filterNames).toEqual(expectedOptions);
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
        expect(props).toHaveProperty('hasInfo');
      });
    });

    it('correctly handles prefix property', () => {
      const metrics = wrapper.findAllComponents(CardMetric);
      const utmMetric = metrics.find(
        (metric) => metric.props('title') === 'UTM revenue',
      );

      expect(utmMetric.props('prefix')).toBe('R$');
    });

    it('handles zero percentage correctly', () => {
      const metrics = wrapper.findAllComponents(CardMetric);
      const ordersMetric = metrics.find(
        (metric) => metric.props('title') === 'Orders placed',
      );

      expect(ordersMetric.props('percentage')).toBe(0);
    });
  });
});
