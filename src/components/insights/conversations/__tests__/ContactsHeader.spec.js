import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref as vueRef, reactive } from 'vue';
import { mount, config } from '@vue/test-utils';

import ContactsHeader from '../ContactsHeader.vue';

import { createI18n } from 'vue-i18n';
import Unnnic from '@weni/unnnic-system';

vi.mock('@weni/unnnic-system', () => ({
  default: {
    unnnicCallAlert: vi.fn(),
  },
}));

vi.mock('@/services/api/resources/conversational/contacts', () => ({
  default: {
    getConversationalContacts: vi.fn().mockResolvedValue([
      { id: 'unique', value: 0 },
      { id: 'returning', value: 0, percentage: 0 },
      { id: 'avg_conversations_per_contact', value: 0 },
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
    updateLastUpdatedRequest: vi.fn(),
  }),
}));

const mockShouldUseMock = vueRef(false);
const mockSetHasEndpointData = vi.fn();
const mockSetEndpointError = vi.fn();
const mockSetIsLoadingConversationalData = vi.fn();

vi.mock('@/store/modules/conversational/conversational', () => {
  return {
    useConversational: () =>
      reactive({
        refreshDataConversational: false,
        setIsLoadingConversationalData: mockSetIsLoadingConversationalData,
        setEndpointError: mockSetEndpointError,
        setHasEndpointData: mockSetHasEndpointData,
        shouldUseMock: mockShouldUseMock,
      }),
  };
});

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
        contacts_header: {
          unique: 'Unique contacts',
          returning: 'Returning contacts',
          avg: 'Average conversations per contact',
          returning_description_suffix: 'of total unique contacts',
          tooltips: {
            unique:
              'Number of distinct contacts who started conversations during the selected period.',
            returning:
              'Contacts who started more than one conversation during the selected period.',
            avg: 'Average conversations considering all unique contacts during the period.',
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
  return mount(ContactsHeader, {
    global: { plugins: [Unnnic] },
  });
};

describe('ContactsHeader.vue', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();

    wrapper = createWrapper();
  });

  describe('Component Structure', () => {
    it('should render contacts header structure correctly', () => {
      expect(wrapper.find('[data-testid="contacts-header"]').exists()).toBe(
        true,
      );
      expect(
        wrapper.find('[data-testid="contacts-header-left"]').exists(),
      ).toBe(true);
    });

    it('should render 3 cards in left section', () => {
      const leftSection = wrapper.find('[data-testid="contacts-header-left"]');

      expect(
        leftSection.findAllComponents({ name: 'CardConversations' }),
      ).toHaveLength(3);
    });
  });

  describe('Card Definitions', () => {
    it('should have correct card definitions structure', () => {
      const vm = wrapper.vm;
      expect(vm.cardDefinitions).toHaveLength(3);

      expect(vm.cardDefinitions[0]).toEqual({
        id: 'unique',
        titleKey: 'conversations_dashboard.contacts_header.unique',
        tooltipKey: 'conversations_dashboard.contacts_header.tooltips.unique',
      });

      expect(vm.cardDefinitions[1]).toEqual({
        id: 'returning',
        titleKey: 'conversations_dashboard.contacts_header.returning',
        tooltipKey:
          'conversations_dashboard.contacts_header.tooltips.returning',
      });

      expect(vm.cardDefinitions[2]).toEqual({
        id: 'avg_conversations_per_contact',
        titleKey: 'conversations_dashboard.contacts_header.avg',
        tooltipKey: 'conversations_dashboard.contacts_header.tooltips.avg',
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
    it('should display initial titles and tooltips correctly', () => {
      const cards = wrapper
        .find('[data-testid="contacts-header-left"]')
        .findAllComponents({ name: 'CardConversations' });

      expect(cards[0].props('title')).toBe('Unique contacts');
      expect(cards[1].props('title')).toBe('Returning contacts');
      expect(cards[2].props('title')).toBe('Average conversations per contact');
    });

    it('should initialize cardsData with correct structure', async () => {
      const contactsApi = await import(
        '@/services/api/resources/conversational/contacts'
      );
      contactsApi.default.getConversationalContacts.mockResolvedValue([
        { id: 'unique', value: 0 },
        { id: 'returning', value: 0, percentage: 0 },
        { id: 'avg_conversations_per_contact', value: 0 },
      ]);

      const testWrapper = createWrapper();
      const vm = testWrapper.vm;

      await testWrapper.vm.$nextTick();
      await testWrapper.vm.$nextTick();

      expect(vm.cardsData).toHaveLength(3);
    });
  });

  describe('Border Radius Logic', () => {
    const borderRadiusTests = [
      { index: 0, total: 3, expected: 'left' },
      { index: 1, total: 3, expected: 'none' },
      { index: 2, total: 3, expected: 'right' },
      { index: 0, total: 1, expected: 'full' },
    ];

    borderRadiusTests.forEach(({ index, total, expected }) => {
      it(`should apply ${expected} border radius for card ${index} of ${total}`, () => {
        const vm = wrapper.vm;
        expect(vm.getBorderRadius(index, total)).toBe(expected);
      });
    });

    it('should apply correct border radius across rendered cards', () => {
      const cards = wrapper
        .find('[data-testid="contacts-header-left"]')
        .findAllComponents({ name: 'CardConversations' });

      expect(cards[0].props('borderRadius')).toBe('left');
      expect(cards[1].props('borderRadius')).toBe('none');
      expect(cards[2].props('borderRadius')).toBe('right');
    });
  });

  describe('API Data Loading', () => {
    it('should handle successful API data loading', async () => {
      const mockApiResponse = [
        { id: 'unique', value: 80 },
        { id: 'returning', value: 28, percentage: 35 },
        { id: 'avg_conversations_per_contact', value: 1.25 },
      ];

      const contactsApi = await import(
        '@/services/api/resources/conversational/contacts'
      );
      contactsApi.default.getConversationalContacts.mockResolvedValue(
        mockApiResponse,
      );

      const vm = wrapper.vm;
      await vm.loadCardData();

      expect(
        contactsApi.default.getConversationalContacts,
      ).toHaveBeenCalledWith(
        {},
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );

      expect(vm.cardsData[0].value).toBe('80');
      expect(vm.cardsData[0].description).toBe(null);

      expect(vm.cardsData[1].value).toBe('28');
      expect(vm.cardsData[1].description).toBe(
        '35.00% of total unique contacts',
      );

      expect(vm.cardsData[2].value).toBe('1.25');
      expect(vm.cardsData[2].description).toBe(null);

      expect(vm.cardsData.every((card) => !card.isLoading)).toBe(true);
    });

    it('should call setHasEndpointData on successful non-empty API response', async () => {
      const mockApiResponse = [
        { id: 'unique', value: 80 },
        { id: 'returning', value: 28, percentage: 35 },
        { id: 'avg_conversations_per_contact', value: 1.25 },
      ];

      const contactsApi = await import(
        '@/services/api/resources/conversational/contacts'
      );
      contactsApi.default.getConversationalContacts.mockResolvedValue(
        mockApiResponse,
      );

      mockSetHasEndpointData.mockClear();

      const vm = wrapper.vm;
      await vm.loadCardData();

      expect(mockSetHasEndpointData).toHaveBeenCalledWith(true);
    });

    it('should not call setHasEndpointData on empty API response', async () => {
      const contactsApi = await import(
        '@/services/api/resources/conversational/contacts'
      );
      contactsApi.default.getConversationalContacts.mockResolvedValue([]);

      mockSetHasEndpointData.mockClear();

      const vm = wrapper.vm;
      await vm.loadCardData();

      expect(mockSetHasEndpointData).not.toHaveBeenCalled();
    });

    it('should set contacts endpoint error to false on success', async () => {
      const mockApiResponse = [
        { id: 'unique', value: 1 },
        { id: 'returning', value: 1, percentage: 1 },
        { id: 'avg_conversations_per_contact', value: 1 },
      ];

      const contactsApi = await import(
        '@/services/api/resources/conversational/contacts'
      );
      contactsApi.default.getConversationalContacts.mockResolvedValue(
        mockApiResponse,
      );

      mockSetEndpointError.mockClear();

      const vm = wrapper.vm;
      await vm.loadCardData();

      expect(mockSetEndpointError).toHaveBeenCalledWith('contacts', false);
    });

    it('should handle API error loading', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const contactsApi = await import(
        '@/services/api/resources/conversational/contacts'
      );
      contactsApi.default.getConversationalContacts.mockRejectedValue(
        new Error('API Error'),
      );

      mockSetEndpointError.mockClear();

      const vm = wrapper.vm;
      await vm.loadCardData();

      expect(contactsApi.default.getConversationalContacts).toHaveBeenCalled();

      vm.cardsData.forEach((card) => {
        expect(card.value).toBe('-');
        expect(card.description).toBe(null);
        expect(card.isLoading).toBe(false);
      });

      expect(mockSetEndpointError).toHaveBeenCalledWith('contacts', true);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading conversational contacts data:',
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

  describe('Abort Signal Handling', () => {
    it('should pass an AbortSignal to the contacts service on each call', async () => {
      const contactsApi = await import(
        '@/services/api/resources/conversational/contacts'
      );
      contactsApi.default.getConversationalContacts.mockResolvedValue([
        { id: 'unique', value: 1 },
        { id: 'returning', value: 1, percentage: 1 },
        { id: 'avg_conversations_per_contact', value: 1 },
      ]);

      const vm = wrapper.vm;
      await vm.loadCardData();

      const callArgs =
        contactsApi.default.getConversationalContacts.mock.calls.at(-1);

      expect(callArgs[1]).toBeDefined();
      expect(callArgs[1].signal).toBeInstanceOf(AbortSignal);
    });

    it('should abort the previous in-flight request when called again', async () => {
      const contactsApi = await import(
        '@/services/api/resources/conversational/contacts'
      );

      const capturedSignals = [];
      contactsApi.default.getConversationalContacts
        .mockImplementationOnce((_q, options) => {
          capturedSignals.push(options.signal);
          return new Promise((resolve) => {
            options.signal.addEventListener('abort', () =>
              resolve([
                { id: 'unique', value: 0 },
                { id: 'returning', value: 0, percentage: 0 },
                { id: 'avg_conversations_per_contact', value: 0 },
              ]),
            );
          });
        })
        .mockImplementationOnce((_q, options) => {
          capturedSignals.push(options.signal);
          return Promise.resolve([
            { id: 'unique', value: 1 },
            { id: 'returning', value: 1, percentage: 1 },
            { id: 'avg_conversations_per_contact', value: 1 },
          ]);
        });

      const vm = wrapper.vm;

      const firstPromise = vm.loadCardData();
      const secondPromise = vm.loadCardData();

      await Promise.all([firstPromise, secondPromise]);

      expect(capturedSignals).toHaveLength(2);
      expect(capturedSignals[0].aborted).toBe(true);
      expect(capturedSignals[1].aborted).toBe(false);
    });

    it('should not apply data from an aborted (older) request', async () => {
      const contactsApi = await import(
        '@/services/api/resources/conversational/contacts'
      );

      let resolveOldRequest;
      const oldPromise = new Promise((resolve) => {
        resolveOldRequest = resolve;
      });

      const newResponse = [
        { id: 'unique', value: 999 },
        { id: 'returning', value: 999, percentage: 99 },
        { id: 'avg_conversations_per_contact', value: 99 },
      ];

      contactsApi.default.getConversationalContacts
        .mockReturnValueOnce(oldPromise)
        .mockResolvedValueOnce(newResponse);

      const vm = wrapper.vm;

      const firstCall = vm.loadCardData();
      const secondCall = vm.loadCardData();

      await secondCall;

      resolveOldRequest([
        { id: 'unique', value: 1 },
        { id: 'returning', value: 1, percentage: 1 },
        { id: 'avg_conversations_per_contact', value: 1 },
      ]);
      await firstCall;

      const uniqueCard = vm.cardsData.find((c) => c.id === 'unique');
      expect(uniqueCard.value).toBe('999');
    });

    it('should ignore aborted error and not raise the error toast', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      Unnnic.unnnicCallAlert.mockClear();
      mockSetEndpointError.mockClear();

      const contactsApi = await import(
        '@/services/api/resources/conversational/contacts'
      );

      let abortedSignal;
      contactsApi.default.getConversationalContacts
        .mockImplementationOnce((_q, options) => {
          abortedSignal = options.signal;
          return new Promise((_resolve, reject) => {
            options.signal.addEventListener('abort', () => {
              const abortError = new Error('Aborted');
              abortError.name = 'AbortError';
              reject(abortError);
            });
          });
        })
        .mockResolvedValueOnce([
          { id: 'unique', value: 5 },
          { id: 'returning', value: 5, percentage: 5 },
          { id: 'avg_conversations_per_contact', value: 5 },
        ]);

      const vm = wrapper.vm;

      const first = vm.loadCardData();
      const second = vm.loadCardData();

      await Promise.all([first, second]);

      expect(abortedSignal.aborted).toBe(true);
      expect(Unnnic.unnnicCallAlert).not.toHaveBeenCalled();
      expect(mockSetEndpointError).not.toHaveBeenCalledWith('contacts', true);

      consoleSpy.mockRestore();
    });
  });

  describe('Tooltip Side Logic', () => {
    it('should return left side for avg card', () => {
      const vm = wrapper.vm;
      expect(vm.handleTooltipSide('avg_conversations_per_contact')).toBe(
        'left',
      );
    });

    it('should return top side for other cards', () => {
      const vm = wrapper.vm;
      expect(vm.handleTooltipSide('unique')).toBe('top');
      expect(vm.handleTooltipSide('returning')).toBe('top');
    });
  });

  describe('Translation Coverage', () => {
    it('should display translated tooltips correctly', () => {
      const cards = wrapper
        .find('[data-testid="contacts-header-left"]')
        .findAllComponents({ name: 'CardConversations' });

      expect(cards[0].props('tooltipInfo')).toBe(
        'Number of distinct contacts who started conversations during the selected period.',
      );
      expect(cards[1].props('tooltipInfo')).toBe(
        'Contacts who started more than one conversation during the selected period.',
      );
      expect(cards[2].props('tooltipInfo')).toBe(
        'Average conversations considering all unique contacts during the period.',
      );
    });
  });

  describe('Non-clickable cards', () => {
    it('should not pass isClickable prop to cards', () => {
      const cards = wrapper
        .find('[data-testid="contacts-header-left"]')
        .findAllComponents({ name: 'CardConversations' });

      cards.forEach((card) => {
        expect(card.props('isClickable')).toBeFalsy();
      });
    });
  });

  describe('Mock mode (shouldUseMock = true)', () => {
    beforeEach(() => {
      mockShouldUseMock.value = true;
    });

    afterEach(() => {
      mockShouldUseMock.value = false;
    });

    it('should still call API on mount when shouldUseMock is true', async () => {
      const contactsApi = await import(
        '@/services/api/resources/conversational/contacts'
      );
      contactsApi.default.getConversationalContacts.mockClear();

      createWrapper();
      await new Promise((r) => setTimeout(r, 50));

      expect(contactsApi.default.getConversationalContacts).toHaveBeenCalled();
    });

    it('should render mock cards with formatted values directly', () => {
      const testWrapper = createWrapper();
      const vm = testWrapper.vm;

      expect(vm.cards).toHaveLength(3);
      vm.cards.forEach((card) => {
        expect(card.isLoading).toBe(false);
        expect(card.value).not.toBe('-');
      });
    });

    it('should render unique with formatted number and no description', () => {
      const testWrapper = createWrapper();
      const vm = testWrapper.vm;

      const uniqueCard = vm.cards.find((c) => c.id === 'unique');
      expect(uniqueCard.value).toBe('80');
      expect(uniqueCard.description).toBeNull();
    });

    it('should render returning with formatted number and percentage description', () => {
      const testWrapper = createWrapper();
      const vm = testWrapper.vm;

      const returningCard = vm.cards.find((c) => c.id === 'returning');
      expect(returningCard.value).toBe('28');
      expect(returningCard.description).toBe('35.00% of total unique contacts');
    });

    it('should render avg card with formatted decimal and no description', () => {
      const testWrapper = createWrapper();
      const vm = testWrapper.vm;

      const avgCard = vm.cards.find(
        (c) => c.id === 'avg_conversations_per_contact',
      );
      expect(avgCard.value).toBe('1.8');
      expect(avgCard.description).toBeNull();
    });
  });

  describe('Computed Properties Reactivity', () => {
    it('should reactively compute card properties', () => {
      const vm = wrapper.vm;

      expect(vm.cards).toHaveLength(3);

      vm.cards.forEach((card) => {
        expect(card).toHaveProperty('id');
        expect(card).toHaveProperty('title');
        expect(card).toHaveProperty('value');
        expect(card).toHaveProperty('description');
        expect(card).toHaveProperty('tooltipInfo');
        expect(card).toHaveProperty('isLoading');
      });
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
    });
  });
});
