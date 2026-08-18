import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import SteppedBarChart from '../SteppedBarChart.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: {} },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

const defaultItems = [
  {
    id: 'sent',
    label: 'Sent',
    value: 100,
    backgroundColor: '#cbe9ff',
  },
  {
    id: 'delivered',
    label: 'Delivered',
    value: 80,
    backgroundColor: '#79bcfb',
  },
  {
    id: 'read',
    label: 'Read',
    value: 60,
    tooltip: 'Read help tooltip',
    backgroundColor: '#3993f4',
  },
  {
    id: 'clicks',
    label: 'Clicks',
    value: 40,
    backgroundColor: '#0f6dd9',
  },
];

describe('SteppedBarChart', () => {
  let wrapper;

  const createWrapper = (items = defaultItems) =>
    mount(SteppedBarChart, {
      props: { items },
      global: {
        stubs: {
          UnnnicToolTip: {
            template: '<div data-testid="tooltip-stub"><slot /></div>',
            props: ['text', 'enabled'],
          },
          UnnnicIcon: true,
        },
      },
    });

  beforeEach(() => {
    wrapper = createWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('Component rendering', () => {
    it('renders an item for each entry', () => {
      defaultItems.forEach((item) => {
        expect(
          wrapper.find(`[data-testid="stepped-bar-chart-item-${item.id}"]`).exists(),
        ).toBe(true);
      });
    });

    it('renders chart labels in order', () => {
      expect(
        wrapper.find('[data-testid="stepped-bar-chart-label-sent"]').text(),
      ).toBe('Sent');
      expect(
        wrapper.find('[data-testid="stepped-bar-chart-label-delivered"]').text(),
      ).toBe('Delivered');
      expect(
        wrapper.find('[data-testid="stepped-bar-chart-label-read"]').text(),
      ).toBe('Read');
      expect(
        wrapper.find('[data-testid="stepped-bar-chart-label-clicks"]').text(),
      ).toBe('Clicks');
    });

    it('renders formatted values', () => {
      expect(
        wrapper.find('[data-testid="stepped-bar-chart-value-sent"]').text(),
      ).toBe('100');
      expect(
        wrapper.find('[data-testid="stepped-bar-chart-value-delivered"]').text(),
      ).toBe('80');
    });

    it('renders displayValue and displaySecondary when provided', () => {
      wrapper = createWrapper([
        {
          id: 'started',
          label: 'Started',
          value: 100,
          displayValue: '100%',
          displaySecondary: '19.400',
          backgroundColor: '#cbe9ff',
        },
      ]);

      expect(
        wrapper.find('[data-testid="stepped-bar-chart-value-started"]').text(),
      ).toContain('100%');
      expect(
        wrapper.find('[data-testid="stepped-bar-chart-value-started"]').text(),
      ).toContain('19.400');
    });

    it('applies border-left to items after the first', () => {
      expect(
        wrapper
          .find('[data-testid="stepped-bar-chart-item-sent"]')
          .attributes('data-border-left'),
      ).toBeUndefined();
      expect(
        wrapper
          .find('[data-testid="stepped-bar-chart-item-delivered"]')
          .attributes('data-border-left'),
      ).toBe('true');
    });

    it('renders tooltip only when provided', () => {
      expect(
        wrapper.find('[data-testid="stepped-bar-chart-tooltip-read"]').exists(),
      ).toBe(true);
      expect(
        wrapper.find('[data-testid="stepped-bar-chart-tooltip-sent"]').exists(),
      ).toBe(false);
    });
  });

  describe('Chart bars', () => {
    it('calculates bar heights relative to the first item', () => {
      expect(
        wrapper.find('[data-testid="stepped-bar-chart-bar-sent"]').attributes('style'),
      ).toContain('height: 60%');
      expect(
        wrapper
          .find('[data-testid="stepped-bar-chart-bar-delivered"]')
          .attributes('style'),
      ).toContain('height: 48%');
      expect(
        wrapper.find('[data-testid="stepped-bar-chart-bar-read"]').attributes('style'),
      ).toContain('height: 36%');
      expect(
        wrapper.find('[data-testid="stepped-bar-chart-bar-clicks"]').attributes('style'),
      ).toContain('height: 24%');
    });

    it('applies first, middle and last border-radius', () => {
      expect(
        wrapper.find('[data-testid="stepped-bar-chart-bar-sent"]').attributes('style'),
      ).toContain('border-radius: 4px 4px 0 4px');
      expect(
        wrapper
          .find('[data-testid="stepped-bar-chart-bar-delivered"]')
          .attributes('style'),
      ).toContain('border-radius: 0 4px 0 0');
      expect(
        wrapper.find('[data-testid="stepped-bar-chart-bar-clicks"]').attributes('style'),
      ).toContain('border-radius: 0 4px 4px 0');
    });

    it('uses last-item radius for three items', () => {
      wrapper = createWrapper([
        { id: 'a', label: 'A', value: 100, backgroundColor: '#aaa' },
        { id: 'b', label: 'B', value: 50, backgroundColor: '#bbb' },
        { id: 'c', label: 'C', value: 25, backgroundColor: '#ccc' },
      ]);

      expect(
        wrapper.find('[data-testid="stepped-bar-chart-bar-a"]').attributes('style'),
      ).toContain('border-radius: 4px 4px 0 4px');
      expect(
        wrapper.find('[data-testid="stepped-bar-chart-bar-b"]').attributes('style'),
      ).toContain('border-radius: 0 4px 0 0');
      expect(
        wrapper.find('[data-testid="stepped-bar-chart-bar-c"]').attributes('style'),
      ).toContain('border-radius: 0 4px 4px 0');
    });

    it('renders 0% height when the first value is 0', () => {
      wrapper = createWrapper([
        { id: 'a', label: 'A', value: 0, backgroundColor: '#aaa' },
        { id: 'b', label: 'B', value: 10, backgroundColor: '#bbb' },
      ]);

      expect(
        wrapper.find('[data-testid="stepped-bar-chart-bar-a"]').attributes('style'),
      ).toContain('height: 0%');
    });
  });
});
