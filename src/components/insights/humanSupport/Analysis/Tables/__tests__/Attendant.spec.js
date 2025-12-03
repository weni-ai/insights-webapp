import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createTestingPinia } from '@pinia/testing';
import Attendant from '../Attendant.vue';

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
  formattedItems: { value: [] },
  hasMoreData: { value: false },
  loadMoreData: vi.fn(),
  resetAndLoadData: vi.fn(),
  handleSort: vi.fn(),
};

vi.mock('@/composables/useInfiniteScrollTable', () => ({
  useInfiniteScrollTable: vi.fn(() => mockInfiniteScroll),
}));

vi.mock(
  '@/services/api/resources/humanSupport/analysis/detailedAnalysis/attendant',
  () => ({
    default: {
      getDetailedAnalysisAttendantData: vi
        .fn()
        .mockResolvedValue({ results: [] }),
    },
  }),
);

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      human_support_dashboard: {
        columns: {
          common: {
            agent: 'Agent',
            total_attendances: 'Total',
            average_first_response_time: 'First Response',
            average_response_time: 'Avg Response',
            average_duration: 'Duration',
            time_in_service: 'Time in Service',
          },
        },
      },
    },
  },
});

config.global.plugins = [i18n];

describe('Attendant', () => {
  let wrapper;
  let store;

  const createWrapper = (storeState = {}) => {
    store = createTestingPinia({
      initialState: {
        humanSupport: {
          appliedDetailFilters: { agent: { value: '' } },
          appliedFilters: {},
          appliedDateRange: {},
          ...storeState,
        },
      },
    });

    return mount(Attendant, {
      global: {
        plugins: [store],
        stubs: { UnnnicDataTable: true },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mockInfiniteScroll, {
      isLoading: { value: false },
      isLoadingMore: { value: false },
      formattedItems: { value: [] },
      hasMoreData: { value: false },
    });
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('renders UnnnicDataTable with testid', () => {
      const table = wrapper.find('[data-testid="attendant-table"]');
      expect(table.exists()).toBe(true);
    });

    it('passes correct static props to table', () => {
      const table = wrapper.findComponent({ name: 'UnnnicDataTable' });
      expect(table.props('clickable')).toBe(true);
      expect(table.props('fixedHeaders')).toBe(true);
      expect(table.props('height')).toBe('500px');
      expect(table.props('infiniteScroll')).toBe(true);
      expect(table.props('hidePagination')).toBe(true);
      expect(table.props('size')).toBe('sm');
    });
  });

  describe('Headers', () => {
    it('generates correct headers with translations', () => {
      const headers = wrapper.vm.formattedHeaders;
      expect(headers).toHaveLength(6);
      expect(headers[0].itemKey).toBe('agent');
      expect(headers[1].itemKey).toBe('finished');
      expect(headers[1].title).toBe('Total');
      expect(headers.every((h) => h.isSortable)).toBe(true);
    });
  });

  describe('Event handlers', () => {
    it('handles sort changes', () => {
      const sortData = { header: 'Agent', itemKey: 'agent', order: 'desc' };
      wrapper.vm.handleSort(sortData);
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
      wrapper.vm.redirectItem({ link: null });
      expect(mockPostMessage).not.toHaveBeenCalled();
    });
  });

  describe('Lifecycle', () => {
    it('loads data on mount', () => {
      expect(mockInfiniteScroll.resetAndLoadData).toHaveBeenCalled();
    });
  });
});
