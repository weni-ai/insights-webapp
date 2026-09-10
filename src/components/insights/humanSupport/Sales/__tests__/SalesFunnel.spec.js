import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { ref } from 'vue';

import SalesFunnel from '../SalesFunnel.vue';

const mockPurchasesMadeData = ref({
  leads_captured: {
    value: null,
    percentage: null,
  },
  purchases_made: {
    value: null,
    percentage: null,
  },
});

const mockLoadingPurchasesMadeData = ref(false);

vi.mock('@/store/modules/humanSupport/humanSupport', () => ({
  useHumanSupport: () => ({
    appliedDateRange: ref({ start: '2026-01-01', end: '2026-01-31' }),
    appliedFilters: ref({ sectors: [], queues: [], tags: [] }),
  }),
}));

vi.mock('@/store/modules/humanSupport/sales', () => ({
  useHumanSupportSales: () => ({
    loadPurchasesMadeData: vi.fn(),
    purchasesMadeData: mockPurchasesMadeData,
    loadingPurchasesMadeData: mockLoadingPurchasesMadeData,
  }),
}));

vi.mock('@/composables/useLazyData', () => ({
  useLazyData: vi.fn(),
}));

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      conversations_dashboard: {
        no_data_available: 'No data available for the filtered period',
      },
      human_support_dashboard: {
        sales: {
          sales_funnel: {
            title: 'Sales funnel',
            leads_captured: 'Leads captured',
            purchases_made: 'Purchases made',
          },
        },
      },
    },
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

const populatedData = {
  leads_captured: {
    value: 45000,
    percentage: 100,
  },
  purchases_made: {
    value: 4250,
    percentage: 9.44,
  },
};

const emptyData = {
  leads_captured: {
    value: 0,
    percentage: 0,
  },
  purchases_made: {
    value: 0,
    percentage: 0,
  },
};

const createWrapper = () =>
  mount(SalesFunnel, {
    global: {
      stubs: {
        UnnnicChartFunnel: true,
        UnnnicSkeletonLoading: true,
      },
    },
  });

describe('SalesFunnel.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadingPurchasesMadeData.value = false;
    mockPurchasesMadeData.value = {
      leads_captured: { value: null, percentage: null },
      purchases_made: { value: null, percentage: null },
    };
  });

  it('renders skeleton when loading', () => {
    mockLoadingPurchasesMadeData.value = true;

    const wrapper = createWrapper();

    expect(wrapper.find('[data-testid="sales-funnel-loading"]').exists()).toBe(
      true,
    );
    expect(wrapper.find('[data-testid="sales-funnel"]').exists()).toBe(false);
  });

  it('renders disclaimer when all values are zero', () => {
    mockPurchasesMadeData.value = emptyData;

    const wrapper = createWrapper();

    const disclaimer = wrapper.findComponent(
      '[data-testid="sales-funnel-no-data-disclaimer"]',
    );
    expect(disclaimer.exists()).toBe(true);
    expect(disclaimer.props('type')).toBe('neutral');
    expect(disclaimer.props('description')).toBe(
      'No data available for the filtered period',
    );
  });

  it('renders funnel chart and title when data is populated', () => {
    mockPurchasesMadeData.value = populatedData;

    const wrapper = createWrapper();

    expect(wrapper.find('[data-testid="sales-funnel-title"]').text()).toBe(
      'Sales funnel',
    );
    expect(wrapper.find('[data-testid="sales-funnel-graph"]').exists()).toBe(
      true,
    );
    expect(
      wrapper.find('[data-testid="sales-funnel-no-data-disclaimer"]').exists(),
    ).toBe(false);
  });
});
