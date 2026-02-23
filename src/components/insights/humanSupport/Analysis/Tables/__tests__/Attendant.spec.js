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
      expect(headers[5].itemKey).toBe('time_in_service');
      expect(headers[5].isSortable).toBe(false);
      expect(headers.slice(0, 5).every((h) => h.isSortable)).toBe(true);
    });
  });

  describe('Event handlers', () => {
    it('handles sort changes', () => {
      const sortData = { header: 'Agent', itemKey: 'agent', order: 'desc' };
      wrapper.vm.handleSort(sortData);
      expect(mockInfiniteScroll.handleSort).toHaveBeenCalled();
    });

    it('triggers only one data load when sort changes (no double request)', async () => {
      vi.clearAllMocks();

      mockInfiniteScroll.handleSort.mockImplementation((sort, currentSort) => {
        currentSort.value = sort;
      });

      wrapper.vm.handleSort({
        header: 'Agent',
        itemKey: 'agent',
        order: 'desc',
      });

      await wrapper.vm.$nextTick();

      expect(mockInfiniteScroll.resetAndLoadData).toHaveBeenCalledTimes(1);
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

    it('loads data only once on mount (no double request)', () => {
      vi.clearAllMocks();
      const newWrapper = createWrapper();
      expect(mockInfiniteScroll.resetAndLoadData).toHaveBeenCalledTimes(1);
    });

    it('reloads data when filters change after mount', async () => {
      vi.clearAllMocks();
      const store = wrapper.vm.$pinia.state.value.humanSupport;
      store.appliedFilters = { test: 'value' };
      await wrapper.vm.$nextTick();
      expect(mockInfiniteScroll.resetAndLoadData).toHaveBeenCalled();
    });
  });

  describe('Agent fallback logic', () => {
    it('uses agent when it has a value', () => {
      const mockData = [
        {
          agent: 'John Doe',
          agent_email: 'john@example.com',
          average_first_response_time: 100,
          average_response_time: 200,
          average_duration: 300,
          time_in_service: 400,
        },
      ];
      const result = wrapper.vm.formatResults(mockData);
      expect(result[0].agent).toBe('John Doe');
    });

    it('uses agent_email when agent is empty string', () => {
      const mockData = [
        {
          agent: '',
          agent_email: 'john@example.com',
          average_first_response_time: 100,
          average_response_time: 200,
          average_duration: 300,
          time_in_service: 400,
        },
      ];
      const result = wrapper.vm.formatResults(mockData);
      expect(result[0].agent).toBe('john@example.com');
    });

    it('uses agent_email when agent is null', () => {
      const mockData = [
        {
          agent: null,
          agent_email: 'john@example.com',
          average_first_response_time: 100,
          average_response_time: 200,
          average_duration: 300,
          time_in_service: 400,
        },
      ];
      const result = wrapper.vm.formatResults(mockData);
      expect(result[0].agent).toBe('john@example.com');
    });

    it('uses agent_email when agent is undefined', () => {
      const mockData = [
        {
          agent_email: 'john@example.com',
          average_first_response_time: 100,
          average_response_time: 200,
          average_duration: 300,
          time_in_service: 400,
        },
      ];
      const result = wrapper.vm.formatResults(mockData);
      expect(result[0].agent).toBe('john@example.com');
    });

    it('returns empty string when both agent and agent_email are empty', () => {
      const mockData = [
        {
          agent: '',
          agent_email: '',
          average_first_response_time: 100,
          average_response_time: 200,
          average_duration: 300,
          time_in_service: 400,
        },
      ];
      const result = wrapper.vm.formatResults(mockData);
      expect(result[0].agent).toBe('');
    });

    it('returns empty string when both agent and agent_email are null/undefined', () => {
      const mockData = [
        {
          agent: null,
          agent_email: null,
          average_first_response_time: 100,
          average_response_time: 200,
          average_duration: 300,
          time_in_service: 400,
        },
      ];
      const result = wrapper.vm.formatResults(mockData);
      expect(result[0].agent).toBe('');
    });
  });
});
