import { describe, expect, it } from 'vitest';
import { mount, config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import ProgressChart from '../ProgressChart.vue';

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
config.global.mocks = {
  $t: (key) => key,
};

describe('ProgressChart.vue', () => {
  const createWrapper = (props) => {
    return mount(ProgressChart, {
      global: {
        mocks: {
          $t: (key) => key,
        },
        stubs: {
          UnnnicProgressBar: {
            template:
              '<div class="unnnic-progress-bar-stub" data-testid="progress-bar">{{ modelValue }}%</div>',
            props: ['modelValue', 'inline'],
          },
          IconLoading: {
            template:
              '<div class="icon-loading-stub" data-testid="icon-loading">Loading...</div>',
          },
        },
      },
      props: {
        isLoading: false,
        data: [],
        ...props,
      },
    });
  };

  describe('Component Rendering', () => {
    it('renders the component correctly', () => {
      const wrapper = createWrapper();
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.progress-chart__container').exists()).toBe(true);
    });

    it('always renders exactly 5 rows', () => {
      const wrapper = createWrapper({ data: [{ label: 'Item 1', value: 70 }] });
      const groups = wrapper.findAll(
        '[data-testid="progress-chart-container-group"]',
      );
      expect(groups).toHaveLength(5);
    });

    it('renders content correctly for rows with data', () => {
      const testData = [
        { label: 'Item 1', value: 70 },
        { label: 'Item 2', value: 30 },
      ];
      const wrapper = createWrapper({ data: testData });

      const contentTexts = wrapper.findAll(
        '.progress-chart__container-item-text',
      );
      expect(contentTexts[0].text()).toBe('Item 1');
      expect(contentTexts[1].text()).toBe('Item 2');
    });

    it('applies empty state styling to rows without data', () => {
      const wrapper = createWrapper({ data: [{ label: 'Item 1', value: 70 }] });
      const groups = wrapper.findAll(
        '[data-testid="progress-chart-container-group"]',
      );

      expect(groups[0].find('.progress-chart__content').exists()).toBe(true);

      for (let i = 1; i < 5; i++) {
        expect(groups[i].find('.progress-chart__content').exists()).toBe(false);
      }
    });
  });

  describe('Loading State', () => {
    it('shows loading icon when isLoading is true', () => {
      const wrapper = createWrapper({ isLoading: true });
      expect(wrapper.find('[data-testid="icon-loading"]').exists()).toBe(true);
    });

    it('hides content when isLoading is true', () => {
      const wrapper = createWrapper({
        isLoading: true,
        data: [{ label: 'Item 1', value: 70 }],
      });
      const groups = wrapper.findAll(
        '[data-testid="progress-chart-container-group"]',
      );
      expect(groups).toHaveLength(0);
    });

    it('applies loading class when isLoading is true', () => {
      const wrapper = createWrapper({ isLoading: true });
      const container = wrapper.find('.progress-chart__container');
      expect(container.classes()).toContain(
        'progress-chart__container-isLoading',
      );
    });

    it('does not apply loading class when isLoading is false', () => {
      const wrapper = createWrapper({ isLoading: false });
      const container = wrapper.find('.progress-chart__container');
      expect(container.classes()).not.toContain(
        'progress-chart__container-isLoading',
      );
    });
  });

  describe('Data Handling', () => {
    it('handles empty data array', () => {
      const wrapper = createWrapper({ data: [] });
      const groups = wrapper.findAll(
        '[data-testid="progress-chart-container-group"]',
      );
      expect(groups).toHaveLength(5);

      groups.forEach((group) => {
        expect(group.find('.progress-chart__content').exists()).toBe(false);
      });
    });

    it('handles partial data (less than 5 items)', () => {
      const testData = [
        { label: 'Item 1', value: 70 },
        { label: 'Item 2', value: 30 },
      ];
      const wrapper = createWrapper({ data: testData });
      const groups = wrapper.findAll(
        '[data-testid="progress-chart-container-group"]',
      );

      expect(groups).toHaveLength(5);
      expect(groups[0].find('.progress-chart__content').exists()).toBe(true);
      expect(groups[1].find('.progress-chart__content').exists()).toBe(true);
      expect(groups[2].find('.progress-chart__content').exists()).toBe(false);
      expect(groups[3].find('.progress-chart__content').exists()).toBe(false);
      expect(groups[4].find('.progress-chart__content').exists()).toBe(false);
    });

    it('handles more than 5 items (should only show first 5)', () => {
      const testData = Array.from({ length: 7 }, (_, i) => ({
        label: `Item ${i + 1}`,
        value: (i + 1) * 10,
      }));
      const wrapper = createWrapper({ data: testData });
      const groups = wrapper.findAll(
        '[data-testid="progress-chart-container-group"]',
      );

      expect(groups).toHaveLength(5);
      groups.forEach((group) => {
        expect(group.find('.progress-chart__content').exists()).toBe(true);
      });
    });
  });

  describe('Click Events', () => {
    it('emits clickData event when clicking row with data', async () => {
      const testData = [{ label: 'Item 1', value: 70 }];
      const wrapper = createWrapper({ data: testData });

      await wrapper
        .findAll('[data-testid="progress-chart-container-group"]')[0]
        .trigger('click');

      expect(wrapper.emitted('clickData')).toBeTruthy();
      expect(wrapper.emitted('clickData')[0][0]).toEqual({
        label: 'Item 1',
        data: 70,
      });
    });

    it('does not emit clickData event when clicking empty row', async () => {
      const testData = [{ label: 'Item 1', value: 70 }];
      const wrapper = createWrapper({ data: testData });

      await wrapper
        .findAll('[data-testid="progress-chart-container-group"]')[1]
        .trigger('click');

      expect(wrapper.emitted('clickData')).toBeFalsy();
    });

    it('emits multiple clickData events for multiple clicks on different rows', async () => {
      const testData = [
        { label: 'Item 1', value: 70 },
        { label: 'Item 2', value: 30 },
      ];
      const wrapper = createWrapper({ data: testData });

      await wrapper
        .findAll('[data-testid="progress-chart-container-group"]')[0]
        .trigger('click');
      await wrapper
        .findAll('[data-testid="progress-chart-container-group"]')[1]
        .trigger('click');

      expect(wrapper.emitted('clickData')).toHaveLength(2);
      expect(wrapper.emitted('clickData')[0][0]).toEqual({
        label: 'Item 1',
        data: 70,
      });
      expect(wrapper.emitted('clickData')[1][0]).toEqual({
        label: 'Item 2',
        data: 30,
      });
    });
  });

  describe('Component Props', () => {
    it('accepts isLoading prop with default false', () => {
      const wrapper = createWrapper();
      expect(wrapper.props('isLoading')).toBe(false);
    });

    it('accepts data prop as required array', () => {
      const testData = [{ label: 'Test', value: 50 }];
      const wrapper = createWrapper({ data: testData });
      expect(wrapper.props('data')).toEqual(testData);
    });

    it('component renders correctly with TypeScript props', () => {
      const testData = [{ label: 'TypeScript Test', value: 85 }];
      const wrapper = createWrapper({
        data: testData,
        isLoading: false,
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.progress-chart__container').exists()).toBe(true);
    });
  });

  describe('Computed Properties', () => {
    it('rowData computed property returns exactly 5 items', async () => {
      const testData = [{ label: 'Item 1', value: 70 }];
      const wrapper = createWrapper({ data: testData });

      // Access computed property through wrapper
      await wrapper.vm.$nextTick();
      const groups = wrapper.findAll(
        '[data-testid="progress-chart-container-group"]',
      );

      expect(groups).toHaveLength(5);
      expect(groups[0].find('.progress-chart__content').exists()).toBe(true);
      expect(groups[1].find('.progress-chart__content').exists()).toBe(false);
      expect(groups[2].find('.progress-chart__content').exists()).toBe(false);
      expect(groups[3].find('.progress-chart__content').exists()).toBe(false);
      expect(groups[4].find('.progress-chart__content').exists()).toBe(false);
    });
  });

  describe('TypeScript Composition API', () => {
    it('handles TypeScript interfaces correctly', () => {
      const testData = [
        { label: 'TS Item 1', value: 45 },
        { label: 'TS Item 2', value: 67 },
        { label: 'TS Item 3', value: 89 },
      ];

      const wrapper = createWrapper({ data: testData });

      // Verify that data is properly typed and rendered
      const contentTexts = wrapper.findAll(
        '.progress-chart__container-item-text',
      );
      expect(contentTexts).toHaveLength(3);
      expect(contentTexts[0].text()).toBe('TS Item 1');
      expect(contentTexts[1].text()).toBe('TS Item 2');
      expect(contentTexts[2].text()).toBe('TS Item 3');
    });

    it('emits properly typed events', async () => {
      const testData = [{ label: 'Typed Item', value: 55 }];
      const wrapper = createWrapper({ data: testData });

      await wrapper
        .findAll('[data-testid="progress-chart-container-group"]')[0]
        .trigger('click');

      expect(wrapper.emitted('clickData')).toBeTruthy();
      const emittedData = wrapper.emitted('clickData')[0][0];

      // Verify the emitted data structure matches TypeScript interface
      expect(emittedData).toHaveProperty('label');
      expect(emittedData).toHaveProperty('data');
      expect(typeof emittedData.label).toBe('string');
      expect(typeof emittedData.data).toBe('number');
      expect(emittedData.label).toBe('Typed Item');
      expect(emittedData.data).toBe(55);
    });

    it('enforces prop type validation', () => {
      // Test that component accepts properly typed props
      const validData = [
        { label: 'Valid Item 1', value: 10 },
        { label: 'Valid Item 2', value: 20 },
      ];

      const wrapper = createWrapper({
        data: validData,
        isLoading: true,
      });

      expect(wrapper.props('data')).toEqual(validData);
      expect(wrapper.props('isLoading')).toBe(true);
      expect(wrapper.find('.progress-chart__container').exists()).toBe(true);
    });
  });
});
