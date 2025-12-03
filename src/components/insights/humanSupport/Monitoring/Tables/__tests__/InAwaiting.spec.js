import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createTestingPinia } from '@pinia/testing';
import InAwaiting from '../InAwaiting.vue';

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
  '@/services/api/resources/humanSupport/monitoring/detailedMonitoring/inAwaiting',
  () => ({
    default: {
      getDetailedMonitoringInAwaiting: vi
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
          in_awaiting: {
            awaiting_time: 'Awaiting Time',
            contact: 'Contact',
            sector: 'Sector',
            queue: 'Queue',
          },
        },
      },
    },
  },
});

config.global.plugins = [i18n];

describe('InAwaiting', () => {
  let wrapper;

  const createWrapper = (storeState = {}) =>
    mount(InAwaiting, {
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
                activeDetailedTab: 'in_awaiting',
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
      expect(wrapper.find('[data-testid="in-awaiting-table"]').exists()).toBe(
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
      expect(headers).toHaveLength(4);
      expect(headers[0].itemKey).toBe('awaiting_time');
      expect(headers[3].itemKey).toBe('queue');
      expect(headers.every((h) => h.isSortable)).toBe(true);
    });
  });

  describe('Event handlers', () => {
    it('handles sort changes', () => {
      wrapper.vm.handleSort({
        header: 'Awaiting Time',
        itemKey: 'awaiting_time',
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
        { event: 'redirect', path: '/test' },
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
    it('reloads data when refreshDataMonitoring changes and tab is in_awaiting', async () => {
      vi.clearAllMocks();
      const store = wrapper.vm.$pinia.state.value.humanSupportMonitoring;
      store.refreshDataMonitoring = true;
      await wrapper.vm.$nextTick();
      expect(mockInfiniteScroll.resetAndLoadData).toHaveBeenCalled();
    });

    it('does not reload when tab is not in_awaiting', async () => {
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
