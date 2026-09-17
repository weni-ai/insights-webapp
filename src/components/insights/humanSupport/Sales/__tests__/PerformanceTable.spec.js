import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import { createTestingPinia } from '@pinia/testing';
import { UnnnicToolTip } from '@weni/unnnic-system';

import PerformanceTable from '../PerformanceTable.vue';
import { formatCurrency } from '@/utils/numbers';

vi.mock('date-fns', () => ({
  subDays: vi.fn((date) => date),
  format: vi.fn(() => '2024-01-15'),
  parseISO: vi.fn((str) => new Date(str)),
}));

vi.mock('@/utils/time', () => ({
  getLastNDays: vi.fn(() => ({ start: '2024-01-08', end: '2024-01-15' })),
  getTodayDate: vi.fn(() => ({ start: '2024-01-15', end: '2024-01-15' })),
}));

vi.mock('@/utils/numbers', () => ({
  formatNumber: vi.fn((value) => String(value)),
  formatCurrency: vi.fn((value, currency) => `${currency} ${value}`),
  formatPercentageFixed: vi.fn((value) => `${value}%`),
}));

const mockInfiniteScroll = {
  isLoading: ref(false),
  isLoadingMore: ref(false),
  formattedItems: { value: [] },
  hasMoreData: ref(false),
  loadMoreData: vi.fn(),
  resetAndLoadData: vi.fn(),
  handleSort: vi.fn(),
};

vi.mock('@/composables/useInfiniteScrollTable', () => ({
  useInfiniteScrollTable: vi.fn(() => mockInfiniteScroll),
}));

vi.mock(
  '@/services/api/resources/humanSupport/sales/perRepresentative',
  () => ({
    default: {
      getPerRepresentative: vi
        .fn()
        .mockResolvedValue({ results: [], count: 0 }),
    },
  }),
);

const increaseItem = {
  representative: 'Emma Wilson',
  conversations: 612,
  sales: 254,
  conversions: 41.5,
  revenue: 72340,
  average_order_value: 285,
  trend: {
    value: 12.4,
    variation_type: 'INCREASE',
  },
};

const decreaseItem = {
  representative: 'Daniel Okafor',
  conversations: 531,
  sales: 168,
  conversions: 31.6,
  revenue: 51470,
  average_order_value: 306,
  trend: {
    value: 2.3,
    variation_type: 'DECREASE',
  },
};

const UnnnicDataTableStub = {
  name: 'UnnnicDataTable',
  props: [
    'headers',
    'items',
    'isLoading',
    'isLoadingMore',
    'infiniteScroll',
    'infiniteScrollDisabled',
    'hidePagination',
    'fixedHeaders',
    'height',
    'size',
    'sort',
    'locale',
  ],
  template: `
    <div data-testid="performance-table-data">
      <slot name="header-average_order_value" />
      <slot name="header-trend" />
      <slot
        v-for="item in items"
        :key="item.representative"
        name="body-trend"
        :item="item"
      />
    </div>
  `,
};

describe('PerformanceTable', () => {
  let wrapper;

  const createWrapper = ({ items = [], currency = 'BRL' } = {}) => {
    Object.assign(mockInfiniteScroll.formattedItems, { value: items });

    return mount(PerformanceTable, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              config: {
                project: { uuid: 'test-project', currency },
              },
              humanSupport: {
                appliedFilters: {
                  sectors: [],
                  queues: [],
                  tags: [],
                  channels: [],
                },
                appliedDateRange: {
                  start: '2026-01-01',
                  end: '2026-01-31',
                },
              },
            },
          }),
        ],
        stubs: {
          UnnnicDataTable: UnnnicDataTableStub,
          UnnnicIcon: {
            name: 'UnnnicIcon',
            props: ['icon', 'size', 'scheme'],
            template: '<span />',
          },
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockInfiniteScroll.isLoading.value = false;
    mockInfiniteScroll.isLoadingMore.value = false;
    mockInfiniteScroll.hasMoreData.value = false;
    Object.assign(mockInfiniteScroll.formattedItems, { value: [] });
    wrapper = createWrapper({ items: [increaseItem] });
  });

  it('renders the table title', () => {
    expect(wrapper.find('[data-testid="performance-table-title"]').text()).toBe(
      'Performance by representative',
    );
  });

  it('passes infinite scroll props to the table', () => {
    const table = wrapper.findComponent({ name: 'UnnnicDataTable' });
    const props = table.props();
    const isTruthy = (val) => val === true || val === '';

    expect(isTruthy(props.infiniteScroll)).toBe(true);
    expect(isTruthy(props.hidePagination)).toBe(true);
    expect(isTruthy(props.fixedHeaders)).toBe(true);
    expect(props.height).toBe('500px');
    expect(props.size).toBe('sm');
  });

  it('generates headers with default revenue sort', () => {
    const table = wrapper.findComponent({ name: 'UnnnicDataTable' });
    const headers = table.props('headers');

    expect(headers.map((header) => header.itemKey)).toEqual([
      'representative',
      'conversations',
      'sales',
      'conversions',
      'revenue',
      'average_order_value',
      'trend',
    ]);
    expect(headers[0].isSortable).toBe(false);
    expect(headers[0].align).toBe('left');
    expect(headers.slice(1, 6).every((header) => header.isSortable)).toBe(true);
    expect(headers.slice(1).every((header) => header.align === 'right')).toBe(
      true,
    );
    expect(headers[6].isSortable).toBe(false);
    expect(table.props('sort')).toEqual({
      header: 'Revenue',
      itemKey: 'revenue',
      order: 'desc',
    });
  });

  it('formats money columns with the project currency', () => {
    const table = wrapper.findComponent({ name: 'UnnnicDataTable' });

    expect(table.props('items')[0].revenue).toBe('BRL 72340');
    expect(table.props('items')[0].average_order_value).toBe('BRL 285');
    expect(formatCurrency).toHaveBeenCalledWith(72340, 'BRL');
    expect(formatCurrency).toHaveBeenCalledWith(285, 'BRL');
  });

  it('formats money columns with a custom project currency', () => {
    wrapper = createWrapper({ items: [increaseItem], currency: 'USD' });
    const table = wrapper.findComponent({ name: 'UnnnicDataTable' });

    expect(table.props('items')[0].revenue).toBe('USD 72340');
    expect(formatCurrency).toHaveBeenCalledWith(72340, 'USD');
  });

  it('handles sort changes', () => {
    wrapper.vm.handleSort({
      header: 'Conversations',
      itemKey: 'conversations',
      order: 'asc',
    });

    expect(mockInfiniteScroll.handleSort).toHaveBeenCalled();
  });

  it('triggers only one data load when sort changes', async () => {
    vi.clearAllMocks();

    mockInfiniteScroll.handleSort.mockImplementation((sort, currentSort) => {
      currentSort.value = sort;
    });

    wrapper.vm.handleSort({
      header: 'Conversations',
      itemKey: 'conversations',
      order: 'asc',
    });

    await nextTick();

    expect(mockInfiniteScroll.resetAndLoadData).toHaveBeenCalledTimes(1);
  });

  it('handles load more', () => {
    wrapper.vm.loadMore();
    expect(mockInfiniteScroll.loadMoreData).toHaveBeenCalled();
  });

  it('renders increase trend with signed value and up icon', () => {
    const icons = wrapper.findAllComponents({ name: 'UnnnicIcon' });
    const trendIcon = icons.find(
      (icon) => icon.props('icon') === 'trending_up',
    );

    expect(trendIcon.exists()).toBe(true);
    expect(trendIcon.props('scheme')).toBe('fg-success');
    expect(
      wrapper.find('[data-testid="performance-table-trend-cell"]').text(),
    ).toContain('+12.4%');
  });

  it('renders decrease trend with signed value and down icon', () => {
    wrapper = createWrapper({ items: [decreaseItem] });

    const icons = wrapper.findAllComponents({ name: 'UnnnicIcon' });
    const trendIcon = icons.find(
      (icon) => icon.props('icon') === 'trending_down',
    );

    expect(trendIcon.exists()).toBe(true);
    expect(trendIcon.props('scheme')).toBe('fg-warning');
    expect(
      wrapper.find('[data-testid="performance-table-trend-cell"]').text(),
    ).toContain('-2.3%');
  });

  it('renders the AOV header tooltip', () => {
    const tooltip = wrapper
      .findAllComponents(UnnnicToolTip)
      .find((item) => item.props('text') === 'Average order value');

    expect(tooltip?.exists()).toBe(true);
    expect(tooltip?.props('side')).toBe('top');
    expect(tooltip?.text()).toContain('AOV');
  });

  it('renders the trend header tooltip', () => {
    const helpIcon = wrapper
      .findAllComponents({ name: 'UnnnicIcon' })
      .find((icon) => icon.props('icon') === 'help');
    const tooltip = wrapper
      .findAllComponents(UnnnicToolTip)
      .find((item) =>
        item
          .props('text')
          ?.includes("Percentage change in the representative's revenue"),
      );

    expect(wrapper.find('.performance-table__trend-header').exists()).toBe(
      true,
    );
    expect(helpIcon?.exists()).toBe(true);
    expect(helpIcon?.props('size')).toBe('sm');
    expect(tooltip?.exists()).toBe(true);
    expect(tooltip?.props('text')).toContain(
      "Percentage change in the representative's revenue",
    );
  });
});
