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

vi.mock('@/utils/treemap', () => ({
  addColors: vi.fn((data) =>
    data.map((item, index) => ({
      ...item,
      color: `#color${index}`,
      hoverColor: `#hover${index}`,
    })),
  ),
}));

import { addColors } from '@/utils/treemap';
const mockAddColors = addColors;

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      conversations_dashboard: {
        most_talked_about_topics: {
          title: 'Most Talked About Topics',
          subtopics: 'Subtopics',
        },
      },
    },
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

describe('SeeAllDrawer', () => {
  let wrapper;

  const defaultProps = {
    modelValue: true,
    data: [
      {
        label: 'Technology',
        percentage: 45.2,
        value: 1520,
        subtopics: [
          { label: 'AI', percentage: 25.1, value: 845 },
          { label: 'Web Development', percentage: 20.1, value: 675 },
        ],
      },
      {
        label: 'Business',
        percentage: 32.8,
        value: 1104,
        subtopics: [{ label: 'Marketing', percentage: 15.5, value: 522 }],
      },
      { label: 'Health', percentage: 22.0, value: 740, subtopics: [] },
    ],
    expandedItems: ['Technology'],
  };

  const createWrapper = (props = {}) =>
    mount(SeeAllDrawer, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          UnnnicDrawer: {
            template:
              '<div data-testid="topics-see-all-drawer" class="see-all-drawer" @click="$emit(\'close\')"><slot name="content" /></div>',
            emits: ['close'],
          },
          ProgressTable: true,
        },
      },
    });

  const drawer = () => wrapper.find('[data-testid="topics-see-all-drawer"]');
  const progressTable = () =>
    wrapper.find('[data-testid="topics-see-all-table"]');

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
        {
          label: 'Sports',
          percentage: 60.0,
          value: 2000,
          subtopics: [{ label: 'Football', percentage: 35.0, value: 1200 }],
        },
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

    it('should emit update:modelValue false when drawer close event is triggered', async () => {
      // Simulate clicking the drawer to trigger close event
      await drawer().trigger('click');

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
    });

    it('should handle expandedItems model updates', () => {
      const newExpandedItems = ['Business', 'Health'];
      wrapper.vm.$emit('update:expandedItems', newExpandedItems);

      expect(wrapper.emitted('update:expandedItems')).toBeTruthy();
      expect(wrapper.emitted('update:expandedItems')[0]).toEqual([
        newExpandedItems,
      ]);
    });
  });

  describe('Data processing', () => {
    it('should call addColors with data', () => {
      expect(mockAddColors).toHaveBeenCalledWith(defaultProps.data);
    });

    it('should format data correctly', () => {
      const expectedFormattedData = [
        {
          label: 'Technology',
          value: 45.2,
          description: '45.2% (1520)',
          backgroundColor: '#color0',
          color: '#hover0',
          subItems: [
            {
              label: 'AI',
              value: 25.1,
              description: '25.1% (845)',
              backgroundColor: '#color0',
              color: '#hover0',
            },
            {
              label: 'Web Development',
              value: 20.1,
              description: '20.1% (675)',
              backgroundColor: '#color0',
              color: '#hover0',
            },
          ],
        },
        {
          label: 'Business',
          value: 32.8,
          description: '32.8% (1104)',
          backgroundColor: '#color1',
          color: '#hover1',
          subItems: [
            {
              label: 'Marketing',
              value: 15.5,
              description: '15.5% (522)',
              backgroundColor: '#color1',
              color: '#hover1',
            },
          ],
        },
        {
          label: 'Health',
          value: 22.0,
          description: '22% (740)',
          backgroundColor: '#color2',
          color: '#hover2',
          subItems: [],
        },
      ];

      expect(wrapper.vm.formattedData).toEqual(expectedFormattedData);
    });

    it('should call formatting functions correctly', () => {
      wrapper.vm.formattedData;

      expect(mockWidgetFormatting.formatPercentage).toHaveBeenCalledWith(45.2);
      expect(mockWidgetFormatting.formatPercentage).toHaveBeenCalledWith(32.8);
      expect(mockWidgetFormatting.formatPercentage).toHaveBeenCalledWith(22.0);
      expect(mockWidgetFormatting.formatNumber).toHaveBeenCalledWith(1520);
      expect(mockWidgetFormatting.formatNumber).toHaveBeenCalledWith(1104);
      expect(mockWidgetFormatting.formatNumber).toHaveBeenCalledWith(740);
    });

    it('should handle subtopics formatting', () => {
      wrapper.vm.formattedData;

      expect(mockWidgetFormatting.formatPercentage).toHaveBeenCalledWith(25.1);
      expect(mockWidgetFormatting.formatPercentage).toHaveBeenCalledWith(20.1);
      expect(mockWidgetFormatting.formatPercentage).toHaveBeenCalledWith(15.5);
      expect(mockWidgetFormatting.formatNumber).toHaveBeenCalledWith(845);
      expect(mockWidgetFormatting.formatNumber).toHaveBeenCalledWith(675);
      expect(mockWidgetFormatting.formatNumber).toHaveBeenCalledWith(522);
    });

    it('should pass correct props to ProgressTable', () => {
      expect(progressTable().attributes('progressitems')).toBeDefined();
      expect(progressTable().attributes('expandeditems')).toBeDefined();
      expect(progressTable().attributes('subitemsdescription')).toBeDefined();
    });
  });

  describe('Props validation', () => {
    const propTestCases = [
      {
        modelValue: true,
        data: defaultProps.data,
        expandedItems: ['Technology'],
      },
      { modelValue: false, data: [], expandedItems: [] },
      {
        modelValue: true,
        data: [{ label: 'Single', percentage: 100, value: 500, subtopics: [] }],
        expandedItems: [],
      },
    ];

    propTestCases.forEach(({ modelValue, data, expandedItems }) => {
      it(`should handle props: modelValue=${modelValue} with ${data.length} items and ${expandedItems.length} expanded`, () => {
        wrapper = createWrapper({ modelValue, data, expandedItems });

        expect(wrapper.props('modelValue')).toBe(modelValue);
        expect(wrapper.props('data')).toEqual(data);
        expect(wrapper.props('expandedItems')).toEqual(expandedItems);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle topics without subtopics', () => {
      const dataWithoutSubtopics = [
        { label: 'Simple Topic', percentage: 50, value: 100, subtopics: [] },
      ];
      wrapper = createWrapper({ data: dataWithoutSubtopics });

      const formattedData = wrapper.vm.formattedData;
      expect(formattedData[0].subItems).toEqual([]);
    });

    it('should handle topics with undefined subtopics', () => {
      const dataWithUndefinedSubtopics = [
        { label: 'Topic', percentage: 50, value: 100 },
      ];
      wrapper = createWrapper({ data: dataWithUndefinedSubtopics });

      const formattedData = wrapper.vm.formattedData;
      expect(formattedData[0].subItems).toBeUndefined();
    });
  });
});
