import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import Chart from '../Chart.vue';

const CHART_METRICS = ['sent', 'delivered', 'read', 'clicks'];

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      conversations_dashboard: {
        abandoned_cart_recovery_widget: {
          chart: {
            sent: 'Sent',
            delivered: 'Delivered',
            read: 'Read',
            read_help: 'Read help tooltip',
            clicks: 'Clicks',
          },
        },
      },
    },
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

describe('AbandonedCartWidgetChart', () => {
  let wrapper;

  const defaultData = {
    sent: 100,
    delivered: 80,
    read: 60,
    clicks: 40,
  };

  const createWrapper = (data = defaultData) =>
    mount(Chart, {
      props: { data },
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
    it('renders four chart items', () => {
      CHART_METRICS.forEach((metric) => {
        expect(
          wrapper
            .find(`[data-testid="abandoned-cart-widget-chart-item-${metric}"]`)
            .exists(),
        ).toBe(true);
      });
    });

    it('renders chart labels in order', () => {
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-chart-label-sent"]')
          .text(),
      ).toBe('Sent');
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-chart-label-delivered"]')
          .text(),
      ).toBe('Delivered');
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-chart-label-read"]')
          .text(),
      ).toBe('Read');
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-chart-label-clicks"]')
          .text(),
      ).toBe('Clicks');
    });

    it('renders formatted values', () => {
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-chart-value-sent"]')
          .text(),
      ).toBe('100');
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-chart-value-delivered"]')
          .text(),
      ).toBe('80');
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-chart-value-read"]')
          .text(),
      ).toBe('60');
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-chart-value-clicks"]')
          .text(),
      ).toBe('40');
    });

    it('applies border-left to items after the first', () => {
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-chart-item-sent"]')
          .attributes('data-border-left'),
      ).toBeUndefined();
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-chart-item-delivered"]')
          .attributes('data-border-left'),
      ).toBe('true');
    });

    it('renders tooltip only for the read metric', () => {
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-chart-tooltip-read"]')
          .exists(),
      ).toBe(true);
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-chart-tooltip-sent"]')
          .exists(),
      ).toBe(false);
    });
  });

  describe('Chart bars', () => {
    it('calculates bar heights relative to sent value', () => {
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-chart-bar-sent"]')
          .attributes('style'),
      ).toContain('height: 60%');
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-chart-bar-delivered"]')
          .attributes('style'),
      ).toContain('height: 48%');
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-chart-bar-read"]')
          .attributes('style'),
      ).toContain('height: 36%');
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-chart-bar-clicks"]')
          .attributes('style'),
      ).toContain('height: 24%');
    });

    it('applies distinct border-radius per bar segment', () => {
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-chart-bar-sent"]')
          .attributes('style'),
      ).toContain('border-radius: 4px 4px 0 4px');
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-chart-bar-delivered"]')
          .attributes('style'),
      ).toContain('border-radius: 0 4px 0 0');
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-chart-bar-read"]')
          .attributes('style'),
      ).toContain('border-radius: 0 4px 0 0');
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-chart-bar-clicks"]')
          .attributes('style'),
      ).toContain('border-radius: 0 4px 4px 0');
    });
  });
});
