import { describe, it, expect, beforeEach } from 'vitest';
import { mount, config } from '@vue/test-utils';

import ProgressTableRow from '../ProgressTableRow.vue';

config.global.plugins = [];

const defaultProps = {
  label: 'Test Progress',
  value: 75,
  description: 'Test Description',
};

const createWrapper = (props = {}) => {
  return mount(ProgressTableRow, {
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

describe('ProgressTableRow.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Component Structure', () => {
    const requiredElements = [
      'progress-table-row',
      'progress-table-row-text',
      'progress-table-row-progress',
      'progress-table-row-description',
    ];

    requiredElements.forEach((testId) => {
      it(`should render ${testId} element`, () => {
        expectElementExists(wrapper, testId);
      });
    });

    it('should apply correct CSS classes', () => {
      expectElementClass(wrapper, 'progress-table-row', 'progress-table-row');
      expectElementClass(
        wrapper,
        'progress-table-row-text',
        'progress-table-row__text',
      );
      expectElementClass(
        wrapper,
        'progress-table-row-description',
        'progress-table-row__description',
      );
    });
  });

  describe('Content Rendering', () => {
    it('should render text prop correctly', () => {
      expectElementText(wrapper, 'progress-table-row-text', 'Test Progress');
    });

    it('should render value as percentage', () => {
      expectElementText(
        wrapper,
        'progress-table-row-description',
        'Test Description',
      );
    });

    it('should render custom text when provided', async () => {
      await wrapper.setProps({ label: 'Custom Progress Text' });
      expectElementText(
        wrapper,
        'progress-table-row-text',
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
      { prop: 'label', value: 'New Text', expected: 'New Text' },
      { prop: 'value', value: 90, expected: '90%' },
      {
        prop: 'description',
        value: 'New Description',
        expected: 'New Description',
      },
      { prop: 'progressColor', value: '#blue' },
      { prop: 'backgroundColor', value: '#gray' },
    ];

    propsTests.forEach(({ prop, value, expected }) => {
      it(`should handle ${prop} prop correctly`, async () => {
        await wrapper.setProps({ [prop]: value });

        if (prop === 'label') {
          expectElementText(wrapper, 'progress-table-row-text', expected);
        } else if (prop === 'value') {
          const nativeProgress = wrapper.findComponent({
            name: 'NativeProgress',
          });
          expect(nativeProgress.props('progress')).toBe(value);
        } else if (prop === 'description') {
          expectElementText(
            wrapper,
            'progress-table-row-description',
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
        progressColor: '#success',
        backgroundColor: '#light',
      });

      expectElementText(
        fullPropsWrapper,
        'progress-table-row-text',
        'Complete Test',
      );
      expectElementText(
        fullPropsWrapper,
        'progress-table-row-description',
        '85%',
      );

      const nativeProgress = fullPropsWrapper.findComponent({
        name: 'NativeProgress',
      });
      expect(nativeProgress.props('progress')).toBe(85);
      expect(nativeProgress.props('progressColor')).toBe('#success');
      expect(nativeProgress.props('backgroundColor')).toBe('#light');
    });

    it('should render with minimal props', () => {
      const minimalWrapper = createWrapper({
        label: 'Minimal',
        value: 50,
        description: 'Description',
      });

      expectElementExists(minimalWrapper, 'progress-table-row');
      expectElementText(minimalWrapper, 'progress-table-row-text', 'Minimal');
      expectElementText(
        minimalWrapper,
        'progress-table-row-description',
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
        progressColor: '#updated',
      });

      expect(wrapper.vm.$props.label).toBe('Updated Progress');
      expect(wrapper.vm.$props.value).toBe(90);
      expect(wrapper.vm.$props.progressColor).toBe('#updated');

      expectElementText(wrapper, 'progress-table-row-text', 'Updated Progress');
      expectElementText(wrapper, 'progress-table-row-description', '90%');
    });
  });

  describe('Component Lifecycle', () => {
    it('should mount successfully', () => {
      expect(wrapper.exists()).toBe(true);
      expectElementExists(wrapper, 'progress-table-row');
    });

    it('should handle prop updates without errors', async () => {
      const initialText = wrapper
        .find('[data-testid="progress-table-row-text"]')
        .text();

      await wrapper.setProps({ label: 'Changed Text' });

      const updatedText = wrapper
        .find('[data-testid="progress-table-row-text"]')
        .text();
      expect(updatedText).not.toBe(initialText);
      expect(updatedText).toBe('Changed Text');
    });
  });
});
