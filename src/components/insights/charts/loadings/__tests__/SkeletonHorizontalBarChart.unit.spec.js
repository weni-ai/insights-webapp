import { describe, it, expect } from 'vitest';

import { mount } from '@vue/test-utils';

import SkeletonHorizontalBarChart from '../SkeletonHorizontalBarChart.vue';

describe('SkeletonHorizontalBarChart', () => {
  const BAR_HEIGHT = 48;

  it('renders correctly when props are valid', () => {
    const wrapper = mount(SkeletonHorizontalBarChart, {
      props: { width: 300, height: 480 },
    });

    const totalBars = Math.floor(480 / BAR_HEIGHT);
    expect(wrapper.findAll('.skeleton-h-bar-container__bar')).toHaveLength(
      totalBars,
    );
  });

  it('applies the correct styles and structure', () => {
    const wrapper = mount(SkeletonHorizontalBarChart, {
      props: { width: 300, height: 480 },
    });

    expect(wrapper.classes()).toContain('skeleton-h-bar-container');
    expect(
      wrapper.findAll('.skeleton-h-bar-container__bar').length,
    ).toBeGreaterThan(0);

    expect(
      wrapper.findComponent({ name: 'UnnnicSkeletonLoading' }).exists(),
    ).toBe(true);
  });
});
