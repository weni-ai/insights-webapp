import { beforeEach, describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';

import BarChart from '../BarChart.vue';

const createWraper = (props = {}) => {
  return mount(BarChart, {
    props: {
      title: 'Barchart',
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
        SkeletonBarChart: true,
      },
    },
  });
};

describe('BarChart', () => {
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

  it('should return the correct datalabel color based on context active state', async () => {
    const { chartOptions } = wrapper.vm;

    const activeContext = { active: true };
    const inactiveContext = { active: false };

    expect(chartOptions.plugins.datalabels.color(activeContext)).toBe(
      '#0D5453', // colorTeal900
    );

    expect(chartOptions.plugins.datalabels.color(inactiveContext)).toBe('#fff');
  });
});
