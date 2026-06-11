import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { reactive } from 'vue';

import ConversationalAddedToCart from '../ConversationalAddedToCart.vue';

const mockWidgetsStore = {
  addedToCartWidgetData: { value: null },
  isLoadingAddedToCartWidgetData: { value: false },
  isAddedToCartWidgetDataError: { value: false },
  loadAddedToCartWidgetData: vi.fn(() => Promise.resolve()),
};

const mockConversationalStore = {
  refreshDataConversational: false,
  setIsLoadingConversationalData: vi.fn(),
  shouldUseMock: { value: false },
};

const mockRoute = reactive({ query: {} });

vi.mock('@/store/modules/conversational/widgets', () => ({
  useConversationalWidgets: () => mockWidgetsStore,
}));

vi.mock('@/store/modules/conversational/conversational', () => ({
  useConversational: () => mockConversationalStore,
}));

vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useRoute: () => mockRoute,
}));

vi.mock('pinia', async (importOriginal) => ({
  ...(await importOriginal()),
  storeToRefs: (store) => store,
}));

vi.mock('@/composables/useWidgetFormatting', () => ({
  useWidgetFormatting: () => ({
    formatPercentage: (value) => `${value}%`,
    formatNumber: (value) => `${value}`,
  }),
}));

vi.mock(
  '@/components/insights/widgets/conversational/__mock__/productRankingMock',
  () => ({
    PRODUCT_RANKING_MOCK_ENABLED: false,
    getProductRankingWidgetMock: () => null,
  }),
);

import {
  colorBgGreenStrong,
  colorBgGreenPlain,
} from '@weni/unnnic-system/tokens/colors';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      see_all: 'See all',
      conversations_dashboard: {
        added_to_cart: 'Most added products to cart',
        added_to_cart_count: '{count} products',
        auto_widget_no_data: 'No data available for the filtered period',
        auto_widget_error: 'Error loading data',
        customize_your_dashboard: {
          remove_widget: 'Remove widget',
        },
      },
    },
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

const buildResults = (count) =>
  Array.from({ length: count }, (_, index) => ({
    label: `product-${index}`,
    value: count - index,
    full_value: (count - index) * 10,
  }));

describe('ConversationalAddedToCart', () => {
  let wrapper;

  const createWrapper = (storeOverrides = {}) => {
    Object.assign(mockWidgetsStore, storeOverrides);
    return mount(ConversationalAddedToCart, {
      global: {
        stubs: {
          BaseConversationWidget: {
            name: 'BaseConversationWidget',
            template: '<section><slot /></section>',
            props: ['title', 'actions', 'isLoading', 'hiddenTabs'],
          },
          ProgressTable: true,
          UnnnicDisclaimer: true,
          ModalRemoveWidget: true,
          SeeAllDrawer: true,
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.query = {};
    Object.assign(mockWidgetsStore, {
      addedToCartWidgetData: { value: null },
      isLoadingAddedToCartWidgetData: { value: false },
      isAddedToCartWidgetDataError: { value: false },
    });
    mockConversationalStore.refreshDataConversational = false;
    mockConversationalStore.shouldUseMock = { value: false };
    wrapper = createWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('Component rendering', () => {
    it('renders BaseConversationWidget with translated title', () => {
      const widget = wrapper.findComponent({ name: 'BaseConversationWidget' });
      expect(widget.exists()).toBe(true);
      expect(wrapper.vm.title).toBe('Most added products to cart');
    });

    it('renders ModalRemoveWidget with added_to_cart type when opened', async () => {
      wrapper.vm.isRemoveWidgetModalOpen = true;
      await wrapper.vm.$nextTick();
      const modal = wrapper.findComponent({ name: 'ModalRemoveWidget' });
      expect(modal.exists()).toBe(true);
      expect(modal.props('type')).toBe('added_to_cart');
    });
  });

  describe('Data loading', () => {
    it('loads data on mount', () => {
      expect(mockWidgetsStore.loadAddedToCartWidgetData).toHaveBeenCalled();
    });

    it('reloads data when route query changes', async () => {
      const callsBefore =
        mockWidgetsStore.loadAddedToCartWidgetData.mock.calls.length;
      mockRoute.query = { date: '2026-01-01' };
      await wrapper.vm.$nextTick();
      expect(
        mockWidgetsStore.loadAddedToCartWidgetData.mock.calls.length,
      ).toBeGreaterThan(callsBefore);
    });

    it('shows loading state', () => {
      wrapper = createWrapper({
        isLoadingAddedToCartWidgetData: { value: true },
      });
      expect(wrapper.vm.isLoading).toBe(true);
    });
  });

  describe('Results and progress items', () => {
    it('sorts results descending and slices to top 5', () => {
      wrapper = createWrapper({
        addedToCartWidgetData: {
          value: {
            results: [
              { label: 'a', value: 1, full_value: 10 },
              { label: 'b', value: 9, full_value: 90 },
              ...buildResults(5),
            ],
          },
        },
      });
      const items = wrapper.vm.progressItems;
      expect(items).toHaveLength(5);
      expect(items[0].value).toBe(9);
      expect(items[0].label).toBe('b');
    });

    it('builds description and applies green colors', () => {
      wrapper = createWrapper({
        addedToCartWidgetData: {
          value: { results: [{ label: 'a', value: 58, full_value: 7250 }] },
        },
      });
      const [item] = wrapper.vm.progressItems;
      expect(item.description).toBe('58% (7250)');
      expect(item.color).toBe(colorBgGreenStrong);
      expect(item.backgroundColor).toBe(colorBgGreenPlain);
    });

    it('reports totalCount and isEmpty when no results', () => {
      expect(wrapper.vm.totalCount).toBe(0);
      expect(wrapper.vm.isEmpty).toBe(true);
    });

    it('shows see all only when more than 5 results', () => {
      expect(wrapper.vm.showSeeAll).toBe(false);
      wrapper = createWrapper({
        addedToCartWidgetData: { value: { results: buildResults(6) } },
      });
      expect(wrapper.vm.showSeeAll).toBe(true);
    });

    it('opens see all drawer', async () => {
      wrapper = createWrapper({
        addedToCartWidgetData: { value: { results: buildResults(6) } },
      });
      const seeAll = wrapper.find(
        '[data-testid="conversational-added-to-cart-see-all"]',
      );
      await seeAll.trigger('click');
      expect(wrapper.vm.isSeeAllDrawerOpen).toBe(true);
    });
  });

  describe('Actions', () => {
    it('provides only delete action', () => {
      const { actions } = wrapper.vm;
      expect(actions).toHaveLength(1);
      expect(actions[0].icon).toBe('delete');
      expect(actions[0].scheme).toBe('aux-red-500');
    });

    it('opens remove modal on delete', () => {
      wrapper.vm.actions[0].onClick();
      expect(wrapper.vm.isRemoveWidgetModalOpen).toBe(true);
    });

    it('returns empty actions in mock mode', () => {
      mockConversationalStore.shouldUseMock = { value: true };
      wrapper = createWrapper();
      expect(wrapper.vm.actions).toEqual([]);
    });
  });

  describe('Error handling', () => {
    it('exposes error state', () => {
      wrapper = createWrapper({
        isAddedToCartWidgetDataError: { value: true },
      });
      expect(wrapper.vm.isError).toBe(true);
    });
  });
});
