import { mount, config } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import CardMetric from '@/components/home/CardMetric.vue';
import { createI18n } from 'vue-i18n';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';

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
    hasInfo: false,
    value: 1000,
    percentage: 10,
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

    it('renders info icon when hasInfo is true', async () => {
      await wrapper.setProps({ hasInfo: true });
      const infoIcon = wrapper.findComponent('[data-test-id="info-icon"]');
      expect(infoIcon.exists()).toBeTruthy();
      expect(infoIcon.props('icon')).toBe('info');
    });

    it('does not render info icon when hasInfo is false', () => {
      const infoIcon = wrapper.find('[data-test-id="info-icon"]');
      expect(infoIcon.exists()).toBeFalsy();
    });
  });

  describe('column classes', () => {
    it('applies left column class when leftColumn is true', async () => {
      await wrapper.setProps({ leftColumn: true });
      expect(wrapper.classes()).toContain('left-column');
    });

    it('applies right column class when rightColumn is true', async () => {
      await wrapper.setProps({ rightColumn: true });
      expect(wrapper.classes()).toContain('right-column');
    });

    it('applies middle column class when middleColumn is true', async () => {
      await wrapper.setProps({ middleColumn: true });
      expect(wrapper.classes()).toContain('middle-column');
    });

    it('applies first row class when firstRow is true', async () => {
      await wrapper.setProps({ firstRow: true });
      expect(wrapper.classes()).toContain('first-row');
    });

    it('applies last row class when lastRow is true', async () => {
      await wrapper.setProps({ lastRow: true });
      expect(wrapper.classes()).toContain('last-row');
    });
  });

  describe('value formatting', () => {
    it('formats integer values with thousand separators', async () => {
      await wrapper.setProps({ value: 1000000, percentage: 20 });
      const valueText = wrapper.find('[data-test-id="metric-value"]').text();
      expect(valueText).toContain('1.000.000 20.00% arrow_drop_up');
    });

    it('formats decimal values with comma separator', async () => {
      await wrapper.setProps({ value: 1000.55 });
      const valueText = wrapper.find('[data-test-id="metric-value"]').text();
      expect(valueText).toContain('1000,55');
    });

    it('displays prefix when provided', async () => {
      await wrapper.setProps({ prefix: '$' });
      const valueText = wrapper.find('[data-test-id="metric-value"]').text();
      expect(valueText).toMatch(/^\$\d/);
    });
  });

  describe('percentage formatting and styling', () => {
    it('formats positive percentage correctly', async () => {
      await wrapper.setProps({ percentage: 15.5 });
      const percentageElement = wrapper.find('[data-test-id="percentage"]');
      expect(percentageElement.text()).toContain('15.50%');
      expect(percentageElement.classes()).toContain('positive');
    });

    it('formats negative percentage correctly', async () => {
      await wrapper.setProps({ percentage: -15.5 });
      const percentageElement = wrapper.find('[data-test-id="percentage"]');
      expect(percentageElement.text()).toContain('15.50%');
      expect(percentageElement.classes()).toContain('negative');
    });

    it('formats zero percentage correctly', async () => {
      await wrapper.setProps({ percentage: 0 });
      const percentageElement = wrapper.find('[data-test-id="percentage"]');
      expect(percentageElement.text()).toContain('0%');
      expect(percentageElement.classes()).not.toContain('positive');
      expect(percentageElement.classes()).not.toContain('negative');
    });
  });

  describe('percentage icon', () => {
    it('shows up arrow for positive percentage', async () => {
      await wrapper.setProps({ percentage: 10 });
      const icon = wrapper.findComponent('[data-test-id="icon-arrow"]');
      expect(icon.props('icon')).toBe('arrow_drop_up');
      expect(icon.props('scheme')).toBe('aux-green-500');
    });

    it('shows down arrow for negative percentage', async () => {
      await wrapper.setProps({ percentage: -10 });
      const icon = wrapper.findComponent('[data-test-id="icon-arrow"]');
      expect(icon.props('icon')).toBe('arrow_drop_down');
      expect(icon.props('scheme')).toBe('aux-red-500');
    });

    it('does not show arrow when percentage is zero', async () => {
      await wrapper.setProps({ percentage: 0 });
      const icons = wrapper.findAll('UnnnicIcon');
      expect(icons).toHaveLength(wrapper.vm.hasInfo ? 1 : 0);
    });
  });
});
