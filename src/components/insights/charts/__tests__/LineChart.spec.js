import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import LineChart from '../LineChart.vue';

const createWrapper = (props = {}) => {
  return mount(LineChart, {
    props: {
      title: 'Line Chart',
      seeMore: false,
      chartData: {
        labels: ['00:00', '01:00'],
        datasets: [{ data: [10, 20] }],
      },
      isLoading: false,
      ...props,
    },
    global: {
      stubs: {
        SkeletonLineChart: true,
        BaseChart: true,
      },
    },
  });
};

describe('LineChart', () => {
  let wrapper;

  beforeEach(async () => {
    wrapper = createWrapper();
    await flushPromises();
  });

  describe('Component Rendering', () => {
    it('should render chart title', async () => {
      const title = wrapper.find('[data-testid="chart-title"]');
      expect(title.text()).toBe(wrapper.vm.title);
    });

    it('should render see more link when seeMore prop is true', async () => {
      await wrapper.setProps({ seeMore: true });
      const seeMoreLink = wrapper.find('[data-testid="chart-see-more-link"]');
      expect(seeMoreLink.exists()).toBe(true);
    });

    it('should not render see more link when seeMore prop is false', async () => {
      const seeMoreLink = wrapper.find('[data-testid="chart-see-more-link"]');
      expect(seeMoreLink.exists()).toBe(false);
    });

    it('should emit seeMore event when see more link is clicked', async () => {
      await wrapper.setProps({ seeMore: true });
      const seeMoreLink = wrapper.find('[data-testid="chart-see-more-link"]');
      await seeMoreLink.trigger('click');
      expect(wrapper.emitted().seeMore).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should render skeleton loader when isLoading is true', async () => {
      await wrapper.setProps({ isLoading: true });
      const loading = wrapper.find('[data-testid="chart-loading"]');
      const chart = wrapper.find('[data-testid="line-chart"]');
      expect(loading.exists()).toBe(true);
      expect(chart.exists()).toBe(false);
    });

    it('should render chart when isLoading is false', async () => {
      const loading = wrapper.find('[data-testid="chart-loading"]');
      const chart = wrapper.find('[data-testid="line-chart"]');
      expect(loading.exists()).toBe(false);
      expect(chart.exists()).toBe(true);
    });
  });

  describe('Chart Configuration', () => {
    it('should merge default chart configuration with provided data', () => {
      const { mergedData } = wrapper.vm;
      expect(mergedData.datasets[0]).toHaveProperty('borderColor', '#00A49F');
      expect(mergedData.datasets[0]).toHaveProperty('pointRadius', 0);
      expect(mergedData.datasets[0]).toHaveProperty('hoverRadius', 3);
      expect(mergedData.datasets[0]).toHaveProperty('pointStyle', 'circle');
      expect(mergedData.datasets[0]).toHaveProperty('fill', true);
    });

    it('should have correct chart options configuration', () => {
      const { chartOptions } = wrapper.vm;
      expect(chartOptions.backgroundColor).toBe('#00A49F');
      expect(chartOptions.scales.y.beginAtZero).toBe(true);
      expect(chartOptions.interaction.intersect).toBe(false);
      expect(chartOptions.interaction.mode).toBe('index');
    });

    it('should configure tooltip properly', () => {
      const { chartOptions } = wrapper.vm;
      const tooltipConfig = chartOptions.plugins.tooltip;
      expect(tooltipConfig.enabled).toBe(true);
      expect(tooltipConfig.backgroundColor).toBe('#23262E'); // colorGray950
      expect(tooltipConfig.displayColors).toBe(false);
    });

    it('should format tooltip title and label correctly', () => {
      const { chartOptions } = wrapper.vm;
      const tooltipCallbacks = chartOptions.plugins.tooltip.callbacks;

      const mockTooltipItems = [{ label: '12:00' }];
      const mockTooltipItem = { raw: 42 };

      expect(tooltipCallbacks.title(mockTooltipItems)).toBe(
        `${wrapper.vm.$t('charts.hours')}: 12:00`,
      );
      expect(tooltipCallbacks.label(mockTooltipItem)).toBe(
        `${wrapper.vm.$t('charts.attendances')}: 42`,
      );
    });
  });

  describe('Chart Plugins', () => {
    it('should include required plugins', () => {
      const { chartPlugins } = wrapper.vm;
      expect(chartPlugins).toHaveLength(2);
    });
  });

  describe('Background Gradient', () => {
    it('should return null when chartArea is not available', () => {
      const { mergedData } = wrapper.vm;
      const context = {
        chart: {
          ctx: {},
          chartArea: null,
        },
      };
      const result = mergedData.datasets[0].backgroundColor(context);
      expect(result).toBeNull();
    });

    it('should create gradient when chartArea is available', () => {
      const mockCreateLinearGradient = vi.fn().mockReturnValue({
        addColorStop: vi.fn(),
      });

      const context = {
        chart: {
          ctx: {
            createLinearGradient: mockCreateLinearGradient,
          },
          chartArea: {
            top: 0,
            bottom: 100,
          },
        },
      };

      const { mergedData } = wrapper.vm;
      mergedData.datasets[0].backgroundColor(context);

      expect(mockCreateLinearGradient).toHaveBeenCalledWith(0, 0, 0, 100);
    });
  });

  describe('Element Size', () => {
    it('should set up element size refs', () => {
      expect(wrapper.vm.chartWidth).toBeDefined();
      expect(wrapper.vm.chartHeight).toBeDefined();
    });
  });
});
