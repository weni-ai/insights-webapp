import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import TimeMetrics from '../TimeMetrics.vue';

const mockMonitoringStore = {
  loadTimeMetricsData: vi.fn(),
  timeMetricsData: {
    value: {
      average_time_is_waiting: { average: 120, max: 300 },
      average_time_first_response: { average: 45, max: 90 },
      average_time_chat: { average: 600, max: 1200 },
    },
  },
  loadingTimeMetricsData: { value: false },
};

vi.mock('@/store/modules/humanSupport/monitoring', () => ({
  useHumanSupportMonitoring: () => mockMonitoringStore,
}));

vi.mock('@/utils/time', () => ({
  formatSecondsToTime: vi.fn((seconds) => {
    if (seconds === null || seconds === undefined) return '-';
    if (seconds === 0) return '0s';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600)
      return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)
        .toString()
        .padStart(2, '0')}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, '0')}m ${Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0')}s`;
  }),
}));

vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    storeToRefs: (store) => store,
  };
});

describe('TimeMetrics', () => {
  let wrapper;

  const createWrapper = (storeOverrides = {}) => {
    Object.assign(mockMonitoringStore, storeOverrides);
    return mount(TimeMetrics, {
      global: {
        stubs: {
          CardConversations: true,
        },
      },
    });
  };

  const section = () => wrapper.find('[data-testid="time-metrics"]');
  const title = () => wrapper.find('[data-testid="time-metrics-title"]');
  const cards = () => wrapper.find('[data-testid="time-metrics-cards"]');

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mockMonitoringStore, {
      loadTimeMetricsData: vi.fn(),
      timeMetricsData: {
        value: {
          average_time_is_waiting: { average: 120, max: 300 },
          average_time_first_response: { average: 45, max: 90 },
          average_time_chat: { average: 600, max: 1200 },
        },
      },
      loadingTimeMetricsData: { value: false },
    });
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('should render main section', () => {
      expect(section().exists()).toBe(true);
    });

    it('should render title', () => {
      expect(title().exists()).toBe(true);
      expect(title().text()).toBe('Time metrics now');
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
      expect(section().classes()).toContain('time-metrics');
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
          id: 'average_time_is_waiting',
          titleKey:
            'human_support_dashboard.time_metrics.average_time_is_waiting',
          tooltipKey:
            'human_support_dashboard.time_metrics.tooltips.average_time_is_waiting',
        },
        {
          id: 'average_time_first_response',
          titleKey:
            'human_support_dashboard.time_metrics.average_time_first_response',
          tooltipKey:
            'human_support_dashboard.time_metrics.tooltips.average_time_first_response',
        },
        {
          id: 'average_time_chat',
          titleKey: 'human_support_dashboard.time_metrics.average_time_chat',
          tooltipKey:
            'human_support_dashboard.time_metrics.tooltips.average_time_chat',
        },
      ];

      expectedCards.forEach((expected, index) => {
        expect(vm.cardDefinitions[index]).toEqual(expected);
      });
    });
  });

  describe('Data loading and store integration', () => {
    it('should call loadTimeMetricsData on mount', () => {
      expect(mockMonitoringStore.loadTimeMetricsData).toHaveBeenCalled();
    });

    it('should compute loading state correctly', () => {
      const vm = wrapper.vm;
      expect(vm.isLoadingCards).toBe(false);

      wrapper = createWrapper({ loadingTimeMetricsData: { value: true } });
      expect(wrapper.vm.isLoadingCards).toBe(true);
    });
  });

  describe('Card value formatting', () => {
    it('should format time values correctly', () => {
      const vm = wrapper.vm;

      expect(vm.getCardValue('average_time_is_waiting')).toBe('2m 00s');
      expect(vm.getCardValue('average_time_first_response')).toBe('45s');
      expect(vm.getCardValue('average_time_chat')).toBe('10m 00s');
    });

    it('should format sub values (max times) correctly', () => {
      const vm = wrapper.vm;

      expect(vm.getCardSubValue('average_time_is_waiting')).toContain(
        'Max: 5m 00s',
      );
      expect(vm.getCardSubValue('average_time_first_response')).toContain(
        'Max: 1m 30s',
      );
      expect(vm.getCardSubValue('average_time_chat')).toContain('Max: 20m 00s');
    });

    const edgeCases = [
      {
        name: 'null values',
        data: { average: null, max: null },
        expectedValue: '-',
        expectedDesc: '',
      },
      {
        name: 'undefined values',
        data: { average: undefined, max: undefined },
        expectedValue: '-',
        expectedDesc: '',
      },
      {
        name: 'zero values',
        data: { average: 0, max: 0 },
        expectedValue: '0s',
        expectedDesc: 'Max: 0s',
      },
    ];

    edgeCases.forEach(({ name, data, expectedValue, expectedDesc }) => {
      it(`should handle ${name}`, () => {
        const testData = { average_time_is_waiting: data };
        wrapper = createWrapper({
          timeMetricsData: { value: testData },
        });

        const vm = wrapper.vm;
        expect(vm.getCardValue('average_time_is_waiting')).toBe(expectedValue);

        if (expectedDesc) {
          expect(vm.getCardSubValue('average_time_is_waiting')).toContain(
            'Max:',
          );
        } else {
          expect(vm.getCardSubValue('average_time_is_waiting')).toBe('');
        }
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
        timeMetricsData: {
          value: {
            average_time_is_waiting: { average: undefined, max: undefined },
          },
        },
      });

      const vm = wrapper.vm;
      expect(vm.getCardValue('average_time_is_waiting')).toBe('-');
      expect(vm.getCardSubValue('average_time_is_waiting')).toBe('');
    });

    it('should handle malformed store data', () => {
      const malformedData = {
        average_time_is_waiting: {},
        average_time_first_response: { average: 'invalid' },
        average_time_chat: { max: 'invalid' },
      };

      wrapper = createWrapper({
        timeMetricsData: { value: malformedData },
      });

      const vm = wrapper.vm;
      expect(() => vm.getCardValue('average_time_is_waiting')).not.toThrow();
      expect(() =>
        vm.getCardSubValue('average_time_first_response'),
      ).not.toThrow();
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

        expect(card.props('activeDescriptionGap')).toBe(true);
        expect(card.props('enableTimeIcon')).toBe(true);
      });
    });

    it('should pass loading state to cards', () => {
      wrapper = createWrapper({ loadingTimeMetricsData: { value: true } });

      const cardComponents = wrapper.findAllComponents({
        name: 'CardConversations',
      });
      cardComponents.forEach((card) => {
        expect(card.props('isLoading')).toBe(true);
      });
    });
  });

  describe('Lifecycle', () => {
    it('should load time metrics data on mounted', () => {
      expect(mockMonitoringStore.loadTimeMetricsData).toHaveBeenCalled();
    });
  });

  describe('Edge cases and boundary testing', () => {
    it('should handle extremely large time values', () => {
      const extremeData = {
        average_time_is_waiting: { average: 86400, max: 172800 },
      };

      wrapper = createWrapper({
        timeMetricsData: { value: extremeData },
      });

      const vm = wrapper.vm;
      expect(() => vm.getCardValue('average_time_is_waiting')).not.toThrow();

      const result = vm.getCardValue('average_time_is_waiting');
      expect(result).toContain('h');
    });

    it('should handle negative time values gracefully', () => {
      const negativeData = {
        average_time_is_waiting: { average: -60, max: -120 },
      };

      wrapper = createWrapper({
        timeMetricsData: { value: negativeData },
      });

      const vm = wrapper.vm;
      expect(() => vm.getCardValue('average_time_is_waiting')).not.toThrow();
    });
  });

  describe('Conditional rendering', () => {
    it('should handle different store states', () => {
      const testCases = [
        {
          timeMetricsData: {
            value: {
              average_time_is_waiting: { average: 120, max: 300 },
              average_time_first_response: { average: 45, max: 90 },
              average_time_chat: { average: 600, max: 1200 },
            },
          },
          loadingTimeMetricsData: { value: false },
        },
        {
          timeMetricsData: {
            value: {
              average_time_is_waiting: { average: null, max: null },
              average_time_first_response: { average: null, max: null },
              average_time_chat: { average: null, max: null },
            },
          },
          loadingTimeMetricsData: { value: false },
        },
        {
          timeMetricsData: { value: null },
          loadingTimeMetricsData: { value: true },
        },
      ];

      const validTestCases = testCases.filter(
        (tc) => tc.timeMetricsData.value !== null,
      );

      validTestCases.forEach((testCase) => {
        wrapper = createWrapper(testCase);
        expect(section().exists()).toBe(true);
      });
    });
  });
});
