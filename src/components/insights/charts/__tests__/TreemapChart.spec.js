import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import TreemapChart from '../TreemapChart.vue';
import { Chart as ChartJS, LinearScale, Tooltip } from 'chart.js';
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap';
import en from '@/locales/en.json';
import { addColors, prepareTopData } from '@/utils/treemap';

config.global.plugins = [
  createI18n({
    legacy: false,
  }),
];

// Mock Chart.js and treemap dependencies
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
    LinearScale: vi.fn(),
    Tooltip: vi.fn(),
  };
});

vi.mock('chartjs-chart-treemap', () => ({
  TreemapController: vi.fn(),
  TreemapElement: vi.fn(),
}));

// Mock treemap utilities
vi.mock('@/utils/treemap', () => ({
  addColors: vi.fn((data) =>
    data.map((item, index) => ({
      ...item,
      color: `#color-${index}`,
      hoverColor: `#hover-${index}`,
    })),
  ),
  prepareTopData: vi.fn((data) => data.slice(0, 5)),
  TreemapDataItem: {},
}));

// Mock i18n
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en },
  fallbackWarn: false,
  missingWarn: false,
});

const mockData = [
  {
    label: 'Entrega atrasada',
    value: 6973,
    percentage: 29,
  },
  {
    label: 'Produto defeituoso',
    value: 5500,
    percentage: 23,
  },
  {
    label: 'Dúvidas sobre preço',
    value: 1600,
    percentage: 16,
  },
  {
    label: 'Cancelamento',
    value: 1400,
    percentage: 14,
  },
  {
    label: 'Unclassified',
    value: 1000,
    percentage: 13,
  },
];

const createWrapper = (props = {}) => {
  return mount(TreemapChart, {
    props: {
      data: mockData,
      ...props,
    },
    global: {
      plugins: [i18n],
    },
  });
};

describe('TreemapChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset Chart.js constructor mock
    ChartJS.mockClear && ChartJS.mockClear();
  });

  describe('Component Rendering', () => {
    it('should render the component structure', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="treemap-chart"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="treemap-canvas"]').exists()).toBe(
        true,
      );
    });

    it('should set canvas height to 100%', () => {
      const wrapper = createWrapper();
      const canvas = wrapper.find('[data-testid="treemap-canvas"]');

      expect(canvas.attributes('height')).toBe('100%');
    });
  });

  describe('Chart Initialization', () => {
    it('should register Chart.js plugins on creation', () => {
      createWrapper();

      expect(ChartJS.register).toHaveBeenCalledWith(
        TreemapController,
        TreemapElement,
        LinearScale,
        Tooltip,
      );
    });

    it('should set Chart.js default font family', () => {
      createWrapper();
      expect(ChartJS.defaults.font.family).toBe('Lato, sans-serif');
    });

    it('should initialize Chart.js with correct config on mount', async () => {
      const wrapper = createWrapper();
      await wrapper.vm.$nextTick();

      expect(ChartJS).toHaveBeenCalledWith(
        wrapper.vm.$refs.treemapCanvas,
        expect.objectContaining({
          type: 'treemap',
          data: expect.objectContaining({
            datasets: expect.any(Array),
          }),
          options: expect.any(Object),
        }),
      );
    });
  });

  describe('Data Processing', () => {
    it('should handle data transformation correctly', async () => {
      createWrapper();

      expect(prepareTopData).toHaveBeenCalledWith(mockData);
      expect(addColors).toHaveBeenCalledWith(prepareTopData(mockData));
    });
  });

  describe('Chart Configuration', () => {
    let chartConfig;

    beforeEach(async () => {
      const wrapper = createWrapper();
      await wrapper.vm.$nextTick();

      if (ChartJS.mock.calls.length > 0) {
        chartConfig = ChartJS.mock.calls[0][1];
      }
    });

    it('should configure treemap dataset correctly', () => {
      expect(chartConfig?.data?.datasets?.[0]).toMatchObject({
        key: 'value',
        borderWidth: 0,
        borderRadius: 8,
        spacing: 4,
      });
    });

    it('should set responsive options', () => {
      expect(chartConfig?.options?.responsive).toBe(true);
      expect(chartConfig?.options?.maintainAspectRatio).toBe(false);
    });

    it('should configure legend to be hidden', () => {
      expect(chartConfig?.options?.plugins?.legend?.display).toBe(false);
    });

    it('should disable datalabels plugin', () => {
      expect(chartConfig?.options?.plugins?.datalabels?.display).toBe(false);
    });

    it('should configure tooltip properly', () => {
      const tooltipConfig = chartConfig?.options?.plugins?.tooltip;

      expect(tooltipConfig?.enabled).toBe(true);
      expect(tooltipConfig?.backgroundColor).toBe('#272B33');
      expect(tooltipConfig?.displayColors).toBe(false);
      expect(tooltipConfig?.position).toBe('nearest');
      expect(tooltipConfig?.intersect).toBe(true);
      expect(tooltipConfig?.mode).toBe('index');
    });
  });

  describe('Event Handling', () => {
    it('should emit click event when chart is clicked', async () => {
      const wrapper = createWrapper();
      await wrapper.vm.$nextTick();

      const chartConfig = ChartJS.mock.calls[0][1];
      const mockClickData = {
        raw: {
          _data: {
            label: 'Test',
            value: 100,
            percentage: 50,
          },
        },
      };

      // Simulate click event
      chartConfig.options.onClick(null, [
        { element: { $context: mockClickData } },
      ]);

      expect(wrapper.emitted('click')).toBeTruthy();
      expect(wrapper.emitted('click')[0][0]).toEqual(mockClickData.raw._data);
    });
  });

  describe('Tooltip Callbacks', () => {
    let tooltipCallbacks;

    beforeEach(async () => {
      const wrapper = createWrapper();
      await wrapper.vm.$nextTick();

      const chartConfig = ChartJS.mock.calls[0][1];
      tooltipCallbacks = chartConfig?.options?.plugins?.tooltip?.callbacks;
    });

    it('should format tooltip title correctly', () => {
      const mockContext = [
        {
          raw: {
            _data: {
              label: 'Test Label',
              percentage: 25,
            },
          },
        },
      ];

      const result = tooltipCallbacks?.title(mockContext);
      expect(result).toBe('Test Label (25%)');
    });

    it('should format tooltip label correctly', () => {
      const mockContext = {
        raw: {
          _data: {
            value: 150,
          },
        },
      };

      const result = tooltipCallbacks?.label(mockContext);
      expect(result).toContain('150');
      expect(result).toContain('conversations');
    });
  });

  describe('Labels Configuration', () => {
    let labelsConfig;

    beforeEach(async () => {
      const wrapper = createWrapper();
      await wrapper.vm.$nextTick();

      const chartConfig = ChartJS.mock.calls[0][1];
      labelsConfig = chartConfig?.data?.datasets?.[0]?.labels;
    });

    it('should configure labels display and alignment', () => {
      expect(labelsConfig?.display).toBe(true);
      expect(labelsConfig?.align).toBe('left');
      expect(labelsConfig?.overflow).toBe('hidden');
      expect(labelsConfig?.position).toBe('middle');
    });

    it('should format labels correctly', () => {
      const mockContext = {
        type: 'data',
        raw: {
          _data: {
            label: 'Test',
            percentage: 30,
            value: 200,
          },
        },
      };

      const result = labelsConfig?.formatter(mockContext);

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toContain('Test (30%)');
      expect(result[1]).toContain('200');
      expect(result[1]).toContain('conversations');
    });

    it('should not format labels for non-data contexts', () => {
      const mockContext = { type: 'other' };
      const result = labelsConfig?.formatter(mockContext);
      expect(result).toBeUndefined();
    });

    it('should configure font styles correctly', () => {
      expect(labelsConfig?.font).toHaveLength(2);
      expect(labelsConfig?.font[0]).toMatchObject({
        size: 16,
        family: 'Lato, sans-serif',
        lineHeight: '26px',
        weight: 'bold',
      });
      expect(labelsConfig?.font[1]).toMatchObject({
        size: 14,
        family: 'Lato, sans-serif',
        lineHeight: '24px',
      });
    });
  });

  describe('Captions Configuration', () => {
    let captionsConfig;

    beforeEach(async () => {
      const wrapper = createWrapper();
      await wrapper.vm.$nextTick();

      const chartConfig = ChartJS.mock.calls[0][1];
      captionsConfig = chartConfig?.data?.datasets?.[0]?.captions;
    });

    it('should configure captions display and alignment', () => {
      expect(captionsConfig?.display).toBe(true);
      expect(captionsConfig?.align).toBe('center');
    });

    it('should format captions correctly', () => {
      const mockContext = {
        type: 'data',
        raw: { v: 250 },
      };

      const result = captionsConfig?.formatter(mockContext);
      expect(result).toContain('250');
      expect(result).toContain('conversations');
    });

    it('should not format captions for non-data contexts', () => {
      const mockContext = { type: 'other' };
      const result = captionsConfig?.formatter(mockContext);
      expect(result).toBeUndefined();
    });
  });
});
