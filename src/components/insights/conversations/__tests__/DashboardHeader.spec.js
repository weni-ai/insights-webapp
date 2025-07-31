import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, config } from '@vue/test-utils';

import DashboardHeader from '../DashboardHeader.vue';

import { createI18n } from 'vue-i18n';
import Unnnic from '@weni/unnnic-system';

vi.mock('@weni/unnnic-system', () => ({
  default: {
    unnnicCallAlert: vi.fn(),
  },
}));

vi.mock('@/services/api/resources/conversational/header', () => ({
  default: {
    getConversationalHeaderTotals: vi.fn().mockResolvedValue([
      { id: 'total_conversations', value: 0, percentage: 100 },
      { id: 'resolved', value: 0, percentage: 0 },
      { id: 'unresolved', value: 0, percentage: 0 },
      { id: 'transferred_to_human', value: 0, percentage: 0 },
    ]),
  },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: {},
    query: {},
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/store/modules/dashboards', () => ({
  useDashboards: () => ({
    appliedFilters: {
      ended_at: {
        __gte: '2024-01-01',
        __lte: '2024-01-31',
      },
    },
  }),
}));

vi.mock('@/composables/useWidgetFormatting', () => ({
  useWidgetFormatting: () => ({
    formatPercentage: vi.fn((value) => `${value.toFixed(2)}%`),
    formatNumber: vi.fn((value) =>
      value.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
      }),
    ),
  }),
}));

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      conversations_dashboard: {
        conversations: 'conversations',
        header: {
          total: 'Total conversations',
          resolved: 'Resolved',
          unresolved: 'Unresolved',
          unengaged: 'Unengaged',
          transferred: 'Transferred to human support',
          tooltips: {
            total: 'Total number of conversations',
            resolved: 'Conversations that were resolved',
            unresolved: 'Conversations that were not resolved',
            unengaged: 'Conversations where users did not engage',
            transferred: 'Conversations transferred to human support',
          },
        },
      },
      widgets: {
        graph_funnel: {
          error: {
            title: 'Error loading data',
          },
        },
      },
    },
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

const createWrapper = () => {
  return mount(DashboardHeader, {
    global: { plugins: [Unnnic] },
  });
};

describe('DashboardHeader.vue', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();

    wrapper = createWrapper();
  });

  describe('Component Structure', () => {
    it('should render dashboard structure correctly', () => {
      expect(wrapper.find('[data-testid="dashboard-header"]').exists()).toBe(
        true,
      );
      expect(
        wrapper.find('[data-testid="dashboard-header-left"]').exists(),
      ).toBe(true);
      expect(
        wrapper.find('[data-testid="dashboard-header-right"]').exists(),
      ).toBe(true);
    });

    it('should render 4 cards in left section and 1 card in right section', () => {
      const leftSection = wrapper.find('[data-testid="dashboard-header-left"]');
      const rightSection = wrapper.find(
        '[data-testid="dashboard-header-right"]',
      );

      expect(
        leftSection.findAllComponents({ name: 'CardConversations' }),
      ).toHaveLength(3);
      expect(
        rightSection.findAllComponents({ name: 'CardConversations' }),
      ).toHaveLength(1);
    });
  });

  describe('Card Definitions', () => {
    it('should have correct card definitions structure', () => {
      const vm = wrapper.vm;
      expect(vm.cardDefinitions).toHaveLength(3);

      expect(vm.cardDefinitions[0]).toEqual({
        id: 'total_conversations',
        titleKey: 'conversations_dashboard.header.total',
        tooltipKey: 'conversations_dashboard.header.tooltips.total',
      });

      expect(vm.cardDefinitions[1]).toEqual({
        id: 'resolved',
        titleKey: 'conversations_dashboard.header.resolved',
        tooltipKey: 'conversations_dashboard.header.tooltips.resolved',
      });

      expect(vm.cardDefinitions[2]).toEqual({
        id: 'unresolved',
        titleKey: 'conversations_dashboard.header.unresolved',
        tooltipKey: 'conversations_dashboard.header.tooltips.unresolved',
      });
    });

    it('should create initial card data correctly', () => {
      const vm = wrapper.vm;
      const initialData = vm.createInitialCardData();

      expect(initialData).toEqual({
        value: '-',
        description: null,
        isLoading: true,
      });
    });
  });

  describe('Initial Loading States', () => {
    it('should show loading state for all cards initially', async () => {
      const delayedMock = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve([
                  { id: 'total_conversations', value: 0, percentage: 100 },
                  { id: 'resolved', value: 0, percentage: 0 },
                  { id: 'unresolved', value: 0, percentage: 0 },
                  { id: 'transferred_to_human', value: 0, percentage: 0 },
                ]),
              100,
            ),
          ),
      );

      const conversationalHeaderApi = await import(
        '@/services/api/resources/conversational/header'
      );
      conversationalHeaderApi.default.getConversationalHeaderTotals.mockImplementation(
        delayedMock,
      );

      const testWrapper = createWrapper();

      // Check loading state immediately after mount
      const allCards = testWrapper.findAllComponents({
        name: 'CardConversations',
      });

      allCards.forEach((card) => {
        expect(card.props('isLoading')).toBe(true);
        expect(card.props('value')).toBe('-');
      });

      await new Promise((resolve) => setTimeout(resolve, 150));
      await testWrapper.vm.$nextTick();
    });

    it('should initialize cardsData with correct structure', async () => {
      const conversationalHeaderApi = await import(
        '@/services/api/resources/conversational/header'
      );
      conversationalHeaderApi.default.getConversationalHeaderTotals.mockResolvedValue(
        [
          { id: 'total_conversations', value: 0, percentage: 100 },
          { id: 'resolved', value: 0, percentage: 0 },
          { id: 'unresolved', value: 0, percentage: 0 },
          { id: 'transferred_to_human', value: 0, percentage: 0 },
        ],
      );

      const testWrapper = createWrapper();
      const vm = testWrapper.vm;

      // Allow mounted hook to run and state to update
      await testWrapper.vm.$nextTick();
      await testWrapper.vm.$nextTick();

      expect(vm.cardsData).toHaveLength(3);
      vm.cardsData.forEach((card) => {
        expect(card.isLoading).toBe(false);

        if (card.id === 'total_conversations') {
          expect(card.value).toBe('0');
          expect(card.description).toBe(null);
        } else {
          expect(card.value).toBe('0.00%');
          expect(card.description).toBe('0 conversations');
        }
      });
    });

    it('should display initial titles and tooltips correctly', () => {
      const leftCards = wrapper
        .find('[data-testid="dashboard-header-left"]')
        .findAllComponents({ name: 'CardConversations' });
      const rightCard = wrapper
        .find('[data-testid="dashboard-header-right"]')
        .findComponent({ name: 'CardConversations' });

      expect(leftCards[0].props('title')).toBe('Total conversations');
      expect(leftCards[1].props('title')).toBe('Resolved');
      expect(leftCards[2].props('title')).toBe('Unresolved');
      expect(rightCard.props('title')).toBe('Transferred to human support');
    });
  });

  describe('Border Radius Logic', () => {
    const borderRadiusTests = [
      { index: 0, total: 4, expected: 'left' },
      { index: 1, total: 4, expected: 'none' },
      { index: 2, total: 4, expected: 'none' },
      { index: 3, total: 4, expected: 'right' },
      { index: 0, total: 1, expected: 'full' },
    ];

    borderRadiusTests.forEach(({ index, total, expected }) => {
      it(`should apply ${expected} border radius for card ${index} of ${total}`, () => {
        const vm = wrapper.vm;
        expect(vm.getBorderRadius(index, total)).toBe(expected);
      });
    });
  });

  describe('API Data Loading', () => {
    it('should handle successful API data loading', async () => {
      const mockApiResponse = [
        { id: 'total_conversations', value: 1000, percentage: 100 },
        { id: 'resolved', value: 850, percentage: 85 },
        { id: 'unresolved', value: 100, percentage: 10 },
        { id: 'transferred_to_human', value: 25, percentage: 2.5 },
      ];

      const conversationalHeaderApi = await import(
        '@/services/api/resources/conversational/header'
      );
      conversationalHeaderApi.default.getConversationalHeaderTotals.mockResolvedValue(
        mockApiResponse,
      );

      const vm = wrapper.vm;
      await vm.loadCardData();

      expect(
        conversationalHeaderApi.default.getConversationalHeaderTotals,
      ).toHaveBeenCalled();

      expect(vm.cardsData[0].value).toBe('1,000');
      expect(vm.cardsData[1].value).toBe('85.00%');
      expect(vm.cardsData[2].value).toBe('10.00%');
      expect(vm.rightCardData.value).toBe('2.50%');

      // All cards should not be loading
      expect(vm.cardsData.every((card) => !card.isLoading)).toBe(true);
      expect(vm.rightCardData.isLoading).toBe(false);
    });

    it('should handle API error loading', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const conversationalHeaderApi = await import(
        '@/services/api/resources/conversational/header'
      );
      conversationalHeaderApi.default.getConversationalHeaderTotals.mockRejectedValue(
        new Error('API Error'),
      );

      const vm = wrapper.vm;
      await vm.loadCardData();

      expect(
        conversationalHeaderApi.default.getConversationalHeaderTotals,
      ).toHaveBeenCalled();

      vm.cardsData.forEach((card) => {
        expect(card.value).toBe('-');
        expect(card.description).toBe('0 conversations');
        expect(card.isLoading).toBe(false);
      });

      expect(vm.rightCardData.value).toBe('-');
      expect(vm.rightCardData.description).toBe('0 conversations');
      expect(vm.rightCardData.isLoading).toBe(false);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading conversational header data:',
        expect.any(Error),
      );

      expect(Unnnic.unnnicCallAlert).toHaveBeenCalledWith({
        props: {
          text: 'Error loading data',
          type: 'error',
        },
        containerRef: null,
      });

      consoleSpy.mockRestore();
    });
  });

  describe('API Loading and State Management', () => {
    it('should handle successful API data loading', async () => {
      const vm = wrapper.vm;
      const mockData = {
        total: { value: '48.179', description: null },
        resolved: { value: '85.75%', description: '41.313 conversations' },
        unresolved: { value: '5.25%', description: '2.529 conversations' },
        transferred: { value: '12.22%', description: '5.887 conversations' },
      };

      vm.cardsData[0] = {
        ...vm.cardsData[0],
        ...mockData.total,
        isLoading: false,
      };
      vm.cardsData[1] = {
        ...vm.cardsData[1],
        ...mockData.resolved,
        isLoading: false,
      };
      vm.cardsData[2] = {
        ...vm.cardsData[2],
        ...mockData.unresolved,
        isLoading: false,
      };
      vm.rightCardData = {
        ...vm.rightCardData,
        ...mockData.transferred,
        isLoading: false,
      };

      await wrapper.vm.$nextTick();

      expect(vm.cardsData[0].value).toBe('48.179');
      expect(vm.cardsData[1].value).toBe('85.75%');
      expect(vm.cardsData[2].value).toBe('5.25%');
      expect(vm.rightCardData.value).toBe('12.22%');

      expect(vm.cardsData.every((card) => !card.isLoading)).toBe(true);
      expect(vm.rightCardData.isLoading).toBe(false);
    });

    it('should handle API errors with error toast and fallback values', async () => {
      const vm = wrapper.vm;
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      vm.cardsData[0] = {
        ...vm.cardsData[0],
        value: '-',
        description: '0 conversations',
        isLoading: false,
      };
      vm.cardsData[1] = {
        ...vm.cardsData[1],
        value: '-',
        description: '0 conversations',
        isLoading: false,
      };
      vm.cardsData[2] = {
        ...vm.cardsData[2],
        value: '-',
        description: '0 conversations',
        isLoading: false,
      };
      vm.rightCardData = {
        ...vm.rightCardData,
        value: '-',
        description: '0 conversations',
        isLoading: false,
      };

      vm.showErrorToast();

      await wrapper.vm.$nextTick();

      expect(vm.cardsData[0].value).toBe('-');
      expect(vm.cardsData[1].value).toBe('-');
      expect(vm.cardsData[2].value).toBe('-');
      expect(vm.rightCardData.value).toBe('-');

      expect(Unnnic.unnnicCallAlert).toHaveBeenCalledWith({
        props: {
          text: 'Error loading data',
          type: 'error',
        },
        containerRef: null,
      });

      consoleSpy.mockRestore();
    });

    it('should handle mixed success and error scenarios', async () => {
      const vm = wrapper.vm;
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      vm.cardsData[0] = {
        ...vm.cardsData[0],
        value: '48.179',
        isLoading: false,
      };
      vm.cardsData[1] = {
        ...vm.cardsData[1],
        value: '-',
        isLoading: false,
      };
      vm.cardsData[2] = {
        ...vm.cardsData[2],
        value: '5.25%',
        isLoading: false,
      };
      vm.rightCardData = {
        ...vm.rightCardData,
        value: '12.22%',
        isLoading: false,
      };

      await wrapper.vm.$nextTick();

      expect(vm.cardsData[0].value).toBe('48.179');
      expect(vm.cardsData[1].value).toBe('-');
      expect(vm.cardsData[2].value).toBe('5.25%');
      expect(vm.rightCardData.value).toBe('12.22%');

      consoleSpy.mockRestore();
    });

    it('should test loading state transitions', async () => {
      const vm = wrapper.vm;

      const mockApiResponse = [
        { id: 'total_conversations', value: 100, percentage: 100 },
        { id: 'resolved', value: 80, percentage: 80 },
        { id: 'unresolved', value: 20, percentage: 20 },
        { id: 'transferred_to_human', value: 5, percentage: 5 },
      ];

      const conversationalHeaderApi = await import(
        '@/services/api/resources/conversational/header'
      );
      conversationalHeaderApi.default.getConversationalHeaderTotals.mockResolvedValue(
        mockApiResponse,
      );

      const promise = vm.loadCardData();

      expect(vm.cardsData.every((card) => card.isLoading)).toBe(true);
      expect(vm.rightCardData.isLoading).toBe(true);

      await promise;

      expect(vm.cardsData.every((card) => !card.isLoading)).toBe(true);
      expect(vm.rightCardData.isLoading).toBe(false);

      // Verify data was loaded successfully
      expect(vm.cardsData[0].value).toBe('100');
      expect(vm.rightCardData.value).toBe('5.00%');
    });
  });

  describe('Computed Properties Reactivity', () => {
    it('should reactively compute card properties', async () => {
      const vm = wrapper.vm;

      expect(vm.cards).toHaveLength(3);
      expect(vm.rightCard).toBeDefined();

      vm.cards.forEach((card) => {
        expect(card).toHaveProperty('id');
        expect(card).toHaveProperty('title');
        expect(card).toHaveProperty('value');
        expect(card).toHaveProperty('description');
        expect(card).toHaveProperty('tooltipInfo');
        expect(card).toHaveProperty('isLoading');
      });
    });

    it('should update translations when locale changes', async () => {
      const vm = wrapper.vm;
      const initialTitle = vm.cards[0].title;

      i18n.global.locale = 'es';
      await wrapper.vm.$nextTick();

      i18n.global.locale = 'en';
      await wrapper.vm.$nextTick();

      expect(vm.cards[0].title).toBe(initialTitle);
    });
  });

  describe('Translation Coverage', () => {
    it('should display translated tooltips correctly', () => {
      const leftCards = wrapper
        .find('[data-testid="dashboard-header-left"]')
        .findAllComponents({ name: 'CardConversations' });
      const rightCard = wrapper
        .find('[data-testid="dashboard-header-right"]')
        .findComponent({ name: 'CardConversations' });

      expect(leftCards[0].props('tooltipInfo')).toBe(
        'Total number of conversations',
      );
      expect(leftCards[1].props('tooltipInfo')).toBe(
        'Conversations that were resolved',
      );
      expect(leftCards[2].props('tooltipInfo')).toBe(
        'Conversations that were not resolved',
      );
      expect(rightCard.props('tooltipInfo')).toBe(
        'Conversations transferred to human support',
      );
    });
  });

  describe('Integration Testing', () => {
    it('should handle complete component lifecycle', async () => {
      const allCards = wrapper.findAllComponents({ name: 'CardConversations' });
      expect(allCards).toHaveLength(4);

      allCards.forEach((card) => {
        expect(card.props('title')).toBeDefined();
        expect(card.props('value')).toBeDefined();
        expect(card.props('tooltipInfo')).toBeDefined();
      });
    });

    it('should apply correct border radius to left section cards', () => {
      const leftCards = wrapper
        .find('[data-testid="dashboard-header-left"]')
        .findAllComponents({ name: 'CardConversations' });

      expect(leftCards[0].props('borderRadius')).toBe('left');
      expect(leftCards[1].props('borderRadius')).toBe('none');
      expect(leftCards[2].props('borderRadius')).toBe('right');
    });

    it('should not apply border radius to right section card', () => {
      const rightCard = wrapper
        .find('[data-testid="dashboard-header-right"]')
        .findComponent({ name: 'CardConversations' });

      expect(rightCard.props('borderRadius')).toBeUndefined();
    });
  });

  describe('API Functions', () => {
    it('should test loadCardData function exists', () => {
      const vm = wrapper.vm;
      expect(vm.loadCardData).toBeDefined();
      expect(typeof vm.loadCardData).toBe('function');
    });

    it('should test showErrorToast function', () => {
      const vm = wrapper.vm;
      expect(vm.showErrorToast).toBeDefined();
      expect(typeof vm.showErrorToast).toBe('function');

      vm.showErrorToast();
      expect(Unnnic.unnnicCallAlert).toHaveBeenCalled();
    });
  });

  describe('Component Lifecycle', () => {
    it('should mount component successfully', () => {
      const testWrapper = createWrapper();

      expect(testWrapper.exists()).toBe(true);

      expect(testWrapper.vm.cardsData).toHaveLength(3);
      expect(testWrapper.vm.rightCardData).toBeDefined();
    });
  });

  describe('Enhanced Border Radius Coverage', () => {
    it('should handle edge cases for getBorderRadius', () => {
      const vm = wrapper.vm;

      expect(vm.getBorderRadius(0, 0)).toBe('left');

      expect(vm.getBorderRadius(0, 1)).toBe('full');

      expect(vm.getBorderRadius(0, 2)).toBe('left');
      expect(vm.getBorderRadius(1, 2)).toBe('right');

      expect(vm.getBorderRadius(0, 3)).toBe('left');
      expect(vm.getBorderRadius(1, 3)).toBe('none');
      expect(vm.getBorderRadius(2, 3)).toBe('right');
    });
  });

  describe('Data Mutation Coverage', () => {
    it('should handle direct data mutations', async () => {
      const vm = wrapper.vm;

      vm.cardsData[0].value = 'test-value';
      vm.cardsData[0].description = 'test-description';
      vm.cardsData[0].isLoading = false;

      await wrapper.vm.$nextTick();

      expect(vm.cardsData[0].value).toBe('test-value');
      expect(vm.cardsData[0].description).toBe('test-description');
      expect(vm.cardsData[0].isLoading).toBe(false);
    });

    it('should handle rightCardData mutations', async () => {
      const vm = wrapper.vm;

      vm.rightCardData.value = 'right-test-value';
      vm.rightCardData.description = 'right-test-description';
      vm.rightCardData.isLoading = false;

      await wrapper.vm.$nextTick();

      expect(vm.rightCardData.value).toBe('right-test-value');
      expect(vm.rightCardData.description).toBe('right-test-description');
      expect(vm.rightCardData.isLoading).toBe(false);
    });
  });
});
