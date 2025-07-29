import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createI18n } from 'vue-i18n';

import TreemapChart from '../TreemapChart.vue';

config.global.plugins = [
  createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        widgets: {
          treemap: {
            no_data: 'No data available',
          },
        },
        conversations_dashboard: {
          conversations: 'conversations',
        },
      },
    },
  }),
];

vi.mock('chart.js', () => {
  const Chart = vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
  }));
  Chart.defaults = {
    font: { family: 'Lato, sans-serif' },
  };
  Chart.register = vi.fn();

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

vi.mock('@/utils/treemap', () => ({
  prepareTopData: vi.fn((data) => data),
  addColors: vi.fn((data) => data.map((item) => ({ ...item, color: '#000' }))),
}));

vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: {
      t: vi.fn((key) => key),
    },
  },
}));

const mockData = [{ label: 'Topic 1', value: 100, percentage: 50, uuid: '1' }];

describe('TreemapChart', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = shallowMount(TreemapChart, {
      props: {
        data: [],
        isLoading: false,
      },
      global: {
        stubs: {
          UnnnicSkeletonLoading: true,
        },
      },
    });
  });

  it('should show loading when isLoading is true', async () => {
    await wrapper.setProps({ isLoading: true });

    expect(wrapper.find('[data-testid="treemap-chart-loading"]').exists()).toBe(
      true,
    );
    expect(wrapper.find('[data-testid="treemap-chart-no-data"]').exists()).toBe(
      false,
    );
    expect(wrapper.find('[data-testid="treemap-canvas"]').exists()).toBe(false);
  });

  it('should show no data message when data is empty', () => {
    expect(wrapper.find('[data-testid="treemap-chart-no-data"]').exists()).toBe(
      true,
    );
    expect(wrapper.find('[data-testid="treemap-chart-loading"]').exists()).toBe(
      false,
    );
    expect(wrapper.find('[data-testid="treemap-canvas"]').exists()).toBe(false);
  });

  it('should show canvas when data is provided', async () => {
    await wrapper.setProps({ data: mockData });

    expect(wrapper.find('[data-testid="treemap-canvas"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="treemap-chart-loading"]').exists()).toBe(
      false,
    );
    expect(wrapper.find('[data-testid="treemap-chart-no-data"]').exists()).toBe(
      false,
    );
  });

  it('should handle data prop changes', async () => {
    const { Chart } = await import('chart.js');

    await wrapper.setProps({ data: mockData });
    await nextTick();

    expect(Chart).toHaveBeenCalled();

    await wrapper.setProps({
      data: [
        ...mockData,
        { label: 'Topic 2', value: 50, percentage: 25, uuid: '2' },
      ],
    });
    await nextTick();

    expect(Chart).toHaveBeenCalledTimes(2);
  });

  it('should handle click events', async () => {
    const { Chart } = await import('chart.js');

    await wrapper.setProps({ data: mockData });
    await nextTick();

    const chartConfig = Chart.mock.calls[0][1];
    const mockClickData = { _data: mockData[0] };

    chartConfig.options.onClick(null, [
      { element: { $context: { raw: mockClickData } } },
    ]);

    expect(wrapper.emitted('click')).toBeTruthy();
    expect(wrapper.emitted('click')[0]).toEqual([mockData[0]]);
  });

  it('should handle empty click events', async () => {
    const { Chart } = await import('chart.js');

    await wrapper.setProps({ data: mockData });
    await nextTick();

    const chartConfig = Chart.mock.calls[0][1];

    chartConfig.options.onClick(null, []);

    expect(wrapper.emitted('click')).toBeFalsy();
  });

  it('should handle hover events', async () => {
    const { Chart } = await import('chart.js');

    await wrapper.setProps({ data: mockData });
    await nextTick();

    const chartConfig = Chart.mock.calls[0][1];
    const mockHoverEvent = {
      chart: {
        canvas: { style: {} },
      },
    };

    chartConfig.options.onHover(mockHoverEvent);

    expect(mockHoverEvent.chart.canvas.style.cursor).toBe('pointer');
  });

  it('should handle empty hover events', async () => {
    const { Chart } = await import('chart.js');

    await wrapper.setProps({ data: mockData });
    await nextTick();

    const chartConfig = Chart.mock.calls[0][1];

    chartConfig.options.onHover({});

    expect(true).toBe(true);
  });

  it('should handle chart callback functions', async () => {
    const { Chart } = await import('chart.js');

    await wrapper.setProps({ data: mockData });
    await nextTick();

    const chartConfig = Chart.mock.calls[0][1];
    const dataset = chartConfig.data.datasets[0];

    const bgColor = dataset.backgroundColor({
      type: 'data',
      raw: { _data: { color: '#ff0000' } },
    });
    expect(bgColor).toBe('#ff0000');

    const bgColorTransparent = dataset.backgroundColor({ type: 'not-data' });
    expect(bgColorTransparent).toBe('transparent');

    const hoverColor = dataset.hoverBackgroundColor({
      type: 'data',
      raw: { _data: { hoverColor: '#00ff00' } },
    });
    expect(hoverColor).toBe('#00ff00');

    const hoverColorTransparent = dataset.hoverBackgroundColor({
      type: 'not-data',
    });
    expect(hoverColorTransparent).toBe('transparent');

    const labelResult = dataset.labels.formatter({
      type: 'data',
      raw: { _data: { label: 'Test Topic', percentage: 50, value: 100 } },
    });
    expect(Array.isArray(labelResult)).toBe(true);

    const labelEmpty = dataset.labels.formatter({ type: 'not-data' });
    expect(labelEmpty).toBeUndefined();

    const captionResult = dataset.captions.formatter({
      type: 'data',
      raw: { v: 100 },
    });
    expect(typeof captionResult).toBe('string');

    const captionEmpty = dataset.captions.formatter({ type: 'not-data' });
    expect(captionEmpty).toBeUndefined();
  });

  it('should handle tooltip callbacks', async () => {
    const { Chart } = await import('chart.js');

    await wrapper.setProps({ data: mockData });
    await nextTick();

    const chartConfig = Chart.mock.calls[0][1];
    const tooltipCallbacks = chartConfig.options.plugins.tooltip.callbacks;

    const titleResult = tooltipCallbacks.title([
      { raw: { _data: { label: 'Test', percentage: 50 } } },
    ]);
    expect(titleResult).toContain('Test');
    expect(titleResult).toContain('50%');

    const labelResult = tooltipCallbacks.label({
      raw: { _data: { value: 100 } },
    });
    expect(labelResult).toContain('100');

    const caretPadding = chartConfig.options.plugins.tooltip.caretPadding({
      tooltipItems: [{ element: { height: 100 } }],
    });
    expect(caretPadding).toBe(50);
  });
});
