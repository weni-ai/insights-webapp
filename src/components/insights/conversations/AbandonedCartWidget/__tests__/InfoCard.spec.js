import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import InfoCard from '../InfoCard.vue';

const mockProjectStore = {
  abandonedCartRecoveryCost: { value: 0.5 },
};

vi.mock('@/store/modules/project', () => ({
  useProject: () => mockProjectStore,
}));

vi.mock('pinia', async (importOriginal) => ({
  ...(await importOriginal()),
  storeToRefs: (store) => store,
}));

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      conversations_dashboard: {
        abandoned_cart_recovery_widget: {
          info_card: {
            recovery_revenue: 'Recovered revenue',
            total_sends: 'Total sends',
            converted_sales: 'Converted sales',
            conversion_rate: 'Conversion rate',
            average_order_value: 'Average order value',
            roas_tooltip: 'RoAS tooltip',
          },
        },
      },
    },
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

describe('AbandonedCartWidgetInfoCard', () => {
  let wrapper;

  const defaultData = {
    currency: '$',
    recoveryRevenue: 1000,
    totalSends: 100,
    convertedSales: 20,
  };

  const createWrapper = (data = defaultData) =>
    mount(InfoCard, {
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
    mockProjectStore.abandonedCartRecoveryCost = { value: 0.5 };
    wrapper = createWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('Component rendering', () => {
    it('renders recovered revenue with currency', () => {
      expect(
        wrapper
          .find(
            '[data-testid="abandoned-cart-widget-info-card-recovery-revenue"]',
          )
          .text(),
      ).toBe('$ 1,000');
    });

    it('renders RoAS based on recovery cost', () => {
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-info-card-roas"]')
          .text(),
      ).toBe('RoAS: 20x');
    });

    it('renders total sends and converted sales', () => {
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-info-card-total-sends"]')
          .text(),
      ).toBe('100');
      expect(
        wrapper
          .find(
            '[data-testid="abandoned-cart-widget-info-card-converted-sales"]',
          )
          .text(),
      ).toBe('20');
    });

    it('renders conversion rate and average order value', () => {
      expect(
        wrapper
          .find(
            '[data-testid="abandoned-cart-widget-info-card-conversion-rate"]',
          )
          .text(),
      ).toBe('20%');
      expect(
        wrapper
          .find(
            '[data-testid="abandoned-cart-widget-info-card-average-order-value"]',
          )
          .text(),
      ).toBe('$ 50');
    });

    it('renders RoAS tooltip', () => {
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-info-card-roas-tooltip"]')
          .exists(),
      ).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('shows zero RoAS when recovery cost is zero', () => {
      mockProjectStore.abandonedCartRecoveryCost = { value: 0 };
      wrapper = createWrapper();
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-info-card-roas"]')
          .text(),
      ).toBe('RoAS: 0x');
    });

    it('shows infinity for average order value when converted sales is zero', () => {
      wrapper = createWrapper({
        ...defaultData,
        convertedSales: 0,
      });
      expect(
        wrapper
          .find(
            '[data-testid="abandoned-cart-widget-info-card-average-order-value"]',
          )
          .text(),
      ).toBe('$ ∞');
    });
  });
});
