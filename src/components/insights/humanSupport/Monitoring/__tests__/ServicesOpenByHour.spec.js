import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import ServicesOpenByHour from '../ServicesOpenByHour.vue';

const mockMonitoringStore = {
  loadHumanSupportByHourData: vi.fn(),
  servicesOpenByHourData: {
    value: [
      { label: '00:00', value: 15 },
      { label: '01:00', value: 8 },
      { label: '02:00', value: 5 },
      { label: '08:00', value: 45 },
      { label: '14:00', value: 78 },
      { label: '20:00', value: 32 },
    ],
  },
  loadingHumanSupportByHourData: { value: false },
};

vi.mock('@/store/modules/humanSupport/monitoring', () => ({
  useHumanSupportMonitoring: () => mockMonitoringStore,
}));

vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    storeToRefs: (store) => store,
  };
});

global.console = {
  ...console,
  log: vi.fn(),
};

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      human_support_dashboard: {
        services_open_by_hour: {
          title: 'Services Open by Hour',
        },
      },
    },
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

describe('ServicesOpenByHour', () => {
  let wrapper;

  const createWrapper = (storeOverrides = {}) => {
    Object.assign(mockMonitoringStore, storeOverrides);
    return mount(ServicesOpenByHour, {
      global: {
        stubs: {
          LineChart: true,
        },
      },
    });
  };

  const section = () => wrapper.find('[data-testid="services-open-by-hour"]');
  const chart = () =>
    wrapper.find('[data-testid="services-open-by-hour-chart"]');

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mockMonitoringStore, {
      loadHumanSupportByHourData: vi.fn(),
      servicesOpenByHourData: {
        value: [
          { label: '00:00', value: 15 },
          { label: '01:00', value: 8 },
          { label: '02:00', value: 5 },
          { label: '08:00', value: 45 },
          { label: '14:00', value: 78 },
          { label: '20:00', value: 32 },
        ],
      },
      loadingHumanSupportByHourData: { value: false },
    });
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('should render main section', () => {
      expect(section().exists()).toBe(true);
    });

    it('should render LineChart component', () => {
      expect(chart().exists()).toBe(true);
    });

    it('should have correct CSS classes', () => {
      expect(section().classes()).toContain('services-open-by-hour');
    });

    it('should match snapshot', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('Data loading and store integration', () => {
    it('should call loadHumanSupportByHourData on mount', () => {
      expect(mockMonitoringStore.loadHumanSupportByHourData).toHaveBeenCalled();
    });

    it('should compute loading state correctly', () => {
      const vm = wrapper.vm;
      expect(vm.isLoading).toBe(false);

      wrapper = createWrapper({
        loadingHumanSupportByHourData: { value: true },
      });
      expect(wrapper.vm.isLoading).toBe(true);
    });
  });

  describe('Chart data formatting', () => {
    it('should format chart data correctly', () => {
      const vm = wrapper.vm;
      const expectedData = {
        labels: ['00:00', '01:00', '02:00', '08:00', '14:00', '20:00'],
        datasets: [
          {
            data: [15, 8, 5, 45, 78, 32],
          },
        ],
      };

      expect(vm.data).toEqual(expectedData);
    });

    const dataTestCases = [
      {
        name: 'empty data',
        input: [],
        expected: { labels: [], datasets: [{ data: [] }] },
      },
      {
        name: 'single data point',
        input: [{ label: '12:00', value: 50 }],
        expected: { labels: ['12:00'], datasets: [{ data: [50] }] },
      },
      {
        name: 'data with zero values',
        input: [
          { label: '00:00', value: 0 },
          { label: '01:00', value: 10 },
        ],
        expected: { labels: ['00:00', '01:00'], datasets: [{ data: [0, 10] }] },
      },
    ];

    dataTestCases.forEach(({ name, input, expected }) => {
      it(`should handle ${name}`, () => {
        wrapper = createWrapper({
          servicesOpenByHourData: { value: input },
        });

        expect(wrapper.vm.data).toEqual(expected);
      });
    });
  });

  describe('LineChart integration', () => {
    it('should pass correct props to LineChart', () => {
      const chartComponent = wrapper.findComponent({ name: 'LineChart' });

      expect(chartComponent.props('title')).toBe('Services Open by Hour');
      expect(chartComponent.props('seeMore')).toBe(false);
      expect(chartComponent.props('isLoading')).toBe(false);
      expect(chartComponent.props('chartData')).toEqual({
        labels: ['00:00', '01:00', '02:00', '08:00', '14:00', '20:00'],
        datasets: [{ data: [15, 8, 5, 45, 78, 32] }],
      });
    });

    it('should pass loading state to LineChart', () => {
      wrapper = createWrapper({
        loadingHumanSupportByHourData: { value: true },
      });

      const chartComponent = wrapper.findComponent({ name: 'LineChart' });
      expect(chartComponent.props('isLoading')).toBe(true);
    });
  });

  describe('Error scenarios and edge cases', () => {
    it('should handle malformed data gracefully', () => {
      const malformedData = [
        { label: null, value: 15 },
        { label: '01:00', value: null },
        { value: 20 },
        { label: '03:00' },
      ];

      wrapper = createWrapper({
        servicesOpenByHourData: { value: malformedData },
      });

      expect(() => wrapper.vm.data).not.toThrow();
      expect(wrapper.vm.data.labels).toEqual([
        null,
        '01:00',
        undefined,
        '03:00',
      ]);
      expect(wrapper.vm.data.datasets[0].data).toEqual([
        15,
        null,
        20,
        undefined,
      ]);
    });
  });

  describe('Computed properties reactivity', () => {
    it('should have reactive data computed property', () => {
      const vm = wrapper.vm;

      expect(vm.data).toHaveProperty('labels');
      expect(vm.data).toHaveProperty('datasets');
      expect(Array.isArray(vm.data.labels)).toBe(true);
      expect(Array.isArray(vm.data.datasets)).toBe(true);
    });

    it('should have reactive loading computed property', () => {
      const vm = wrapper.vm;
      expect(typeof vm.isLoading).toBe('boolean');
      expect(vm.isLoading).toBe(false);

      wrapper = createWrapper({
        loadingHumanSupportByHourData: { value: true },
      });
      expect(wrapper.vm.isLoading).toBe(true);
    });
  });

  describe('Large datasets handling', () => {
    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 24 }, (_, i) => ({
        label: `${i.toString().padStart(2, '0')}:00`,
        value: Math.floor(Math.random() * 100),
      }));

      wrapper = createWrapper({
        servicesOpenByHourData: { value: largeDataset },
      });

      expect(wrapper.vm.data.labels).toHaveLength(24);
      expect(wrapper.vm.data.datasets[0].data).toHaveLength(24);
      expect(() => wrapper.vm.data).not.toThrow();
    });
  });
});
