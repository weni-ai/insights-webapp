import { beforeEach, describe, expect, it } from 'vitest';
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

  it('should format datalabels with the suffix', async () => {
    await wrapper.setProps({ datalabelsSuffix: '%' });

    const { chartOptions } = wrapper.vm;

    const formatter = chartOptions.plugins.datalabels.formatter;

    expect(formatter(10)).toBe('10%');
    expect(formatter(20)).toBe('20%');
  });

  it('should return false from tooltip label callback', async () => {
    const { chartOptions } = wrapper.vm;

    // Mocka o contexto de tooltip e chama o callback
    const tooltipCallback = chartOptions.plugins.tooltip.callbacks.label;

    expect(tooltipCallback()).toBe(false);
  });
});
