import { beforeEach, describe, expect, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';

import HorizontalBarChart from '../HorizontalBarChart.vue';

const createWraper = (props = {}) => {
  return mount(HorizontalBarChart, {
    props: {
      title: 'HorizontalBarChart',
      seeMore: false,
      chartData: {
        labels: ['January', 'February'],
        datasets: [{ data: [10, 20] }],
      },
      isLoading: false,
      ...props,
    },
    global: {
      stubs: {
        SkeletonHorizontalBarChart: true,
      },
    },
  });
};

describe('HorizontalBarChart', () => {
  let wrapper;
  const mockCtx = {
    beginPath: vi.fn(),
    fillStyle: '',
    roundRect: vi.fn(),
    fill: vi.fn(),
    save: vi.fn(),
    textBaseline: '',
    font: '',
    fillText: vi.fn(),
    restore: vi.fn(),
  };
  beforeEach(async () => {
    wrapper = createWraper();
    await flushPromises();
  });

  it('should render chart title', async () => {
    const title = wrapper.find('[data-testid="chart-title"]');
    expect(title.text()).eq(wrapper.vm.title);
  });

  it('should render see more text and emit seeMore on click if seeMore prop is true', async () => {
    await wrapper.setProps({ seeMore: true });
    const seeMoreLink = wrapper.find('[data-testid="chart-see-more-link"]');
    expect(seeMoreLink.exists()).toBe(true);
    await seeMoreLink.trigger('click');
    expect(wrapper.emitted().seeMore).toBeTruthy();
  });

  it('should render chart loading if isLoading prop is true', async () => {
    await wrapper.setProps({ isLoading: true });
    const loading = wrapper.find('[data-testid="chart-loading"]');
    expect(loading.exists()).toBe(true);
    const chart = wrapper.find('[data-testid="chart-bar"]');
    expect(chart.exists()).toBe(false);
  });

  it('should render chart', async () => {
    const loading = wrapper.find('[data-testid="chart-loading"]');
    expect(loading.exists()).toBe(false);
    const chart = wrapper.find('[data-testid="chart-bar"]');
    expect(chart.exists()).toBe(true);
  });

  it('should shorten y-axis tick labels longer than 15 characters', async () => {
    await wrapper.setProps({
      chartData: {
        labels: [
          'Short label',
          'This is a long label that should be truncated',
        ],
        datasets: [{ data: [10, 20] }],
      },
    });

    const { chartOptions } = wrapper.vm;

    const callback = chartOptions.scales.y.ticks.callback;

    expect(callback(null, 0)).toBe('Short label');

    expect(callback(null, 1)).toBe('This is a long ...');
  });

  it('should return false from tooltip label callback', async () => {
    const { chartOptions } = wrapper.vm;

    const tooltipCallback = chartOptions.plugins.tooltip.callbacks.label;

    expect(tooltipCallback()).toBe(false);
  });

  it('should change cursor to pointer when hovering over a bar', async () => {
    await wrapper.vm.$nextTick();

    const canvas = wrapper.find('[data-testid="chart-bar"]');

    wrapper.vm.chartOptions.onHover({ native: { target: canvas.element } }, []);

    expect(canvas.element.style.cursor).toBe('default');

    wrapper.vm.chartOptions.onHover({ native: { target: canvas.element } }, [
      { datasetIndex: 0, index: 0 },
    ]);
    expect(canvas.element.style.cursor).toBe('pointer');
  });

  it('should emit clickData when clicking on a bar', async () => {
    await wrapper.vm.$nextTick();

    const canvas = wrapper.find('canvas');

    wrapper.vm.chartOptions.onClick({ native: { target: canvas.element } }, []);
    expect(wrapper.emitted('clickData')).toBeFalsy();

    wrapper.vm.chartOptions.onClick({ native: { target: canvas.element } }, [
      { datasetIndex: 0, index: 0 },
    ]);

    expect(wrapper.emitted('clickData')).toBeTruthy();
    expect(wrapper.emitted('clickData')[0][0]).toEqual({
      label: 'January',
      data: 10,
      datasetIndex: 0,
      dataIndex: 0,
    });
  });

  it('should draw labels correctly using doubleDataLabel plugin', async () => {
    const chartData = {
      labels: ['Item 1', 'Item 2'],
      datasets: [
        {
          data: [75, 25],
          fullValues: [75, 25],
        },
      ],
    };

    const wrapper = mount(HorizontalBarChart, {
      props: { chartData, datalabelsSuffix: '%' },
    });

    const mockChart = {
      ctx: mockCtx,
      data: { datasets: chartData.datasets },
      chartArea: { width: 300, left: 0 },
      getDatasetMeta: () => ({
        data: [{ y: 50 }, { y: 100 }],
      }),
    };

    wrapper.vm.doubleDataLabel.afterDatasetsDraw(
      mockChart,
      {},
      { datalabelsSuffix: '%' },
    );

    expect(mockCtx.fillText).toHaveBeenCalledTimes(4);

    expect(mockCtx.fillText).toHaveBeenCalledWith('75 %', 304, 50);
    expect(mockCtx.fillText).toHaveBeenCalledWith('| 75', 342, 50);

    expect(mockCtx.fillText).toHaveBeenCalledWith('25 %', 304, 100);
    expect(mockCtx.fillText).toHaveBeenCalledWith('| 25', 342, 100);
  });

  it('should draw background rectangles correctly using horizontalBackgroundColorPlugin', async () => {
    const chartData = {
      labels: ['Item 1', 'Item 2'],
      datasets: [
        {
          data: [75, 50],
        },
      ],
    };

    const wrapper = mount(HorizontalBarChart, {
      props: { chartData },
    });

    const mockChart = {
      ctx: mockCtx,
      data: { datasets: chartData.datasets },
      chartArea: { left: 50, width: 300 },
      scales: {
        y: {
          getPixelForValue: (index) => 50 + index * 50, // bar Y position
        },
      },
      getDatasetMeta: () => ({
        data: [{ height: 32 }, { height: 32 }], // bar height
      }),
    };

    wrapper.vm.horizontalBackgroundColorPlugin.beforeDatasetsDraw(
      mockChart,
      {},
      { backgroundColor: 'red' },
    );

    expect(mockCtx.fillStyle).toBe('red');
    expect(mockCtx.beginPath).toHaveBeenCalled();
    expect(mockCtx.fill).toHaveBeenCalled();

    expect(mockCtx.roundRect).toHaveBeenCalledTimes(2);

    expect(mockCtx.roundRect).toHaveBeenCalledWith(50, 50 - 16, 300, 32, 4);
    expect(mockCtx.roundRect).toHaveBeenCalledWith(50, 100 - 16, 300, 32, 4);
  });
});
