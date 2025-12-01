import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createTestingPinia } from '@pinia/testing';
import Pauses from '../Pauses.vue';

vi.mock('date-fns', () => ({
  subDays: vi.fn((date) => date),
  format: vi.fn(() => '2024-01-15'),
  parseISO: vi.fn((str) => new Date(str)),
}));

vi.mock('@/utils/time', () => ({
  formatSecondsToTime: vi.fn((seconds) => `${seconds}s`),
  getLastNDays: vi.fn(() => ({ start: '2024-01-08', end: '2024-01-15' })),
}));

const mockInfiniteScroll = {
  isLoading: { value: false },
  isLoadingMore: { value: false },
  formattedItems: {
    value: [
      {
        agent: 'Agent 1',
        custom_status: [
          { status_type: 'Break', break_time: 300 },
          { status_type: 'Lunch', break_time: 600 },
        ],
      },
    ],
  },
  hasMoreData: { value: false },
  loadMoreData: vi.fn(),
  resetAndLoadData: vi.fn(),
  handleSort: vi.fn(),
};

vi.mock('@/composables/useInfiniteScrollTable', () => ({
  useInfiniteScrollTable: vi.fn(() => mockInfiniteScroll),
}));

vi.mock(
  '@/services/api/resources/humanSupport/monitoring/detailedMonitoring/pauses',
  () => ({
    default: {
      getDetailedMonitoringPauses: vi.fn().mockResolvedValue({ results: [] }),
    },
  }),
);

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      human_support_dashboard: {
        detailed_monitoring: { pauses: { attendant: 'Attendant' } },
      },
    },
  },
});

config.global.plugins = [i18n];

describe('Pauses', () => {
  let wrapper;

  const createWrapper = (storeState = {}) =>
    mount(Pauses, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              humanSupport: {
                appliedDetailFilters: { agent: { value: '' } },
                appliedFilters: {},
                appliedDateRange: {},
                ...storeState.humanSupport,
              },
              humanSupportMonitoring: {
                refreshDataMonitoring: false,
                activeDetailedTab: 'pauses',
                ...storeState.humanSupportMonitoring,
              },
            },
          }),
        ],
        stubs: { UnnnicDataTable: true, UnnnicToolTip: true },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mockInfiniteScroll.formattedItems, {
      value: [
        {
          agent: 'Agent 1',
          custom_status: [
            { status_type: 'Break', break_time: 300 },
            { status_type: 'Lunch', break_time: 600 },
          ],
        },
      ],
    });
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('renders UnnnicDataTable with testid', () => {
      expect(wrapper.find('[data-testid="pauses-table"]').exists()).toBe(true);
    });

    it('passes correct static props to table', () => {
      const table = wrapper.findComponent({ name: 'UnnnicDataTable' });
      expect(table.props('clickable')).toBe(true);
      expect(table.props('fixedHeaders')).toBe(true);
      expect(table.props('height')).toBe('600px');
    });
  });

  describe('Custom status types', () => {
    it('extracts unique status types from items', () => {
      const types = wrapper.vm.customStatusTypes;
      expect(types).toEqual(['Break', 'Lunch']);
    });

    it('returns empty array when no items', () => {
      Object.assign(mockInfiniteScroll.formattedItems, { value: [] });
      const newWrapper = createWrapper();
      expect(newWrapper.vm.customStatusTypes).toEqual([]);
    });

    it('sorts status types alphabetically', () => {
      Object.assign(mockInfiniteScroll.formattedItems, {
        value: [
          {
            agent: 'Agent 1',
            custom_status: [
              { status_type: 'Zebra', break_time: 100 },
              { status_type: 'Alpha', break_time: 200 },
            ],
          },
        ],
      });
      const newWrapper = createWrapper();
      expect(newWrapper.vm.customStatusTypes).toEqual(['Alpha', 'Zebra']);
    });
  });

  describe('Dynamic headers', () => {
    it('generates base agent header', () => {
      const headers = wrapper.vm.formattedHeaders;
      expect(headers[0].itemKey).toBe('agent');
      expect(headers[0].title).toBe('Attendant');
      expect(headers[0].isSortable).toBe(true);
    });

    it('generates dynamic headers for custom statuses', () => {
      const headers = wrapper.vm.formattedHeaders;
      expect(headers).toHaveLength(3);
      expect(headers[1].itemKey).toBe('Break');
      expect(headers[2].itemKey).toBe('Lunch');
      expect(headers[1].isSortable).toBe(false);
    });
  });

  describe('Formatted items', () => {
    it('transforms custom status to object properties', () => {
      const items = wrapper.vm.formattedItems;
      expect(items[0].agent).toBe('Agent 1');
      expect(items[0].Break).toBe('300s');
      expect(items[0].Lunch).toBe('600s');
    });
  });

  describe('Event handlers', () => {
    it('handles sort changes', () => {
      wrapper.vm.handleSort({
        header: 'Agent',
        itemKey: 'agent',
        order: 'desc',
      });
      expect(mockInfiniteScroll.handleSort).toHaveBeenCalled();
    });

    it('handles load more', () => {
      wrapper.vm.loadMore();
      expect(mockInfiniteScroll.loadMoreData).toHaveBeenCalled();
    });

    it('handles redirect with valid link', () => {
      const mockPostMessage = vi.fn();
      window.parent.postMessage = mockPostMessage;
      wrapper.vm.redirectItem({ link: { url: '/test' } });
      expect(mockPostMessage).toHaveBeenCalledWith(
        { event: 'redirect', path: '/test/insights' },
        '*',
      );
    });

    it('does not redirect without link', () => {
      const mockPostMessage = vi.fn();
      window.parent.postMessage = mockPostMessage;
      wrapper.vm.redirectItem({});
      expect(mockPostMessage).not.toHaveBeenCalled();
    });
  });

  describe('Lifecycle', () => {
    it('loads data on mount', () => {
      expect(mockInfiniteScroll.resetAndLoadData).toHaveBeenCalled();
    });
  });
});
