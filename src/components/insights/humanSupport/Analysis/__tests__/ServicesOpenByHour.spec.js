import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createTestingPinia } from '@pinia/testing';
import ServicesOpenByHour from '../ServicesOpenByHour.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: {} },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

const mockData = [
  { label: '08:00', value: 10 },
  { label: '09:00', value: 15 },
];

describe('ServicesOpenByHour', () => {
  let wrapper;
  let store;

  const createWrapper = (initialState = {}) => {
    store = createTestingPinia({
      initialState: {
        humanSupportAnalysis: {
          servicesOpenByHourData: mockData,
          loadingHumanSupportByHourData: false,
          ...initialState,
        },
      },
    });

    return mount(ServicesOpenByHour, {
      global: {
        plugins: [store],
        stubs: {
          LineChart: true,
        },
      },
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Component Structure', () => {
    it('should render main section with correct testid', () => {
      const section = wrapper.find('[data-testid="services-open-by-hour"]');
      expect(section.exists()).toBe(true);
      expect(section.classes()).toContain('services-open-by-hour');
    });

    it('should render LineChart component', () => {
      const chart = wrapper.findComponent({ name: 'LineChart' });
      expect(chart.exists()).toBe(true);
      expect(chart.attributes('data-testid')).toBe(
        'services-open-by-hour-chart',
      );
    });
  });

  describe('Data Loading', () => {
    it('should pass loading state to LineChart', () => {
      wrapper = createWrapper({ loadingHumanSupportByHourData: true });
      const chart = wrapper.findComponent({ name: 'LineChart' });
      expect(chart.props('isLoading')).toBe(true);
    });

    it('should not be loading initially', () => {
      const chart = wrapper.findComponent({ name: 'LineChart' });
      expect(chart.props('isLoading')).toBe(false);
    });
  });

  describe('Chart Data Formatting', () => {
    it('should format data correctly for LineChart', () => {
      const chart = wrapper.findComponent({ name: 'LineChart' });
      const chartData = chart.props('chartData');

      expect(chartData.labels).toEqual(['08:00', '09:00']);
      expect(chartData.datasets[0].data).toEqual([10, 15]);
    });

    it('should handle empty data', () => {
      wrapper = createWrapper({ servicesOpenByHourData: [] });
      const chart = wrapper.findComponent({ name: 'LineChart' });
      const chartData = chart.props('chartData');

      expect(chartData.labels).toEqual([]);
      expect(chartData.datasets[0].data).toEqual([]);
    });

    it('should handle null values in data', () => {
      wrapper = createWrapper({
        servicesOpenByHourData: [{ label: null, value: null }],
      });
      const chart = wrapper.findComponent({ name: 'LineChart' });
      const chartData = chart.props('chartData');

      expect(chartData.labels).toEqual([null]);
      expect(chartData.datasets[0].data).toEqual([null]);
    });
  });

  describe('Chart Props', () => {
    it('should pass seeMore as false', () => {
      const chart = wrapper.findComponent({ name: 'LineChart' });
      expect(chart.props('seeMore')).toBe(false);
    });

    it('should pass correct title prop', () => {
      const chart = wrapper.findComponent({ name: 'LineChart' });
      expect(chart.props('title')).toBeDefined();
    });
  });
});
