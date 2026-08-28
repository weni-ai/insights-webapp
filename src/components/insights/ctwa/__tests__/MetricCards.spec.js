import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createI18n } from 'vue-i18n';
import { createTestingPinia } from '@pinia/testing';

import MetricCards from '../MetricCards.vue';
import { useCTWA } from '@/store/modules/ctwa';
import { formatCurrency } from '@/utils/numbers';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import ptBr from '@/locales/pt_br.json';
import ro from '@/locales/ro.json';

vi.mock('@/utils/numbers', () => ({
  formatNumber: vi.fn((value) => String(value)),
  formatCurrency: vi.fn((value, currency) => `${currency} ${value}`),
}));

vi.mock('@/utils/time', () => ({
  getLastNDays: vi.fn(() => ({ start: '2024-01-01', end: '2024-01-07' })),
  getYesterdayDate: vi.fn(() => ({ start: '2024-01-06', end: '2024-01-06' })),
  isDateBefore: vi.fn(() => false),
  getYesterdayNDays: vi.fn(() => ({ start: '2024-01-01', end: '2024-01-07' })),
}));

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

const mockDashboardData = {
  attributed_revenue: { value: 1030000, avg: 359 },
  ctwa_conversations: 19400,
  organic_conversations: 22800,
};

describe('MetricCards', () => {
  let wrapper;

  const createWrapper = (initialState = {}, configState = {}) => {
    const pinia = createTestingPinia({
      initialState: {
        ctwa: {
          dashboardData: mockDashboardData,
          loadingDashboardData: false,
          appliedDateRange: { start: '2024-01-01', end: '2024-01-07' },
          ...initialState,
        },
        config: {
          project: { uuid: '', ...configState },
        },
      },
    });

    return mount(MetricCards, {
      global: {
        plugins: [pinia],
        stubs: {
          CardConversations: true,
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  describe('Component structure', () => {
    it('renders the metric cards section', () => {
      const section = wrapper.find('[data-testid="ctwa-metric-cards"]');
      expect(section.exists()).toBe(true);
      expect(section.classes()).toContain('metric-cards');
    });

    it('renders 3 CardConversations components', () => {
      const cards = wrapper.findAllComponents({ name: 'CardConversations' });
      expect(cards.length).toBe(3);
    });
  });

  describe('Data loading', () => {
    it('loads dashboard data on mount', () => {
      const store = useCTWA();
      expect(store.loadDashboardData).toHaveBeenCalledTimes(1);
    });

    it('reloads dashboard data when the date range changes', async () => {
      const store = useCTWA();
      vi.clearAllMocks();

      store.appliedDateRange = { start: '2024-02-01', end: '2024-02-28' };
      await nextTick();

      expect(store.loadDashboardData).toHaveBeenCalledTimes(1);
    });

    it('reloads dashboard data when the campaign filter changes', async () => {
      const store = useCTWA();
      vi.clearAllMocks();

      store.selectedCampaign = 'campaign-uuid';
      await nextTick();

      expect(store.loadDashboardData).toHaveBeenCalledTimes(1);
    });

    it('passes loading state to all cards', () => {
      wrapper = createWrapper({ loadingDashboardData: true });
      const cards = wrapper.findAllComponents({ name: 'CardConversations' });

      cards.forEach((card) => {
        expect(card.props('isLoading')).toBe(true);
      });
    });

    it('is not loading initially', () => {
      const cards = wrapper.findAllComponents({ name: 'CardConversations' });
      expect(cards[0].props('isLoading')).toBe(false);
    });
  });

  describe('Card values', () => {
    it('displays formatted attributed revenue value', () => {
      const cards = wrapper.findAllComponents({ name: 'CardConversations' });
      expect(cards[0].props('title')).toBe('Attributed revenue');
      expect(cards[0].props('value')).toBe('BRL 1030000');
      expect(cards[0].props('description')).toBe('Avg. order value BRL 359');
      expect(formatCurrency).toHaveBeenCalledWith(1030000, 'BRL');
      expect(formatCurrency).toHaveBeenCalledWith(359, 'BRL');
    });

    it('formats attributed revenue with the project currency', () => {
      wrapper = createWrapper({}, { currency: 'USD' });
      const cards = wrapper.findAllComponents({ name: 'CardConversations' });

      expect(cards[0].props('value')).toBe('USD 1030000');
      expect(cards[0].props('description')).toBe('Avg. order value USD 359');
      expect(formatCurrency).toHaveBeenCalledWith(1030000, 'USD');
      expect(formatCurrency).toHaveBeenCalledWith(359, 'USD');
    });

    it('displays formatted CTWA conversations value', () => {
      const cards = wrapper.findAllComponents({ name: 'CardConversations' });
      expect(cards[1].props('title')).toBe('CTWA conversations');
      expect(cards[1].props('value')).toBe('19400');
      expect(cards[1].props('description')).toBe(
        'Started from ads in the period',
      );
    });

    it('displays formatted organic conversations value', () => {
      const cards = wrapper.findAllComponents({ name: 'CardConversations' });
      expect(cards[2].props('title')).toBe('Organic conversations');
      expect(cards[2].props('value')).toBe('22800');
      expect(cards[2].props('description')).toBe(
        'Comparison baseline (non-ad)',
      );
    });

    it('renders a dash when values are null', () => {
      wrapper = createWrapper({
        dashboardData: {
          attributed_revenue: { value: null, avg: null },
          ctwa_conversations: null,
          organic_conversations: null,
        },
      });

      const cards = wrapper.findAllComponents({ name: 'CardConversations' });
      expect(cards[0].props('value')).toBe('-');
      expect(cards[0].props('description')).toBe('Avg. order value -');
      expect(cards[1].props('value')).toBe('-');
      expect(cards[2].props('value')).toBe('-');
    });
  });

  describe('Card layout', () => {
    it('applies joined border radius to the row', () => {
      const cards = wrapper.findAllComponents({ name: 'CardConversations' });
      expect(cards[0].props('borderRadius')).toBe('left');
      expect(cards[1].props('borderRadius')).toBe('none');
      expect(cards[2].props('borderRadius')).toBe('right');
    });

    it('enables description gap on all cards', () => {
      const cards = wrapper.findAllComponents({ name: 'CardConversations' });
      cards.forEach((card) => {
        expect(card.props('activeDescriptionGap')).toBe(true);
      });
    });
  });
});

describe('ctwa_dashboard locale keys', () => {
  const locales = { en, pt_br: ptBr, es, ro };
  const expectedKeys = [
    'attributed_revenue',
    'ctwa_conversations',
    'organic_conversations',
  ];

  it.each(Object.entries(locales))(
    '%s has the same card keys and {avg} placeholder',
    (_locale, messages) => {
      const cards = messages.ctwa_dashboard.cards;

      expect(Object.keys(cards)).toEqual(expectedKeys);

      expectedKeys.forEach((key) => {
        expect(cards[key]).toHaveProperty('title');
        expect(cards[key]).toHaveProperty('description');
      });

      expect(cards.attributed_revenue.description).toContain('{avg}');
    },
  );
});
