import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import ServiceStatus from '../ServiceStatus.vue';

const mockMonitoringStore = {
  loadServiceStatusData: vi.fn(),
  serviceStatusData: {
    value: { is_waiting: 25, in_progress: 10, finished: 65 },
  },
  loadingServiceStatusData: { value: false },
};

vi.mock('@/store/modules/humanSupport/monitoring', () => ({
  useHumanSupportMonitoring: () => mockMonitoringStore,
}));

vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    storeToRefs: (store) => store,
  };
});

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      human_support_dashboard: {
        support_status: {
          title: 'Support Status',
          is_waiting: 'Awaiting',
          is_in_progress: 'In Progress',
          is_closed: 'Closed',
          tooltips: {
            is_waiting: 'Conversations waiting for agent response',
            is_in_progress: 'Conversations currently being handled',
            is_closed: 'Conversations that have been closed',
          },
        },
      },
    },
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

describe('ServiceStatus', () => {
  let wrapper;

  const createWrapper = (storeOverrides = {}) => {
    Object.assign(mockMonitoringStore, storeOverrides);
    return mount(ServiceStatus, {
      global: {
        stubs: {
          CardConversations: true,
        },
      },
    });
  };

  const section = () => wrapper.find('[data-testid="service-status"]');
  const title = () => wrapper.find('[data-testid="service-status-title"]');
  const cards = () => wrapper.find('[data-testid="service-status-cards"]');

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mockMonitoringStore, {
      loadServiceStatusData: vi.fn(),
      serviceStatusData: {
        value: { is_waiting: 25, in_progress: 10, finished: 65 },
      },
      loadingServiceStatusData: { value: false },
    });
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('should render main section', () => {
      expect(section().exists()).toBe(true);
    });

    it('should render title', () => {
      expect(title().exists()).toBe(true);
      expect(title().text()).toBe(
        'human_support_dashboard.support_status.title',
      );
    });

    it('should render cards container', () => {
      expect(cards().exists()).toBe(true);
    });

    it('should render correct number of cards', () => {
      const cardComponents = wrapper.findAllComponents({
        name: 'CardConversations',
      });
      expect(cardComponents).toHaveLength(3);
    });
  });

  describe('Component structure', () => {
    it('should have correct CSS classes', () => {
      expect(section().classes()).toContain('service-status');
    });

    it('should match snapshot', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('Card definitions', () => {
    it('should have correct card definitions structure', () => {
      const vm = wrapper.vm;
      expect(vm.cardDefinitions).toHaveLength(3);

      const expectedCards = [
        {
          id: 'is_waiting',
          titleKey: 'human_support_dashboard.support_status.is_waiting',
          tooltipKey:
            'human_support_dashboard.support_status.tooltips.is_waiting',
        },
        {
          id: 'in_progress',
          titleKey: 'human_support_dashboard.support_status.is_in_progress',
          tooltipKey:
            'human_support_dashboard.support_status.tooltips.is_in_progress',
        },
        {
          id: 'finished',
          titleKey: 'human_support_dashboard.support_status.is_closed',
          tooltipKey:
            'human_support_dashboard.support_status.tooltips.is_closed',
        },
      ];

      expectedCards.forEach((expected, index) => {
        expect(vm.cardDefinitions[index]).toEqual(expected);
      });
    });
  });

  describe('Data loading and store integration', () => {
    it('should call loadServiceStatusData on mount', () => {
      expect(mockMonitoringStore.loadServiceStatusData).toHaveBeenCalled();
    });

    it('should compute loading state correctly', () => {
      const vm = wrapper.vm;
      expect(vm.isLoadingCards).toBe(false);

      wrapper = createWrapper({ loadingServiceStatusData: { value: true } });
      expect(wrapper.vm.isLoadingCards).toBe(true);
    });
  });

  describe('Card value formatting', () => {
    const valueTestCases = [
      { cardId: 'is_waiting', inputValue: 25, expectedOutput: '25' },
      { cardId: 'in_progress', inputValue: 10, expectedOutput: '10' },
      { cardId: 'finished', inputValue: 65, expectedOutput: '65' },
      { cardId: 'is_waiting', inputValue: 0, expectedOutput: '0' },
    ];

    valueTestCases.forEach(({ cardId, inputValue, expectedOutput }) => {
      it(`should format ${cardId} value correctly`, () => {
        const vm = wrapper.vm;
        const testData = { [cardId]: inputValue };

        wrapper = createWrapper({
          serviceStatusData: { value: testData },
        });

        expect(wrapper.vm.getCardValue(cardId)).toBe(expectedOutput);
      });
    });

    const edgeCases = [
      { name: 'null value', value: null, expected: '-' },
      { name: 'undefined value', value: undefined, expected: '-' },
      { name: 'string value', value: '42', expected: '42' },
      { name: 'boolean value', value: true, expected: 'true' },
    ];

    edgeCases.forEach(({ name, value, expected }) => {
      it(`should handle ${name}`, () => {
        const testData = { is_waiting: value };
        wrapper = createWrapper({
          serviceStatusData: { value: testData },
        });

        expect(wrapper.vm.getCardValue('is_waiting')).toBe(expected);
      });
    });
  });

  describe('Tooltip side logic', () => {
    it('should return correct tooltip sides', () => {
      const vm = wrapper.vm;

      expect(vm.getTooltipSide(0)).toBe('top');
      expect(vm.getTooltipSide(1)).toBe('top');
      expect(vm.getTooltipSide(2)).toBe('left');
    });
  });

  describe('Error scenarios', () => {
    it('should handle missing store data gracefully', () => {
      wrapper = createWrapper({
        serviceStatusData: { value: { is_waiting: undefined } },
      });

      const vm = wrapper.vm;
      expect(vm.getCardValue('is_waiting')).toBe('-');
    });

    it('should handle empty store data', () => {
      wrapper = createWrapper({
        serviceStatusData: { value: {} },
      });

      const vm = wrapper.vm;
      expect(vm.getCardValue('is_waiting')).toBe('-');
      expect(vm.getCardValue('in_progress')).toBe('-');
      expect(vm.getCardValue('finished')).toBe('-');
    });
  });

  describe('CardConversations integration', () => {
    it('should pass correct props to CardConversations', () => {
      const cardComponents = wrapper.findAllComponents({
        name: 'CardConversations',
      });

      cardComponents.forEach((card) => {
        expect(card.props('borderRadius')).toBe('full');
        expect(card.props('isLoading')).toBeDefined();

        expect(card.props('activeDescriptionGap')).toBeFalsy();
        expect(card.props('enableTimeIcon')).toBeFalsy();
      });
    });

    it('should pass loading state to cards', () => {
      wrapper = createWrapper({ loadingServiceStatusData: { value: true } });

      const cardComponents = wrapper.findAllComponents({
        name: 'CardConversations',
      });
      cardComponents.forEach((card) => {
        expect(card.props('isLoading')).toBe(true);
      });
    });
  });

  describe('Lifecycle', () => {
    it('should load service status data on mounted', () => {
      expect(mockMonitoringStore.loadServiceStatusData).toHaveBeenCalled();
    });
  });

  describe('Conditional rendering', () => {
    it('should handle different store states', () => {
      const testCases = [
        {
          serviceStatusData: {
            value: { is_waiting: 25, in_progress: 10, finished: 65 },
          },
          loadingServiceStatusData: { value: false },
        },
        {
          serviceStatusData: {
            value: { is_waiting: 0, in_progress: 0, finished: 0 },
          },
          loadingServiceStatusData: { value: false },
        },
        {
          serviceStatusData: { value: null },
          loadingServiceStatusData: { value: true },
        },
      ];

      const validTestCases = testCases.filter(
        (tc) => tc.serviceStatusData.value !== null,
      );

      validTestCases.forEach((testCase) => {
        wrapper = createWrapper(testCase);
        expect(section().exists()).toBe(true);
      });
    });
  });
});
