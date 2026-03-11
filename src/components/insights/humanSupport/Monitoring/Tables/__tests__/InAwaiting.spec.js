import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
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
                isSilentRefresh: false,
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

    it('triggers only one data load when sort changes (no double request)', async () => {
      vi.clearAllMocks();

      mockInfiniteScroll.handleSort.mockImplementation((sort, currentSort) => {
        currentSort.value = sort;
      });

      wrapper.vm.handleSort({
        header: 'Awaiting Time',
        itemKey: 'awaiting_time',
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

    describe('Middle click (auxclick)', () => {
      const createMockRow = (items) => {
        const tbody = document.createElement('tbody');
        items.forEach(() => {
          const row = document.createElement('tr');
          row.className =
            'unnnic-data-table__body-row unnnic-data-table__body-row--clickable';
          tbody.appendChild(row);
        });
        return tbody;
      };

      it('opens in new tab on middle click of a valid row', () => {
        const mockPostMessage = vi.fn();
        window.parent.postMessage = mockPostMessage;

        const items = [{ link: { url: '/test' } }];
        mockInfiniteScroll.formattedItems.value = items;

        const tbody = createMockRow(items);
        const mockEvent = {
          button: 1,
          target: tbody.children[0],
          preventDefault: vi.fn(),
        };

        wrapper.vm.handleAuxClick(mockEvent);

        expect(mockPostMessage).toHaveBeenCalledWith(
          { event: 'redirect', path: '/test', newTab: true },
          '*',
        );
        expect(mockEvent.preventDefault).toHaveBeenCalled();
      });

      it('does not redirect on non-middle click', () => {
        const mockPostMessage = vi.fn();
        window.parent.postMessage = mockPostMessage;

        wrapper.vm.handleAuxClick({ button: 0 });

        expect(mockPostMessage).not.toHaveBeenCalled();
      });

      it('does not redirect when clicking outside a data row', () => {
        const mockPostMessage = vi.fn();
        window.parent.postMessage = mockPostMessage;

        const mockEvent = {
          button: 1,
          target: document.createElement('div'),
          preventDefault: vi.fn(),
        };

        wrapper.vm.handleAuxClick(mockEvent);

        expect(mockPostMessage).not.toHaveBeenCalled();
      });

      it('does not redirect when item has no link', () => {
        const mockPostMessage = vi.fn();
        window.parent.postMessage = mockPostMessage;

        const items = [{}];
        mockInfiniteScroll.formattedItems.value = items;

        const tbody = createMockRow(items);
        const mockEvent = {
          button: 1,
          target: tbody.children[0],
          preventDefault: vi.fn(),
        };

        wrapper.vm.handleAuxClick(mockEvent);

        expect(mockPostMessage).not.toHaveBeenCalled();
      });
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
