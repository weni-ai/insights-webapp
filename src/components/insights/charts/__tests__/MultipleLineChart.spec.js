import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import MultipleLineChart from '../MultipleLineChart.vue';

const mockData = [
  {
    group: 'Sent messages',
    data: [
      { label: '24/11', value: 10 },
      { label: '25/11', value: 20 },
      { label: '26/11', value: 15 },
      { label: '27/11', value: 9 },
      { label: '28/11', value: 12 },
      { label: '29/11', value: 11 },
      { label: '30/11', value: 9 },
    ],
    total: 86,
  },
  {
    group: 'Delivered messages',
    data: [
      { label: '24/11', value: 5 },
      { label: '25/11', value: 5 },
      { label: '26/11', value: 15 },
      { label: '27/11', value: 9 },
      { label: '28/11', value: 2 },
      { label: '29/11', value: 5 },
      { label: '30/11', value: 6 },
    ],
    total: 20,
  },
  {
    group: 'Read messages',
    data: [
      { label: '24/11', value: 1 },
      { label: '25/11', value: 2 },
      { label: '26/11', value: 3 },
      { label: '27/11', value: 4 },
      { label: '28/11', value: 5 },
      { label: '29/11', value: 6 },
      { label: '30/11', value: 7 },
    ],
    total: 10,
  },
  {
    group: 'Clicks',
    data: [
      { label: '24/11', value: 1 },
      { label: '25/11', value: 1 },
      { label: '26/11', value: 9 },
      { label: '27/11', value: 9 },
      { label: '28/11', value: 9 },
      { label: '29/11', value: 4 },
      { label: '30/11', value: 6 },
    ],
    total: 5,
  },
];

const createWrapper = () => {
  return mount(MultipleLineChart, {
    props: { data: mockData },
    global: { stubs: { UnnnicIcon: true } },
  });
};

describe('MultipleLineChart', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  it('should render chart data titles', () => {
    const labels = wrapper.findAll('[data-testid="data-label"]');
    expect(labels.length).toBe(mockData.length);
    labels.forEach((label, index) => {
      expect(label.text()).toBe(mockData[index].group);
    });
  });
  it('should totalItems = 0 if not informed in props data', async () => {
    await wrapper.setProps({
      data: [{ ...mockData[0], total: undefined }, ...mockData],
    });
    expect(wrapper.vm.totalItems).toBe(0);
  });
});
