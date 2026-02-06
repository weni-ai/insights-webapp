import { mount, config } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import CardMetric from '@/components/home/CardMetric.vue';
import { createI18n } from 'vue-i18n';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';
import { UnnnicToolTip } from '@weni/unnnic-system';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {},
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n, UnnnicSystem];
config.global.mocks = {
  $t: (key) => key,
};

describe('CardMetric', () => {
  let wrapper;

  const defaultProps = {
    leftColumn: false,
    rightColumn: false,
    middleColumn: false,
    firstRow: false,
    lastRow: false,
    title: 'Test Metric',
    tooltipInfo: '',
    value: 1000,
    prefix: '',
  };

  beforeEach(() => {
    wrapper = mount(CardMetric, {
      props: defaultProps,
      global: {
        mocks: {
          $t: (key) => key,
        },
      },
    });
  });

  describe('rendering', () => {
    it('renders properly with default props', () => {
      expect(wrapper.exists()).toBeTruthy();
      expect(
        wrapper.find('[data-test-id="metric-card"]').exists(),
      ).toBeTruthy();
      expect(wrapper.find('[data-test-id="metric-title"]').text()).toBe(
        'Test Metric',
      );
    });

    it('renders tooltip and info icon when tooltipInfo is provided', async () => {
      await wrapper.setProps({ tooltipInfo: 'Test tooltip' });
      await wrapper.vm.$nextTick();

      const tooltip = wrapper.findComponent(UnnnicToolTip);
      const infoIcon = wrapper.findComponent('[data-test-id="info-icon"]');

      expect(tooltip.exists()).toBeTruthy();
      expect(tooltip.props('text')).toBe('Test tooltip');
      expect(tooltip.props('enabled')).toBe(true);
      expect(tooltip.props('side')).toBe('right');

      expect(infoIcon.exists()).toBeTruthy();
      expect(infoIcon.props('icon')).toBe('info');
      expect(infoIcon.props('size')).toBe('sm');
      expect(infoIcon.props('filled')).toBe(true);
      expect(infoIcon.props('scheme')).toBe('neutral-cleanest');
    });

    it('does not render tooltip or info icon when tooltipInfo is empty', () => {
      const tooltip = wrapper.find('[data-test-id="metric-tooltip"]');
      const infoIcon = wrapper.find('[data-test-id="info-icon"]');

      expect(tooltip.exists()).toBeFalsy();
      expect(infoIcon.exists()).toBeFalsy();
    });

    it('displays prefix when provided', async () => {
      await wrapper.setProps({ prefix: '$' });
      const valueSection = wrapper.find('[data-test-id="metric-value"]');
      expect(valueSection.text()).toMatch(/^\$/);
    });
  });

  describe('layout classes', () => {
    it('applies left column class when leftColumn is true', async () => {
      await wrapper.setProps({ leftColumn: true });
      expect(wrapper.classes()).toContain('metric-card--left-column');
    });

    it('applies right column class when rightColumn is true', async () => {
      await wrapper.setProps({ rightColumn: true });
      expect(wrapper.classes()).toContain('metric-card--right-column');
    });

    it('applies middle column class when middleColumn is true', async () => {
      await wrapper.setProps({ middleColumn: true });
      expect(wrapper.classes()).toContain('metric-card--middle-column');
    });

    it('applies first row class when firstRow is true', async () => {
      await wrapper.setProps({ firstRow: true });
      expect(wrapper.classes()).toContain('metric-card--first-row');
    });

    it('applies last row class when lastRow is true', async () => {
      await wrapper.setProps({ lastRow: true });
      expect(wrapper.classes()).toContain('metric-card--last-row');
    });
  });
});
