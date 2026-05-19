import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import SalesFunnelWidget from '../SalesFunnelWidget.vue';

const mockWidgetsStore = {
  salesFunnelWidgetData: null,
};

vi.mock('@/store/modules/conversational/widgets', () => ({
  useConversationalWidgets: () => mockWidgetsStore,
}));

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      conversations_dashboard: {
        no_data_available: 'No data available for the filtered period',
        sales_funnel_widget: {
          total_orders: 'Total orders',
          total_value: 'Total value',
          average_ticket: 'Average ticket',
          captured_leads: 'Captured leads',
          purchases_made: 'Purchases made',
        },
      },
    },
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

const populatedData = {
  captured_leads: { value: 80, full_value: 800 },
  purchases_made: { value: 40, full_value: 400 },
  total_orders: 400,
  total_value: 100000,
  average_ticket: 25000,
  currency: 'USD',
};

const emptyData = {
  captured_leads: { value: 0, full_value: 0 },
  purchases_made: { value: 0, full_value: 0 },
  total_orders: 0,
  total_value: 0,
  average_ticket: 0,
  currency: 'USD',
};

const createWrapper = (data) => {
  mockWidgetsStore.salesFunnelWidgetData = data;
  return mount(SalesFunnelWidget, {
    global: {
      stubs: {
        UnnnicChartFunnel: true,
      },
    },
  });
};

describe('SalesFunnelWidget.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWidgetsStore.salesFunnelWidgetData = null;
  });

  describe('No-data disclaimer', () => {
    it('renders the UnnnicDisclaimer when all numeric fields are zero', () => {
      const wrapper = createWrapper(emptyData);

      const disclaimer = wrapper.findComponent(
        '[data-testid="sales-funnel-no-data-disclaimer"]',
      );
      expect(disclaimer.exists()).toBe(true);
    });

    it('binds type="neutral" and the no_data_available description on the disclaimer', () => {
      const wrapper = createWrapper(emptyData);

      const disclaimer = wrapper.findComponent(
        '[data-testid="sales-funnel-no-data-disclaimer"]',
      );
      expect(disclaimer.props('type')).toBe('neutral');
      expect(disclaimer.props('description')).toBe(
        'No data available for the filtered period',
      );
    });

    it('does NOT render the disclaimer when there is at least one non-zero metric', () => {
      const wrapper = createWrapper(populatedData);

      const disclaimer = wrapper.find(
        '[data-testid="sales-funnel-no-data-disclaimer"]',
      );
      expect(disclaimer.exists()).toBe(false);
    });

    it('renders the disclaimer when salesFunnelWidgetData is null/undefined', () => {
      const wrapper = createWrapper(null);

      const disclaimer = wrapper.find(
        '[data-testid="sales-funnel-no-data-disclaimer"]',
      );
      expect(disclaimer.exists()).toBe(true);
    });
  });

  describe('Rendering', () => {
    it('always renders the funnel chart and metric containers', () => {
      const wrapper = createWrapper(populatedData);

      expect(
        wrapper.find('.sales-funnel-widget__count-container').exists(),
      ).toBe(true);
      expect(wrapper.find('.sales-funnel-widget__graph').exists()).toBe(true);
    });
  });
});
