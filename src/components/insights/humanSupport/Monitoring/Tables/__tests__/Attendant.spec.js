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
  '@/services/api/resources/humanSupport/monitoring/detailedMonitoring/attendant',
  () => ({
    default: {
      getDetailedMonitoringAttendant: vi
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
          attendant: {
            status: 'Status',
            agent: 'Agent',
            ongoing: 'Ongoing',
            finished: 'Finished',
            average_first_response_time: 'First Response',
            average_response_time: 'Avg Response',
            average_duration: 'Duration',
            time_in_service: 'Time in Service',
            action: 'Action',
          },
        },
      },
    },
  },
});

config.global.plugins = [i18n];

describe('Attendant', () => {
  let wrapper;

  const createWrapper = (storeState = {}) =>
    mount(Attendant, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              humanSupport: {
                appliedDetailFilters: { agent: { value: '' } },
                appliedFilters: {},
                ...storeState.humanSupport,
              },
              humanSupportMonitoring: {
                refreshDataMonitoring: false,
                isSilentRefresh: false,
                activeDetailedTab: 'attendant',
                ...storeState.humanSupportMonitoring,
              },
            },
          }),
        ],
        stubs: {
          UnnnicDataTable: true,
          DisconnectAgent: true,
          AgentStatus: true,
        },
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
      expect(wrapper.find('[data-testid="attendant-table"]').exists()).toBe(
        true,
      );
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
      expect(headers).toHaveLength(9);
      expect(headers[0].itemKey).toBe('status');
      expect(headers[8].itemKey).toBe('action');
      expect(headers[8].isSortable).toBe(false);
      expect(headers[8].align).toBe('center');
      expect(headers.slice(0, 8).every((h) => h.isSortable)).toBe(true);
    });
  });

  describe('Event handlers', () => {
    it('handles sort changes', () => {
      wrapper.vm.handleSort({
        header: 'Status',
        itemKey: 'status',
        order: 'asc',
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

  describe('Monitoring refresh', () => {
    it('reloads data when refreshDataMonitoring changes and tab is attendant', async () => {
      vi.clearAllMocks();
      const store = wrapper.vm.$pinia.state.value.humanSupportMonitoring;
      store.refreshDataMonitoring = true;
      await wrapper.vm.$nextTick();
      expect(mockInfiniteScroll.resetAndLoadData).toHaveBeenCalled();
    });

    it('does not reload when tab is not attendant', async () => {
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

  describe('Status label logic', () => {
    it('returns custom statusLabel when status is "custom" and statusLabel is provided', () => {
      const result = wrapper.vm.getStatusLabel('custom', 'Em pausa');
      expect(result).toBe('Em pausa');
    });

    it('returns "custom" when status is "custom" but no statusLabel is provided', () => {
      const result = wrapper.vm.getStatusLabel('custom');
      expect(result).toBe('custom');
    });

    it('returns "custom" when status is "custom" and statusLabel is empty string', () => {
      const result = wrapper.vm.getStatusLabel('custom', '');
      expect(result).toBe('custom');
    });

    it('returns the original status when status is not "custom"', () => {
      const result = wrapper.vm.getStatusLabel('online');
      expect(result).toBe('online');
    });

    it('returns the original status when status is not "custom" even if statusLabel is provided', () => {
      const result = wrapper.vm.getStatusLabel('offline', 'Custom Label');
      expect(result).toBe('offline');
    });
  });
});
