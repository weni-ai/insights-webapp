import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createTestingPinia } from '@pinia/testing';
import Finished from '../Finished.vue';

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
  '@/services/api/resources/humanSupport/analysis/detailedAnalysis/finished',
  () => ({
    default: {
      getDetailedAnalysisFinishedData: vi
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
            sector: 'Sector',
            queue: 'Queue',
            awaiting_time: 'Awaiting',
            first_response_time: 'First Response',
            duration: 'Duration',
            contact: 'Contact',
            ticket_id: 'Ticket',
          },
        },
      },
    },
  },
});

config.global.plugins = [i18n];

describe('Finished', () => {
  let wrapper;

  const createWrapper = (storeState = {}) =>
    mount(Finished, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              humanSupport: {
                appliedDetailFilters: {
                  agent: { value: '' },
                  contact: { value: '' },
                  ticketId: { value: '' },
                },
                appliedFilters: {},
                appliedDateRange: {},
                ...storeState,
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
      expect(wrapper.find('[data-testid="finished-table"]').exists()).toBe(
        true,
      );
    });

    it('passes correct static props to table', () => {
      const table = wrapper.findComponent({ name: 'UnnnicDataTable' });
      expect(table.props('clickable')).toBe(true);
      expect(table.props('fixedHeaders')).toBe(true);
      expect(table.props('height')).toBe('500px');
      expect(table.props('size')).toBe('sm');
    });
  });

  describe('Headers', () => {
    it('generates correct headers with translations', () => {
      const headers = wrapper.vm.formattedHeaders;
      expect(headers).toHaveLength(8);
      expect(headers[0].itemKey).toBe('agent');
      expect(headers[7].itemKey).toBe('ticket_id');
      expect(headers.every((h) => h.isSortable)).toBe(true);
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
        { event: 'redirect', path: '/test' },
        '*',
      );
    });

    it('removes slash after chats: protocol', () => {
      const mockPostMessage = vi.fn();
      window.parent.postMessage = mockPostMessage;
      wrapper.vm.redirectItem({
        link: {
          url: 'chats:/closed-chats/516833fb-559e-48ba-9e37-9c3f9f487a03',
        },
      });
      expect(mockPostMessage).toHaveBeenCalledWith(
        {
          event: 'redirect',
          path: 'chats:closed-chats/516833fb-559e-48ba-9e37-9c3f9f487a03',
        },
        '*',
      );
    });

    it('does not modify url when chats: has no slash', () => {
      const mockPostMessage = vi.fn();
      window.parent.postMessage = mockPostMessage;
      wrapper.vm.redirectItem({
        link: {
          url: 'chats:closed-chats/516833fb-559e-48ba-9e37-9c3f9f487a03',
        },
      });
      expect(mockPostMessage).toHaveBeenCalledWith(
        {
          event: 'redirect',
          path: 'chats:closed-chats/516833fb-559e-48ba-9e37-9c3f9f487a03',
        },
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
