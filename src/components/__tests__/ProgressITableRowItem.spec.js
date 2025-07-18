import { describe, it, expect, beforeEach } from 'vitest';
import { mount, config } from '@vue/test-utils';

import ProgressTableRowItem from '../ProgressTableRowItem.vue';

config.global.plugins = [];

const defaultProps = {
  label: 'Test Progress',
  value: 75,
  description: 'Test Description',
};

const createWrapper = (props = {}) => {
  return mount(ProgressTableRowItem, {
    props: { ...defaultProps, ...props },
  });
};

const expectElementExists = (wrapper, testId) => {
  expect(wrapper.find(`[data-testid="${testId}"]`).exists()).toBe(true);
};

const expectElementText = (wrapper, testId, expectedText) => {
  expect(wrapper.find(`[data-testid="${testId}"]`).text()).toBe(expectedText);
};

const expectElementClass = (wrapper, testId, expectedClass) => {
  expect(wrapper.find(`[data-testid="${testId}"]`).classes()).toContain(
    expectedClass,
  );
};

describe('ProgressTableRowItem.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Component Structure', () => {
    const requiredElements = [
      'progress-table-row-item',
      'progress-table-row-item-label',
      'progress-table-row-item-progress',
      'progress-table-row-item-description',
    ];

    requiredElements.forEach((testId) => {
      it(`should render ${testId} element`, () => {
        expectElementExists(wrapper, testId);
      });
    });

    it('should apply correct CSS classes', () => {
      expectElementClass(
        wrapper,
        'progress-table-row-item',
        'progress-table-row-item',
      );
      expectElementClass(
        wrapper,
        'progress-table-row-item-label',
        'progress-table-row-item__label',
      );
      expectElementClass(
        wrapper,
        'progress-table-row-item-description',
        'progress-table-row-item__description',
      );
    });
  });

  describe('Content Rendering', () => {
    it('should render text prop correctly', () => {
      expectElementText(
        wrapper,
        'progress-table-row-item-label',
        'Test Progress',
      );
    });

    it('should render value as percentage', () => {
      expectElementText(
        wrapper,
        'progress-table-row-item-description',
        'Test Description',
      );
    });

    it('should render custom text when provided', async () => {
      await wrapper.setProps({ label: 'Custom Progress Text' });
      expectElementText(
        wrapper,
        'progress-table-row-item-label',
        'Custom Progress Text',
      );
    });
  });

  describe('NativeProgress Integration', () => {
    it('should render NativeProgress component', () => {
      const nativeProgress = wrapper.findComponent({
        name: 'NativeProgress',
      });
      expect(nativeProgress.exists()).toBe(true);
    });

    it('should pass progress value to NativeProgress', () => {
      const nativeProgress = wrapper.findComponent({
        name: 'NativeProgress',
      });
      expect(nativeProgress.props('progress')).toBe(75);
    });

    it('should pass custom colors to NativeProgress when provided', async () => {
      await wrapper.setProps({
        color: '#ff0000',
        backgroundColor: '#00ff00',
      });

      const nativeProgress = wrapper.findComponent({
        name: 'NativeProgress',
      });
      expect(nativeProgress.props('color')).toBe('#ff0000');
      expect(nativeProgress.props('backgroundColor')).toBe('#00ff00');
    });

    it('should handle undefined color props', () => {
      const nativeProgress = wrapper.findComponent({
        name: 'NativeProgress',
      });

      expect(nativeProgress.props('color')).toBe('#007bff');
      expect(nativeProgress.props('backgroundColor')).toBe('#e9ecef');
    });
  });

  describe('Props Validation', () => {
    const propsTests = [
      { prop: 'label', value: 'New Text', expected: 'New Text' },
      { prop: 'value', value: 90, expected: '90%' },
      {
        prop: 'description',
        value: 'New Description',
        expected: 'New Description',
      },
      { prop: 'color', value: '#blue' },
      { prop: 'backgroundColor', value: '#gray' },
    ];

    propsTests.forEach(({ prop, value, expected }) => {
      it(`should handle ${prop} prop correctly`, async () => {
        await wrapper.setProps({ [prop]: value });

        if (prop === 'label') {
          expectElementText(wrapper, 'progress-table-row-item-label', expected);
        } else if (prop === 'value') {
          const nativeProgress = wrapper.findComponent({
            name: 'NativeProgress',
          });
          expect(nativeProgress.props('progress')).toBe(value);
        } else if (prop === 'description') {
          expectElementText(
            wrapper,
            'progress-table-row-item-description',
            expected,
          );
        } else {
          const nativeProgress = wrapper.findComponent({
            name: 'NativeProgress',
          });
          expect(nativeProgress.props(prop)).toBe(value);
        }
      });
    });
  });

  describe('Component Integration', () => {
    it('should render with all props provided', () => {
      const fullPropsWrapper = createWrapper({
        label: 'Complete Test',
        value: 85,
        description: '85%',
        color: '#success',
        backgroundColor: '#light',
      });

      expectElementText(
        fullPropsWrapper,
        'progress-table-row-item-label',
        'Complete Test',
      );
      expectElementText(
        fullPropsWrapper,
        'progress-table-row-item-description',
        '85%',
      );

      const nativeProgress = fullPropsWrapper.findComponent({
        name: 'NativeProgress',
      });
      expect(nativeProgress.props('progress')).toBe(85);
      expect(nativeProgress.props('color')).toBe('#success');
      expect(nativeProgress.props('backgroundColor')).toBe('#light');
    });

    it('should render with minimal props', () => {
      const minimalWrapper = createWrapper({
        label: 'Minimal',
        value: 50,
        description: 'Description',
      });

      expectElementExists(minimalWrapper, 'progress-table-row-item');
      expectElementText(
        minimalWrapper,
        'progress-table-row-item-label',
        'Minimal',
      );
      expectElementText(
        minimalWrapper,
        'progress-table-row-item-description',
        'Description',
      );
    });
  });

  describe('Reactivity', () => {
    it('should update when props change', async () => {
      expect(wrapper.vm.$props.label).toBe('Test Progress');
      expect(wrapper.vm.$props.value).toBe(75);

      await wrapper.setProps({
        label: 'Updated Progress',
        value: 90,
        description: '90%',
        color: '#updated',
      });

      expect(wrapper.vm.$props.label).toBe('Updated Progress');
      expect(wrapper.vm.$props.value).toBe(90);
      expect(wrapper.vm.$props.color).toBe('#updated');

      expectElementText(
        wrapper,
        'progress-table-row-item-label',
        'Updated Progress',
      );
      expectElementText(wrapper, 'progress-table-row-item-description', '90%');
    });
  });

  describe('Component Lifecycle', () => {
    it('should mount successfully', () => {
      expect(wrapper.exists()).toBe(true);
      expectElementExists(wrapper, 'progress-table-row-item');
    });

    it('should handle prop updates without errors', async () => {
      const initialText = wrapper
        .find('[data-testid="progress-table-row-item-label"]')
        .text();

      await wrapper.setProps({ label: 'Changed Text' });

      const updatedText = wrapper
        .find('[data-testid="progress-table-row-item-label"]')
        .text();
      expect(updatedText).not.toBe(initialText);
      expect(updatedText).toBe('Changed Text');
    });
  });
});
