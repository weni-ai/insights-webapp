import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseChart from '../BaseChart.vue';
import { Chart as ChartJS } from 'chart.js';

vi.mock('chart.js', () => {
  const Chart = vi.fn();
  Chart.register = vi.fn();
  Chart.defaults = {
    font: {
      family: '',
    },
  };
  return {
    Chart,
    Title: vi.fn(),
    Legend: vi.fn(),
    BarElement: vi.fn(),
    LineElement: vi.fn(),
    PointElement: vi.fn(),
    ArcElement: vi.fn(),
    CategoryScale: vi.fn(),
    LinearScale: vi.fn(),
    RadialLinearScale: vi.fn(),
    LineController: vi.fn(),
    BarController: vi.fn(),
    Filler: vi.fn(),
  };
});

const defaultProps = {
  data: {
    labels: ['Label 1', 'Label 2'],
    datasets: [{ data: [1, 2] }],
  },
};

const createWrapper = (props = {}) => {
  return mount(BaseChart, {
    props: {
      ...defaultProps,
      ...props,
    },
  });
};

describe('BaseChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should match the snapshot', () => {
    const wrapper = mount(BaseChart);
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('Props Validation', () => {
    it('should validate chart type prop', () => {
      const validTypes = [
        'bar',
        'line',
        'pie',
        'doughnut',
        'radar',
        'polarArea',
        'bubble',
        'scatter',
        'funnel',
      ];

      validTypes.forEach((type) => {
        expect(() => createWrapper({ type })).not.toThrow();
      });
    });

    it('should have default props values', () => {
      const wrapper = createWrapper();

      expect(wrapper.props('type')).toBe('bar');
      expect(wrapper.props('options')).toEqual({});
      expect(wrapper.props('style')).toEqual({});
      expect(wrapper.props('plugins')).toEqual([]);
    });
  });

  describe('Computed Properties', () => {
    it('should merge default options with provided options', () => {
      const customOptions = {
        responsive: false,
        scales: {
          x: {
            grid: {
              display: true,
            },
          },
        },
      };

      createWrapper({
        options: customOptions,
      });

      const chartOptions = ChartJS.mock.calls.at(-1)[1].options;
      expect(chartOptions.responsive).toBe(false);
      expect(chartOptions.maintainAspectRatio).toBe(false);
      expect(chartOptions.scales.x.grid.display).toBe(true);
      expect(chartOptions.scales.y.display).toBe(false);
    });

    it('should merge chart styles with default styles', () => {
      const customStyle = {
        width: '100px',
        height: '100px',
      };

      const wrapper = createWrapper({
        style: customStyle,
      });

      expect(wrapper.find('canvas').attributes('style')).toContain(
        'width: 100px',
      );
      expect(wrapper.find('canvas').attributes('style')).toContain(
        'height: 100px',
      );
    });
  });

  describe('Chart Initialization', () => {
    it('should register Chart.js plugins on creation', () => {
      const customPlugins = [vi.fn(), vi.fn()];
      createWrapper({ plugins: customPlugins });

      expect(ChartJS.register).toHaveBeenCalled();
      const registerCall = ChartJS.register.mock.calls[0];
      expect(registerCall).toHaveLength(14); // 12 default plugins + 2 custom plugins
    });

    it('should set Chart.js default font family', () => {
      createWrapper();
      expect(ChartJS.defaults.font.family).toBe('Inter, sans-serif');
    });

    it('should initialize Chart.js with correct config on mount', () => {
      const wrapper = createWrapper({
        type: 'line',
        data: { labels: ['A'], datasets: [{ data: [1] }] },
      });

      expect(ChartJS).toHaveBeenCalledWith(wrapper.find('canvas').element, {
        type: 'line',
        data: wrapper.props('data'),
        options: expect.any(Object),
      });
    });
  });

  describe('DOM Structure', () => {
    it('should render canvas element with correct ref', () => {
      const wrapper = createWrapper();
      const canvas = wrapper.find('canvas');

      expect(canvas.exists()).toBe(true);
      expect(ChartJS.mock.calls.at(-1)[0]).toBe(canvas.element);
    });

    it('should apply style bindings to canvas', () => {
      const customStyle = {
        width: '200px',
        height: '150px',
      };

      const wrapper = createWrapper({
        style: customStyle,
      });

      const canvas = wrapper.find('canvas');
      expect(canvas.attributes('style')).toBe('width: 200px; height: 150px;');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data object', () => {
      expect(() =>
        createWrapper({
          data: { labels: [], datasets: [] },
        }),
      ).not.toThrow();
    });

    it('should handle all valid chart types', () => {
      const validTypes = [
        'bar',
        'line',
        'pie',
        'doughnut',
        'radar',
        'polarArea',
        'bubble',
        'scatter',
        'funnel',
      ];

      validTypes.forEach((type) => {
        expect(() => createWrapper({ type })).not.toThrow();
      });
    });

    it('should handle complex nested options merging', () => {
      const complexOptions = {
        scales: {
          x: {
            grid: {
              display: true,
              color: '#fff',
            },
            ticks: {
              padding: 5,
              callback: (value) => `$${value}`,
            },
          },
          y: {
            display: true,
            position: 'right',
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
      };

      createWrapper({
        options: complexOptions,
      });

      const chartOptions = ChartJS.mock.calls.at(-1)[1].options;
      expect(chartOptions.scales.x.grid.display).toBe(true);
      expect(chartOptions.scales.x.grid.color).toBe('#fff');
      expect(chartOptions.scales.x.ticks.padding).toBe(5);
      expect(chartOptions.scales.y.display).toBe(true);
      expect(chartOptions.scales.y.position).toBe('right');
      expect(chartOptions.plugins.legend.display).toBe(true);
      expect(chartOptions.plugins.legend.position).toBe('top');
    });
  });
});
