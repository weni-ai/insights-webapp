import { describe, it, expect, beforeEach } from 'vitest';
import { mount, config } from '@vue/test-utils';

import ProgressItem from '../ProgressItem.vue';

config.global.plugins = [];

const defaultProps = {
  text: 'Test Progress',
  value: 75,
};

const createWrapper = (props = {}) => {
  return mount(ProgressItem, {
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

describe('ProgressItem.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Component Structure', () => {
    const requiredElements = [
      'progress-item',
      'progress-item-text',
      'progress-item-progress',
      'progress-item-native-progress',
      'progress-item-value',
    ];

    requiredElements.forEach((testId) => {
      it(`should render ${testId} element`, () => {
        expectElementExists(wrapper, testId);
      });
    });

    it('should apply correct CSS classes', () => {
      expectElementClass(wrapper, 'progress-item', 'progress-item');
      expectElementClass(wrapper, 'progress-item-text', 'progress-item__text');
      expectElementClass(
        wrapper,
        'progress-item-progress',
        'progress-item__progress',
      );
      expectElementClass(
        wrapper,
        'progress-item-value',
        'progress-item__progress__value',
      );
    });
  });

  describe('Content Rendering', () => {
    it('should render text prop correctly', () => {
      expectElementText(wrapper, 'progress-item-text', 'Test Progress');
    });

    it('should render value as percentage', () => {
      expectElementText(wrapper, 'progress-item-value', '75%');
    });

    it('should render custom text when provided', async () => {
      await wrapper.setProps({ text: 'Custom Progress Text' });
      expectElementText(wrapper, 'progress-item-text', 'Custom Progress Text');
    });

    it('should render different value percentages', async () => {
      const testValues = [0, 25, 50, 100];

      for (const value of testValues) {
        await wrapper.setProps({ value });
        expectElementText(wrapper, 'progress-item-value', `${value}%`);
      }
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
        progressColor: '#ff0000',
        backgroundColor: '#00ff00',
      });

      const nativeProgress = wrapper.findComponent({
        name: 'NativeProgress',
      });
      expect(nativeProgress.props('progressColor')).toBe('#ff0000');
      expect(nativeProgress.props('backgroundColor')).toBe('#00ff00');
    });

    it('should handle undefined color props', () => {
      const nativeProgress = wrapper.findComponent({
        name: 'NativeProgress',
      });

      expect(nativeProgress.props('progressColor')).toBe('#007bff');
      expect(nativeProgress.props('backgroundColor')).toBe('#e9ecef');
    });
  });

  describe('Props Validation', () => {
    const propsTests = [
      { prop: 'text', value: 'New Text', expected: 'New Text' },
      { prop: 'value', value: 90, expected: '90%' },
      { prop: 'progressColor', value: '#blue' },
      { prop: 'backgroundColor', value: '#gray' },
    ];

    propsTests.forEach(({ prop, value, expected }) => {
      it(`should handle ${prop} prop correctly`, async () => {
        await wrapper.setProps({ [prop]: value });

        if (prop === 'text') {
          expectElementText(wrapper, 'progress-item-text', expected);
        } else if (prop === 'value') {
          expectElementText(wrapper, 'progress-item-value', expected);
          const nativeProgress = wrapper.findComponent({
            name: 'NativeProgress',
          });
          expect(nativeProgress.props('progress')).toBe(value);
        } else {
          const nativeProgress = wrapper.findComponent({
            name: 'NativeProgress',
          });
          expect(nativeProgress.props(prop)).toBe(value);
        }
      });
    });
  });

  describe('Edge Cases', () => {
    const edgeCaseTests = [
      { value: 0, description: 'zero progress' },
      { value: 100, description: 'full progress' },
      { value: 0.5, description: 'decimal progress' },
    ];

    edgeCaseTests.forEach(({ value, description }) => {
      it(`should handle ${description}`, async () => {
        await wrapper.setProps({ value });
        expectElementText(wrapper, 'progress-item-value', `${value}%`);

        const nativeProgress = wrapper.findComponent({
          name: 'NativeProgress',
        });
        expect(nativeProgress.props('progress')).toBe(value);
      });
    });

    it('should handle long text', async () => {
      const longText = 'Very long progress text that might overflow';
      await wrapper.setProps({ text: longText });
      expectElementText(wrapper, 'progress-item-text', longText);
    });
  });

  describe('Component Integration', () => {
    it('should render with all props provided', () => {
      const fullPropsWrapper = createWrapper({
        text: 'Complete Test',
        value: 85,
        progressColor: '#success',
        backgroundColor: '#light',
      });

      expectElementText(
        fullPropsWrapper,
        'progress-item-text',
        'Complete Test',
      );
      expectElementText(fullPropsWrapper, 'progress-item-value', '85%');

      const nativeProgress = fullPropsWrapper.findComponent({
        name: 'NativeProgress',
      });
      expect(nativeProgress.props('progress')).toBe(85);
      expect(nativeProgress.props('progressColor')).toBe('#success');
      expect(nativeProgress.props('backgroundColor')).toBe('#light');
    });

    it('should render with minimal props', () => {
      const minimalWrapper = createWrapper({
        text: 'Minimal',
        value: 50,
      });

      expectElementExists(minimalWrapper, 'progress-item');
      expectElementText(minimalWrapper, 'progress-item-text', 'Minimal');
      expectElementText(minimalWrapper, 'progress-item-value', '50%');
    });
  });

  describe('Reactivity', () => {
    it('should update when props change', async () => {
      expect(wrapper.vm.$props.text).toBe('Test Progress');
      expect(wrapper.vm.$props.value).toBe(75);

      await wrapper.setProps({
        text: 'Updated Progress',
        value: 90,
        progressColor: '#updated',
      });

      expect(wrapper.vm.$props.text).toBe('Updated Progress');
      expect(wrapper.vm.$props.value).toBe(90);
      expect(wrapper.vm.$props.progressColor).toBe('#updated');

      expectElementText(wrapper, 'progress-item-text', 'Updated Progress');
      expectElementText(wrapper, 'progress-item-value', '90%');
    });
  });

  describe('Component Lifecycle', () => {
    it('should mount successfully', () => {
      expect(wrapper.exists()).toBe(true);
      expectElementExists(wrapper, 'progress-item');
    });

    it('should handle prop updates without errors', async () => {
      const initialText = wrapper
        .find('[data-testid="progress-item-text"]')
        .text();

      await wrapper.setProps({ text: 'Changed Text' });

      const updatedText = wrapper
        .find('[data-testid="progress-item-text"]')
        .text();
      expect(updatedText).not.toBe(initialText);
      expect(updatedText).toBe('Changed Text');
    });
  });
});
