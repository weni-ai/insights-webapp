import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createTestingPinia } from '@pinia/testing';
import StatusCards from '../StatusCards.vue';

vi.mock('@/utils/time', () => ({
  formatSecondsToTime: vi.fn((seconds) => `${seconds}s`),
}));

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: {} },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

const mockServiceStatusData = {
  finished: 100,
  average_time_is_waiting: 120,
  average_time_first_response: 60,
  average_response_time: 90,
  average_time_chat: 180,
};

describe('StatusCards', () => {
  let wrapper;
  let store;

  const createWrapper = (initialState = {}) => {
    store = createTestingPinia({
      initialState: {
        humanSupportAnalysis: {
          serviceStatusData: mockServiceStatusData,
          loadingServiceStatusData: false,
          ...initialState,
        },
      },
    });

    return mount(StatusCards, {
      global: {
        plugins: [store],
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

  describe('Component Structure', () => {
    it('should render main section with correct testid', () => {
      const section = wrapper.find('[data-testid="status-cards"]');
      expect(section.exists()).toBe(true);
      expect(section.classes()).toContain('status-cards');
    });

    it('should render finished card section', () => {
      const finishedSection = wrapper.find('.status-cards__finished');
      expect(finishedSection.exists()).toBe(true);
    });

    it('should render cards section with testid', () => {
      const cardsSection = wrapper.find('[data-testid="status-cards-cards"]');
      expect(cardsSection.exists()).toBe(true);
      expect(cardsSection.classes()).toContain('status-cards__cards');
    });

    it('should render 5 CardConversations components', () => {
      const cards = wrapper.findAllComponents({ name: 'CardConversations' });
      expect(cards.length).toBe(5);
    });
  });

  describe('Data Loading', () => {
    it('should pass loading state to all cards', () => {
      wrapper = createWrapper({ loadingServiceStatusData: true });
      const cards = wrapper.findAllComponents({ name: 'CardConversations' });

      cards.forEach((card) => {
        expect(card.props('isLoading')).toBe(true);
      });
    });

    it('should not be loading initially', () => {
      const cards = wrapper.findAllComponents({ name: 'CardConversations' });
      expect(cards[0].props('isLoading')).toBe(false);
    });
  });

  describe('Card Values', () => {
    it('should display finished count as string', () => {
      const cards = wrapper.findAllComponents({ name: 'CardConversations' });
      const finishedCard = cards[0];
      expect(finishedCard.props('value')).toBe('100');
    });

    it('should format time values using formatSecondsToTime', () => {
      const cards = wrapper.findAllComponents({ name: 'CardConversations' });
      expect(cards[1].props('value')).toBe('120s');
      expect(cards[2].props('value')).toBe('60s');
      expect(cards[3].props('value')).toBe('90s');
      expect(cards[4].props('value')).toBe('180s');
    });

    it('should display dash for null values', () => {
      wrapper = createWrapper({
        serviceStatusData: {
          ...mockServiceStatusData,
          finished: null,
        },
      });
      const cards = wrapper.findAllComponents({ name: 'CardConversations' });
      const finishedCard = cards[0];
      expect(finishedCard.props('value')).toBe('-');
    });
  });

  describe('Card Props', () => {
    it('should set finished card as clickable', () => {
      const cards = wrapper.findAllComponents({ name: 'CardConversations' });
      const finishedCard = cards[0];
      expect(finishedCard.props('isClickable')).toBe(true);
    });

    it('should set correct borderRadius for cards', () => {
      const cards = wrapper.findAllComponents({ name: 'CardConversations' });

      expect(cards[0].props('borderRadius')).toBe('full');
      expect(cards[1].props('borderRadius')).toBe('left');
      expect(cards[2].props('borderRadius')).toBe('none');
      expect(cards[3].props('borderRadius')).toBe('none');
      expect(cards[4].props('borderRadius')).toBe('right');
    });

    it('should set correct tooltip sides', () => {
      const cards = wrapper.findAllComponents({ name: 'CardConversations' });

      expect(cards[0].props('tooltipSide')).toBe('right');
      expect(cards[1].props('tooltipSide')).toBe('top');
      expect(cards[2].props('tooltipSide')).toBe('top');
      expect(cards[3].props('tooltipSide')).toBe('top');
      expect(cards[4].props('tooltipSide')).toBe('left');
    });
  });

  describe('Card Click Behavior', () => {
    it('should set finished card as clickable', () => {
      const cards = wrapper.findAllComponents({ name: 'CardConversations' });
      expect(cards[0].props('isClickable')).toBe(true);
    });

    it('should not set other cards as clickable', () => {
      const cards = wrapper.findAllComponents({ name: 'CardConversations' });
      expect(cards[1].props('isClickable')).toBe(false);
      expect(cards[2].props('isClickable')).toBe(false);
    });

    it('should handle card click event', async () => {
      const mockScrollIntoView = vi.fn();
      const mockElement = { scrollIntoView: mockScrollIntoView };
      vi.spyOn(document, 'querySelector').mockReturnValue(mockElement);

      const cards = wrapper.findAllComponents({ name: 'CardConversations' });
      await cards[0].vm.$emit('click');
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });
    });

    it('should not throw error if scroll element is not found', async () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(null);

      const cards = wrapper.findAllComponents({ name: 'CardConversations' });
      await cards[0].vm.$emit('click');
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(document.querySelector).toHaveBeenCalled();
    });
  });
});
