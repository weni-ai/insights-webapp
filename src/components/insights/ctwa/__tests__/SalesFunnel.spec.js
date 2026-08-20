import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createI18n } from 'vue-i18n';
import { createTestingPinia } from '@pinia/testing';

import SalesFunnel from '../SalesFunnel.vue';
import { useCTWA } from '@/store/modules/ctwa';
import en from '@/locales/en.json';

vi.mock('@/utils/numbers', () => ({
  formatNumber: vi.fn((value) => String(value)),
  formatPercentage: vi.fn((value) => `${value}%`),
}));

vi.mock('@/utils/time', () => ({
  getLastNDays: vi.fn(() => ({ start: '2024-01-01', end: '2024-01-07' })),
  getTodayDate: vi.fn(() => ({ start: '2024-01-01', end: '2024-01-07' })),
  isDateBefore: vi.fn(() => false),
}));

vi.mock('@weni/unnnic-system/tokens/colors', () => ({
  colorBlue3: '#cbe9ff',
  colorBlue6: '#79bcfb',
  colorBlue8: '#3993f4',
}));

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

const mockConversionsData = {
  conversations_started: { total: 19400, percentage: 100 },
  conversations_qualified: { total: 7180, percentage: 37.4 },
  conversations_converted: { total: 2880, percentage: 14.8 },
};

describe('SalesFunnel', () => {
  let wrapper;

  const createWrapper = (initialState = {}) => {
    const pinia = createTestingPinia({
      initialState: {
        ctwa: {
          conversionsData: mockConversionsData,
          loadingConversionsData: false,
          appliedDateRange: { start: '2024-01-01', end: '2024-01-07' },
          selectedCampaign: '',
          ...initialState,
        },
      },
    });

    return mount(SalesFunnel, {
      global: {
        plugins: [pinia],
        stubs: {
          SteppedBarChart: true,
          UnnnicSkeletonLoading: {
            template: '<div data-testid="ctwa-sales-funnel-skeleton" />',
          },
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  it('renders the sales funnel title', () => {
    expect(wrapper.find('[data-testid="ctwa-sales-funnel-title"]').text()).toBe(
      'Sales funnel',
    );
  });

  it('loads conversions data on mount', () => {
    const store = useCTWA();
    expect(store.loadConversionsData).toHaveBeenCalledTimes(1);
  });

  it('reloads conversions data when filters change', async () => {
    const store = useCTWA();
    vi.clearAllMocks();

    store.appliedDateRange = { start: '2024-02-01', end: '2024-02-28' };
    await nextTick();

    expect(store.loadConversionsData).toHaveBeenCalledTimes(1);
  });

  it('shows a skeleton while loading', () => {
    wrapper = createWrapper({ loadingConversionsData: true });

    expect(
      wrapper.find('[data-testid="ctwa-sales-funnel-loading"]').exists(),
    ).toBe(true);
    expect(wrapper.findComponent({ name: 'SteppedBarChart' }).exists()).toBe(
      false,
    );
  });

  it('maps three funnel stages with percentage and total', () => {
    const chart = wrapper.findComponent({ name: 'SteppedBarChart' });
    const items = chart.props('items');

    expect(items).toHaveLength(3);
    expect(items[0]).toEqual(
      expect.objectContaining({
        id: 'started',
        label: 'Conversations started',
        value: 100,
        displayValue: '100%',
        displaySecondary: '19400',
      }),
    );
    expect(items[1]).toEqual(
      expect.objectContaining({
        id: 'qualified',
        label: 'Qualified',
        value: 37.4,
        displayValue: '37.4%',
        displaySecondary: '7180',
        tooltip:
          'Contacts where the agent identified purchase intent. This may include actions such as adding a product to the cart or asking about a product, among other intent signals.',
      }),
    );
    expect(items[2]).toEqual(
      expect.objectContaining({
        id: 'converted',
        label: 'Converted',
        value: 14.8,
        displayValue: '14.8%',
        displaySecondary: '2880',
      }),
    );
    expect(items[0].tooltip).toBeUndefined();
    expect(items[2].tooltip).toBeUndefined();
  });

  it('renders dashes when stage values are null', () => {
    wrapper = createWrapper({
      conversionsData: {
        conversations_started: { total: null, percentage: null },
        conversations_qualified: { total: null, percentage: null },
        conversations_converted: { total: null, percentage: null },
      },
    });

    const items = wrapper
      .findComponent({ name: 'SteppedBarChart' })
      .props('items');

    items.forEach((item) => {
      expect(item.displayValue).toBe('-');
      expect(item.displaySecondary).toBe('-');
      expect(item.value).toBe(0);
    });
  });
});
