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
      expect(headers[7].itemKey).toBe('time_in_service');
      expect(headers[7].isSortable).toBe(false);
      expect(headers[8].itemKey).toBe('action');
      expect(headers[8].isSortable).toBe(false);
      expect(headers[8].align).toBe('center');
      expect(headers.slice(0, 7).every((h) => h.isSortable)).toBe(true);
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

      // Mock resetAndLoadData to simulate async behavior
      let resolveRequest;
      const requestPromise = new Promise((resolve) => {
        resolveRequest = resolve;
      });
      mockInfiniteScroll.resetAndLoadData.mockReturnValue(requestPromise);

      // Trigger multiple changes rapidly
      wrapper.vm.loadDataSafely(wrapper.vm.currentSort);
      wrapper.vm.loadDataSafely(wrapper.vm.currentSort);
      wrapper.vm.loadDataSafely(wrapper.vm.currentSort);

      await wrapper.vm.$nextTick();

      // Should only call once
      expect(mockInfiniteScroll.resetAndLoadData).toHaveBeenCalledTimes(1);

      // Resolve the request
      resolveRequest();
      await requestPromise;
      await wrapper.vm.$nextTick();

      // Now a new request can be made
      wrapper.vm.loadDataSafely(wrapper.vm.currentSort);
      await wrapper.vm.$nextTick();

      expect(mockInfiniteScroll.resetAndLoadData).toHaveBeenCalledTimes(2);
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

  describe('Agent fallback logic (v2 format)', () => {
    it('uses agent name when it has a value', () => {
      const mockData = [
        {
          agent: { name: 'John Doe', email: 'john@example.com' },
          average_first_response_time: 100,
          average_response_time: 200,
          average_duration: 300,
          time_in_service: 400,
        },
      ];
      const result = wrapper.vm.formatResults(mockData);
      expect(result[0].agent).toBe('John Doe');
    });

    it('falls back to agent email when name is empty', () => {
      const mockData = [
        {
          agent: { name: '', email: 'john@example.com' },
          average_first_response_time: 100,
          average_response_time: 200,
          average_duration: 300,
          time_in_service: 400,
        },
      ];
      const result = wrapper.vm.formatResults(mockData);
      expect(result[0].agent).toBe('john@example.com');
    });

    it('returns empty string when both name and email are empty', () => {
      const mockData = [
        {
          agent: { name: '', email: '' },
          average_first_response_time: 100,
          average_response_time: 200,
          average_duration: 300,
          time_in_service: 400,
        },
      ];
      const result = wrapper.vm.formatResults(mockData);
      expect(result[0].agent).toBe('');
    });

    it('returns null when agent is null', () => {
      const mockData = [
        {
          agent: null,
          average_first_response_time: 100,
          average_response_time: 200,
          average_duration: 300,
          time_in_service: 400,
        },
      ];
      const result = wrapper.vm.formatResults(mockData);
      expect(result[0].agent).toBeNull();
    });

    it('exposes agent_email from agent object', () => {
      const mockData = [
        {
          agent: { name: 'John Doe', email: 'john@example.com' },
          average_first_response_time: 100,
          average_response_time: 200,
          average_duration: 300,
          time_in_service: 400,
        },
      ];
      const result = wrapper.vm.formatResults(mockData);
      expect(result[0].agent_email).toBe('john@example.com');
    });

    it('returns empty agent_email when agent is null', () => {
      const mockData = [
        {
          agent: null,
          average_first_response_time: 100,
          average_response_time: 200,
          average_duration: 300,
          time_in_service: 400,
        },
      ];
      const result = wrapper.vm.formatResults(mockData);
      expect(result[0].agent_email).toBe('');
    });

    it('carries agent_is_deleted when is_deleted is true', () => {
      const mockData = [
        {
          agent: {
            name: 'John Doe',
            email: 'john@example.com',
            is_deleted: true,
          },
          average_first_response_time: 100,
          average_response_time: 200,
          average_duration: 300,
          time_in_service: 400,
        },
      ];
      const result = wrapper.vm.formatResults(mockData);
      expect(result[0].agent_is_deleted).toBe(true);
    });

    it('sets agent_is_deleted to false when is_deleted is not present', () => {
      const mockData = [
        {
          agent: { name: 'John Doe', email: 'john@example.com' },
          average_first_response_time: 100,
          average_response_time: 200,
          average_duration: 300,
          time_in_service: 400,
        },
      ];
      const result = wrapper.vm.formatResults(mockData);
      expect(result[0].agent_is_deleted).toBe(false);
    });

    it('sets agent_is_deleted to false when agent is null', () => {
      const mockData = [
        {
          agent: null,
          average_first_response_time: 100,
          average_response_time: 200,
          average_duration: 300,
          time_in_service: 400,
        },
      ];
      const result = wrapper.vm.formatResults(mockData);
      expect(result[0].agent_is_deleted).toBe(false);
    });
  });

  describe('Status flattening (v2 format)', () => {
    it('flattens status object into status and status_label', () => {
      const mockData = [
        {
          agent: { name: 'John Doe', email: 'john@example.com' },
          status: { status: 'custom', label: 'Em pausa' },
          average_first_response_time: 100,
          average_response_time: 200,
          average_duration: 300,
          time_in_service: 400,
        },
      ];
      const result = wrapper.vm.formatResults(mockData);
      expect(result[0].status).toBe('custom');
      expect(result[0].status_label).toBe('Em pausa');
    });

    it('returns empty strings when status is missing', () => {
      const mockData = [
        {
          agent: { name: 'John Doe', email: 'john@example.com' },
          average_first_response_time: 100,
          average_response_time: 200,
          average_duration: 300,
          time_in_service: 400,
        },
      ];
      const result = wrapper.vm.formatResults(mockData);
      expect(result[0].status).toBe('');
      expect(result[0].status_label).toBe('');
    });
  });
});
