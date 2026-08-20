import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createI18n } from 'vue-i18n';
import { createTestingPinia } from '@pinia/testing';

import PerformanceByCampaign from '../PerformanceByCampaign.vue';
import { useCTWA } from '@/store/modules/ctwa';
import { formatCurrency } from '@/utils/numbers';
import en from '@/locales/en.json';

vi.mock('@/utils/numbers', () => ({
  formatNumber: vi.fn((value) => String(value)),
  formatCurrency: vi.fn((value, currency) => `${currency} ${value}`),
}));

vi.mock('@/utils/time', () => ({
  getLastNDays: vi.fn(() => ({ start: '2024-01-01', end: '2024-01-07' })),
  getTodayDate: vi.fn(() => ({ start: '2024-01-01', end: '2024-01-07' })),
  isDateBefore: vi.fn(() => false),
}));

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

const mockResults = [
  {
    campaign: 'Contractor Bulk Pricing',
    conversations: 3200,
    qualified: 1450,
    conversions: 520,
    revenue: 509600,
  },
];

describe('PerformanceByCampaign', () => {
  let wrapper;

  const createWrapper = (initialState = {}, configState = {}) => {
    const pinia = createTestingPinia({
      initialState: {
        ctwa: {
          campaignPerformanceResults: mockResults,
          campaignPerformanceCount: 2,
          campaignPerformanceOffset: 0,
          loadingCampaignPerformance: false,
          appliedDateRange: { start: '2024-01-01', end: '2024-01-07' },
          ...initialState,
        },
        config: {
          project: { uuid: '', ...configState },
        },
      },
    });

    return mount(PerformanceByCampaign, {
      global: {
        plugins: [pinia],
        stubs: {
          UnnnicDataTable: true,
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  it('renders the table title', () => {
    expect(
      wrapper.find('[data-testid="ctwa-performance-by-campaign-title"]').text(),
    ).toBe('Performance by campaign');
  });

  it('loads campaign performance data on mount from offset 0', () => {
    const store = useCTWA();
    expect(store.loadCampaignPerformanceData).toHaveBeenCalledWith(0);
  });

  it('reloads from offset 0 when the date range changes', async () => {
    const store = useCTWA();
    vi.clearAllMocks();

    store.appliedDateRange = { start: '2024-02-01', end: '2024-02-28' };
    await nextTick();

    expect(store.loadCampaignPerformanceData).toHaveBeenCalledWith(0);
  });

  it('passes five column headers to the table', () => {
    const table = wrapper.findComponent({ name: 'UnnnicDataTable' });
    const headers = table.props('headers');

    expect(headers.map((header) => header.itemKey)).toEqual([
      'campaign',
      'conversations',
      'qualified',
      'conversions',
      'revenue',
    ]);
    expect(headers.map((header) => header.title)).toEqual([
      'Campaign',
      'Conversations',
      'Qualified',
      'Conversions',
      'Revenue',
    ]);
    expect(headers.every((header) => header.isSortable === false)).toBe(true);
  });

  it('formats counts and revenue for table rows', () => {
    const table = wrapper.findComponent({ name: 'UnnnicDataTable' });

    expect(table.props('items')[0]).toEqual({
      campaign: 'Contractor Bulk Pricing',
      conversations: '3200',
      qualified: '1450',
      conversions: '520',
      revenue: 'BRL 509600',
    });
    expect(formatCurrency).toHaveBeenCalledWith(509600, 'BRL');
  });

  it('formats revenue with the project currency', () => {
    wrapper = createWrapper({}, { currency: 'USD' });
    const table = wrapper.findComponent({ name: 'UnnnicDataTable' });

    expect(table.props('items')[0].revenue).toBe('USD 509600');
    expect(formatCurrency).toHaveBeenCalledWith(509600, 'USD');
  });

  it('renders dashes when row values are null', () => {
    wrapper = createWrapper({
      campaignPerformanceResults: [
        {
          campaign: null,
          conversations: null,
          qualified: null,
          conversions: null,
          revenue: null,
        },
      ],
    });

    expect(
      wrapper.findComponent({ name: 'UnnnicDataTable' }).props('items')[0],
    ).toEqual({
      campaign: '-',
      conversations: '-',
      qualified: '-',
      conversions: '-',
      revenue: '-',
    });
  });

  it('hides pagination when there are 10 or fewer items', () => {
    wrapper = createWrapper({ campaignPerformanceCount: 10 });
    const table = wrapper.findComponent({ name: 'UnnnicDataTable' });

    expect(table.props('hidePagination')).toBe(true);
    expect(table.props('pageInterval')).toBe(10);
  });

  it('shows pagination when there are more than 10 items', () => {
    wrapper = createWrapper({ campaignPerformanceCount: 11 });
    const table = wrapper.findComponent({ name: 'UnnnicDataTable' });

    expect(table.props('hidePagination')).toBe(false);
  });

  it('hides pagination based on total count, not the current page length', () => {
    wrapper = createWrapper({
      campaignPerformanceCount: 11,
      campaignPerformanceOffset: 10,
      campaignPerformanceResults: [mockResults[0]],
    });
    const table = wrapper.findComponent({ name: 'UnnnicDataTable' });

    expect(table.props('items')).toHaveLength(1);
    expect(table.props('pageTotal')).toBe(11);
    expect(table.props('hidePagination')).toBe(false);
  });

  it('requests the next offset when the page changes', async () => {
    wrapper = createWrapper({ campaignPerformanceCount: 21 });
    const store = useCTWA();
    vi.clearAllMocks();

    await wrapper
      .findComponent({ name: 'UnnnicDataTable' })
      .vm.$emit('update:page', 2);

    expect(store.loadCampaignPerformanceData).toHaveBeenCalledWith(10);
  });

  it('computes the current page from the stored offset', () => {
    wrapper = createWrapper({
      campaignPerformanceCount: 21,
      campaignPerformanceOffset: 10,
    });

    expect(
      wrapper.findComponent({ name: 'UnnnicDataTable' }).props('page'),
    ).toBe(2);
  });

  it('passes loading state to the table', () => {
    wrapper = createWrapper({ loadingCampaignPerformance: true });

    expect(
      wrapper.findComponent({ name: 'UnnnicDataTable' }).props('isLoading'),
    ).toBe(true);
  });
});
