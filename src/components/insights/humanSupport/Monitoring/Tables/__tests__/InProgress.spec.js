import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createTestingPinia } from '@pinia/testing';
import InProgress from '../InProgress.vue';

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
  '@/services/api/resources/humanSupport/monitoring/detailedMonitoring/inProgress',
  () => ({
    default: {
      getDetailedMonitoringInProgress: vi
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
        detailed_monitoring: {
          in_progress: {
            duration: 'Duration',
            awaiting_time: 'Awaiting Time',
            first_response_time: 'First Response',
            attendant: 'Attendant',
            sector: 'Sector',
            queue: 'Queue',
            contact: 'Contact',
          },
        },
      },
    },
  },
});

config.global.plugins = [i18n];

describe('InProgress', () => {
  let wrapper;

  const createWrapper = (storeState = {}) =>
    mount(InProgress, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              humanSupport: {
                appliedFilters: {},
                ...storeState.humanSupport,
              },
              humanSupportMonitoring: {
                refreshDataMonitoring: false,
                isSilentRefresh: false,
                activeDetailedTab: 'in_progress',
                ...storeState.humanSupportMonitoring,
              },
            },
          }),
        ],
        stubs: { UnnnicDataTable: true },
      },
    });

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
      expect(wrapper.find('[data-testid="in-progress-table"]').exists()).toBe(
        true,
      );
    });

    it('passes correct static props to table', () => {
      const table = wrapper.findComponent({ name: 'UnnnicDataTable' });
      expect(table.props('clickable')).toBe(true);
      expect(table.props('fixedHeaders')).toBe(true);
      expect(table.props('height')).toBe('500px');
    });
  });

  describe('Headers', () => {
    it('generates correct headers with translations', () => {
      const headers = wrapper.vm.formattedHeaders;
      expect(headers).toHaveLength(7);
      expect(headers[0].itemKey).toBe('duration');
      expect(headers[3].itemKey).toBe('agent');
      expect(headers[3].title).toBe('Attendant');
      expect(headers.every((h) => h.isSortable)).toBe(true);
    });
  });

  describe('Event handlers', () => {
    it('handles sort changes', () => {
      wrapper.vm.handleSort({
        header: 'Duration',
        itemKey: 'duration',
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

    it('prevents multiple simultaneous requests', async () => {
      vi.clearAllMocks();
      
      let resolveRequest;
      const requestPromise = new Promise((resolve) => {
        resolveRequest = resolve;
      });
      mockInfiniteScroll.resetAndLoadData.mockReturnValue(requestPromise);
      
      wrapper.vm.loadDataSafely(wrapper.vm.currentSort);
      wrapper.vm.loadDataSafely(wrapper.vm.currentSort);
      wrapper.vm.loadDataSafely(wrapper.vm.currentSort);
      
      await wrapper.vm.$nextTick();
      
      expect(mockInfiniteScroll.resetAndLoadData).toHaveBeenCalledTimes(1);
      
      resolveRequest();
      await requestPromise;
      await wrapper.vm.$nextTick();
      
      wrapper.vm.loadDataSafely(wrapper.vm.currentSort);
      await wrapper.vm.$nextTick();
      
      expect(mockInfiniteScroll.resetAndLoadData).toHaveBeenCalledTimes(2);
    });
  });

  describe('Monitoring refresh', () => {
    it('reloads data when refreshDataMonitoring changes and tab is in_progress', async () => {
      vi.clearAllMocks();
      const store = wrapper.vm.$pinia.state.value.humanSupportMonitoring;
      store.refreshDataMonitoring = true;
      await wrapper.vm.$nextTick();
      expect(mockInfiniteScroll.resetAndLoadData).toHaveBeenCalled();
    });

    it('does not reload when tab is not in_progress', async () => {
      wrapper = createWrapper({
        humanSupportMonitoring: { activeDetailedTab: 'other' },
      });
      vi.clearAllMocks();
      const store = wrapper.vm.$pinia.state.value.humanSupportMonitoring;
      store.refreshDataMonitoring = true;
      await wrapper.vm.$nextTick();
      expect(mockInfiniteScroll.resetAndLoadData).not.toHaveBeenCalled();
    });
  });
});
