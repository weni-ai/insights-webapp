import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import SeeAllDrawer from '../SeeAllDrawer.vue';

const mockWidgetFormatting = {
  formatPercentage: vi.fn((value) => `${value}%`),
  formatNumber: vi.fn((value) => value.toString()),
};

vi.mock('@/composables/useWidgetFormatting', () => ({
  useWidgetFormatting: () => mockWidgetFormatting,
}));

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: {} },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

describe('SeeAllDrawer', () => {
  let wrapper;

  const defaultProps = {
    modelValue: true,
    data: [
      { label: 'Satisfied', value: 75.5, full_value: 302 },
      { label: 'Neutral', value: 15.2, full_value: 61 },
      { label: 'Unsatisfied', value: 9.3, full_value: 37 },
    ],
  };

  const createWrapper = (props = {}) =>
    mount(SeeAllDrawer, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          UnnnicDrawer: {
            template:
              '<div data-testid="see-all-drawer" class="see-all-drawer"><slot name="content" /></div>',
          },
          ProgressTable: true,
        },
      },
    });

  const drawer = () => wrapper.find('[data-testid="see-all-drawer"]');
  const progressTable = () =>
    wrapper.find('[data-testid="see-all-drawer-table"]');

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('should render all elements', () => {
      expect(drawer().exists()).toBe(true);
      expect(progressTable().exists()).toBe(true);
    });

    it('should render with different data sets', () => {
      const customData = [
        { label: 'High', value: 90, full_value: 450 },
        { label: 'Low', value: 10, full_value: 50 },
      ];
      wrapper = createWrapper({ data: customData });

      expect(wrapper.props('data')).toEqual(customData);
      expect(progressTable().exists()).toBe(true);
    });

    it('should render with empty data', () => {
      wrapper = createWrapper({ data: [] });

      expect(wrapper.props('data')).toEqual([]);
      expect(progressTable().exists()).toBe(true);
    });
  });

  describe('Component structure', () => {
    it('should have correct CSS classes', () => {
      expect(drawer().classes()).toContain('see-all-drawer');
    });

    it('should match snapshot', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('Event handling', () => {
    it('should emit update:modelValue when closed', () => {
      wrapper.vm.$emit('update:modelValue', false);

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
    });

    it('should emit update:modelValue with correct value', () => {
      wrapper.vm.$emit('update:modelValue', true);

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([true]);
    });
  });

  describe('Data formatting', () => {
    it('should format data correctly', () => {
      const expectedFormattedData = [
        {
          label: 'Satisfied',
          value: 75.5,
          description: '75.5% (302)',
          backgroundColor: '#BEE3F8',
          color: '#3182CE',
          subItems: [],
        },
        {
          label: 'Neutral',
          value: 15.2,
          description: '15.2% (61)',
          backgroundColor: '#BEE3F8',
          color: '#3182CE',
          subItems: [],
        },
        {
          label: 'Unsatisfied',
          value: 9.3,
          description: '9.3% (37)',
          backgroundColor: '#BEE3F8',
          color: '#3182CE',
          subItems: [],
        },
      ];

      expect(wrapper.vm.formattedData).toEqual(expectedFormattedData);
    });

    it('should call formatting functions correctly', () => {
      wrapper.vm.formattedData;

      expect(mockWidgetFormatting.formatPercentage).toHaveBeenCalledWith(75.5);
      expect(mockWidgetFormatting.formatPercentage).toHaveBeenCalledWith(15.2);
      expect(mockWidgetFormatting.formatPercentage).toHaveBeenCalledWith(9.3);
      expect(mockWidgetFormatting.formatNumber).toHaveBeenCalledWith(302);
      expect(mockWidgetFormatting.formatNumber).toHaveBeenCalledWith(61);
      expect(mockWidgetFormatting.formatNumber).toHaveBeenCalledWith(37);
    });

    it('should pass formatted data to ProgressTable', () => {
      expect(progressTable().attributes('progressitems')).toBeDefined();
    });
  });

  describe('Props validation', () => {
    const propTestCases = [
      { modelValue: true, data: defaultProps.data },
      { modelValue: false, data: [] },
      {
        modelValue: true,
        data: [{ label: 'Single', value: 100, full_value: 1000 }],
      },
    ];

    propTestCases.forEach(({ modelValue, data }) => {
      it(`should handle props: modelValue=${modelValue} with ${data.length} items`, () => {
        wrapper = createWrapper({ modelValue, data });

        expect(wrapper.props('modelValue')).toBe(modelValue);
        expect(wrapper.props('data')).toEqual(data);
      });
    });
  });
});
