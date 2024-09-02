import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import FunnelChart from '../FunnelChart.vue';

const createWraper = (props) => {
  return mount(FunnelChart, { props });
};

describe('FunnelChart', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = createWraper({ isLoading: false, chartData: [] });
  });

  it('renders IconLoading when isLoading is true', async () => {
    await wrapper.setProps({ isLoading: true });

    expect(
      wrapper.findComponent({ name: 'IconLoading' }).exists(),
    ).toBeTruthy();
    expect(
      wrapper.findComponent({ name: 'UnnnicChartFunnel' }).exists(),
    ).toBeFalsy();
  });

  it('renders UnnnicChartFunnel when isLoading is false', async () => {
    await wrapper.setProps({ isLoading: false });

    expect(wrapper.findComponent({ name: 'IconLoading' }).exists()).toBeFalsy();

    expect(
      wrapper.findComponent({ name: 'UnnnicChartFunnel' }).exists(),
    ).toBeTruthy();
  });
});
