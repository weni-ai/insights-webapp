import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, config } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import FilterSelectDate from '@/components/insights/Layout/HeaderFilters/FilterSelectDate.vue';
import { createI18n } from 'vue-i18n';
import {
  getYesterdayDate,
  getLastNDays,
  getLastMonthRange,
} from '@/utils/time';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {},
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

vi.mock('@/utils/time', () => ({
  getYesterdayDate: vi.fn(),
  getLastNDays: vi.fn(),
  getLastMonthRange: vi.fn(),
}));

const createWrapper = (props = {}) => {
  const pinia = createTestingPinia({
    initialState: {},
  });

  return mount(FilterSelectDate, {
    props: {
      modelValue: {},
      ...props,
    },
    global: {
      plugins: [pinia, i18n],
      stubs: {
        UnnnicSelectSmart: {
          template:
            '<div class="unnnic-select-smart-mock" data-testid="unnnic-select-smart"></div>',
          props: ['modelValue', 'options', 'size', 'orderedByIndex'],
          emits: ['update:model-value'],
        },
      },
    },
  });
};

describe('FilterSelectDate', () => {
  let wrapper;

  const mockDateRanges = {
    yesterday: {
      start: '2024-01-01',
      end: '2024-01-01',
      dmFormat: '01/01',
    },
    last7Days: {
      start: '2023-12-25',
      end: '2024-01-01',
      dmFormat: '25/12 - 01/01',
    },
    last14Days: {
      start: '2023-12-18',
      end: '2024-01-01',
      dmFormat: '18/12 - 01/01',
    },
    last30Days: {
      start: '2023-12-02',
      end: '2024-01-01',
      dmFormat: '02/12 - 01/01',
    },
    last90Days: {
      start: '2023-10-03',
      end: '2024-01-01',
      dmFormat: '03/10 - 01/01',
    },
    lastMonth: {
      start: '2023-12-01',
      end: '2023-12-31',
      dmFormat: '01/12 - 31/12',
    },
  };

  beforeEach(() => {
    getYesterdayDate.mockReturnValue(mockDateRanges.yesterday);
    getLastNDays.mockImplementation(
      (days) => mockDateRanges[`last${days}Days`],
    );
    getLastMonthRange.mockReturnValue(mockDateRanges.lastMonth);

    wrapper = createWrapper();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders UnnnicSelectSmart component correctly', () => {
      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-select-smart"]',
      );
      expect(selectComponent.exists()).toBeTruthy();
    });

    it('passes correct props to UnnnicSelectSmart', () => {
      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-select-smart"]',
      );
      expect(selectComponent.props('size')).toBe('md');
      expect(selectComponent.props('orderedByIndex')).toBe(true);
    });

    it('applies correct CSS class', () => {
      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-select-smart"]',
      );
      expect(selectComponent.classes()).toContain('filter-date');
    });
  });

  describe('Date options generation', () => {
    it('generates correct date options with yesterday', () => {
      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-select-smart"]',
      );
      const options = selectComponent.props('options');

      expect(options[0]).toEqual({
        label: 'Yesterday (01/01)',
        value: {
          start: '2024-01-01',
          end: '2024-01-01',
        },
      });
    });

    it('generates correct date options for last 7 days', () => {
      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-select-smart"]',
      );
      const options = selectComponent.props('options');

      expect(options[1]).toEqual({
        label: 'Last 7 days (25/12 - 01/01)',
        value: {
          start: '2023-12-25',
          end: '2024-01-01',
        },
      });
    });

    it('generates correct date options for last 14 days', () => {
      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-select-smart"]',
      );
      const options = selectComponent.props('options');

      expect(options[2]).toEqual({
        label: 'Last 14 days (18/12 - 01/01)',
        value: {
          start: '2023-12-18',
          end: '2024-01-01',
        },
      });
    });

    it('generates correct date options for last 30 days', () => {
      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-select-smart"]',
      );
      const options = selectComponent.props('options');

      expect(options[3]).toEqual({
        label: 'Last 30 days (02/12 - 01/01)',
        value: {
          start: '2023-12-02',
          end: '2024-01-01',
        },
      });
    });

    it('generates correct date options for last 90 days', () => {
      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-select-smart"]',
      );
      const options = selectComponent.props('options');

      expect(options[4]).toEqual({
        label: 'Last 90 days (03/10 - 01/01)',
        value: {
          start: '2023-10-03',
          end: '2024-01-01',
        },
      });
    });

    it('generates correct date options for previous month', () => {
      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-select-smart"]',
      );
      const options = selectComponent.props('options');

      expect(options[5]).toEqual({
        label: 'Previous month (01/12 - 31/12)',
        value: {
          start: '2023-12-01',
          end: '2023-12-31',
        },
      });
    });

    it('generates all expected date options', () => {
      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-select-smart"]',
      );
      const options = selectComponent.props('options');

      expect(options).toHaveLength(6);
      expect(options[0].label).toContain('Yesterday');
      expect(options[1].label).toContain('Last 7 days');
      expect(options[2].label).toContain('Last 14 days');
      expect(options[3].label).toContain('Last 30 days');
      expect(options[4].label).toContain('Last 90 days');
      expect(options[5].label).toContain('Previous month');
    });
  });

  describe('Model value handling', () => {
    it('initializes with empty modelValue correctly', () => {
      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-select-smart"]',
      );
      expect(selectComponent.props('modelValue')).toEqual([{}]);
    });

    it('initializes with provided modelValue correctly', () => {
      const customModelValue = {
        start: '2024-01-01',
        end: '2024-01-07',
      };

      const customWrapper = createWrapper({
        modelValue: customModelValue,
      });

      const selectComponent = customWrapper.findComponent(
        '[data-testid="unnnic-select-smart"]',
      );
      expect(selectComponent.props('modelValue')).toEqual([customModelValue]);
    });
  });

  describe('Event handling', () => {
    it('emits update:modelValue when date selection changes', async () => {
      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-select-smart"]',
      );
      const selectedOption = [
        {
          label: 'Last 7 days (25/12 - 01/01)',
          value: {
            start: '2023-12-25',
            end: '2024-01-01',
          },
        },
      ];

      await selectComponent.vm.$emit('update:model-value', selectedOption);

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([
        {
          start: '2023-12-25',
          end: '2024-01-01',
        },
      ]);
    });

    it('updates currentDate when updateCurrentDate is called', async () => {
      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-select-smart"]',
      );
      const selectedOption = [
        {
          label: 'Yesterday (01/01)',
          value: {
            start: '2024-01-01',
            end: '2024-01-01',
          },
        },
      ];

      await selectComponent.vm.$emit('update:model-value', selectedOption);

      expect(wrapper.vm.currentDate).toEqual(selectedOption);
    });
  });

  describe('Date range functions calls', () => {
    it('calls getYesterdayDate once', () => {
      expect(getYesterdayDate).toHaveBeenCalledTimes(1);
    });

    it('calls getLastNDays for each day range', () => {
      expect(getLastNDays).toHaveBeenCalledWith(7);
      expect(getLastNDays).toHaveBeenCalledWith(14);
      expect(getLastNDays).toHaveBeenCalledWith(30);
      expect(getLastNDays).toHaveBeenCalledWith(90);
      expect(getLastNDays).toHaveBeenCalledTimes(4);
    });

    it('calls getLastMonthRange once', () => {
      expect(getLastMonthRange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Internationalization', () => {
    it('uses correct translation keys for yesterday', () => {
      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-select-smart"]',
      );
      const options = selectComponent.props('options');

      expect(options[0].label).toBe('Yesterday (01/01)');
    });

    it('uses correct translation keys for last days', () => {
      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-select-smart"]',
      );
      const options = selectComponent.props('options');

      expect(options[1].label).toBe('Last 7 days (25/12 - 01/01)');
      expect(options[2].label).toBe('Last 14 days (18/12 - 01/01)');
      expect(options[3].label).toBe('Last 30 days (02/12 - 01/01)');
      expect(options[4].label).toBe('Last 90 days (03/10 - 01/01)');
    });

    it('uses correct translation keys for previous month', () => {
      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-select-smart"]',
      );
      const options = selectComponent.props('options');

      expect(options[5].label).toBe('Previous month (01/12 - 31/12)');
    });
  });

  describe('Edge cases', () => {
    it('handles empty modelValue prop', () => {
      const customWrapper = createWrapper({ modelValue: {} });
      const selectComponent = customWrapper.findComponent(
        '[data-testid="unnnic-select-smart"]',
      );

      expect(selectComponent.props('modelValue')).toEqual([{}]);
    });

    it('handles null modelValue prop', () => {
      const customWrapper = createWrapper({ modelValue: null });
      const selectComponent = customWrapper.findComponent(
        '[data-testid="unnnic-select-smart"]',
      );

      expect(selectComponent.props('modelValue')).toEqual([null]);
    });

    it('handles undefined modelValue prop', () => {
      const customWrapper = createWrapper({ modelValue: undefined });
      const selectComponent = customWrapper.findComponent(
        '[data-testid="unnnic-select-smart"]',
      );

      expect(selectComponent.props('modelValue')).toEqual([{}]);
    });
  });
});
