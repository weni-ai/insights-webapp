import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shallowMount, config } from '@vue/test-utils';
import SkeletonBarChart from '@/components/insights/charts/loadings/SkeletonBarChart.vue';
import i18n from '@/utils/plugins/i18n';
import Unnnic from '@weni/unnnic-system';

beforeAll(() => {
  config.global.plugins = config.global.plugins.filter(
    (plugin) => plugin !== i18n,
  );
});

afterAll(() => {
  if (!config.global.plugins.includes(i18n)) {
    config.global.plugins.push(i18n);
  }
});

describe('SkeletonBarChart', () => {
  let wrapper;

  const createWrapper = (props = {}) => {
    return shallowMount(SkeletonBarChart, {
      props: {
        width: 480,
        height: 200,
        ...props,
      },
      global: {
        stubs: {
          UnnnicSkeletonLoading: Unnnic.unnnicSkeletonLoading,
        },
      },
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('Rendering and Structure', () => {
    it('renders the skeleton bar container when totalBars is greater than 0', () => {
      expect(wrapper.find('.skeleton-bar-container').exists()).toBe(true);
    });

    it('renders the correct number of skeleton bars based on width', () => {
      const totalBars = Math.floor(wrapper.props().width / 48);
      const bars = wrapper.findAll('.skeleton-bar-container__bar');
      expect(bars.length).toBe(totalBars);
    });

    it('renders UnnnicSkeletonLoading component within each bar', () => {
      const bars = wrapper.findAll('.skeleton-bar-container__bar');
      bars.forEach((bar) => {
        expect(
          bar.findComponent({ name: 'UnnnicSkeletonLoading' }).exists(),
        ).toBe(true);
      });
    });

    it('correctly passes width and height props to UnnnicSkeletonLoading components', () => {
      const bar = wrapper.find('.skeleton-bar-container__bar');
      const skeletons = bar.findAllComponents({
        name: 'UnnnicSkeletonLoading',
      });

      skeletons.forEach((skeleton) => {
        expect(skeleton.props('width')).toBe('48px');
      });
    });
  });

  describe('Computed Properties and Methods', () => {
    it('computes totalBars based on width and BAR_WIDTH constant', async () => {
      await wrapper.setProps({ width: 240 });
      const totalBars = Math.floor(wrapper.props().width / 48);
      expect(wrapper.vm.totalBars).toBe(totalBars);
    });

    it('generates a random height within the expected range for each bar', () => {
      const generatedHeight = wrapper.vm.generateRandomHeight();
      const minHeight = 100;
      expect(parseFloat(generatedHeight)).toBeGreaterThanOrEqual(minHeight);
      expect(parseFloat(generatedHeight)).toBeLessThanOrEqual(
        wrapper.props().height,
      );
    });
  });

  describe('Edge Cases', () => {
    it('calculates totalBars correctly when width is less than BAR_WIDTH', async () => {
      await wrapper.setProps({ width: 48 });
      expect(wrapper.vm.totalBars).toBe(1);
    });

    it('calculates totalBars correctly when width is 0', async () => {
      await wrapper.setProps({ width: 0 });

      expect(wrapper.vm.totalBars).toBe(36);
    });
  });

  describe('Emits', () => {
    it('does not emit any event (no emits for this component)', () => {
      expect(wrapper.emitted()).toEqual({});
    });
  });
});
