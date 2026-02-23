import { describe, it, expect, beforeEach } from 'vitest';
import { mount, config } from '@vue/test-utils';

import NativeProgress from '../NativeProgress.vue';

config.global.plugins = [];

const defaultProps = {
  progress: 50,
};

const createWrapper = (props = {}) => {
  return mount(NativeProgress, {
    props: { ...defaultProps, ...props },
  });
};

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgb(${r}, ${g}, ${b})`;
  }
  return hex;
};

const expectStyleProperty = (element, property, value) => {
  const expectedValue =
    property.includes('color') || property.includes('Color')
      ? hexToRgb(value)
      : value;
  expect(element.style[property]).toBe(expectedValue);
};

const expectElementStyles = (wrapper, testId, expectedStyles) => {
  const element = wrapper.find(`[data-testid="${testId}"]`).element;
  Object.entries(expectedStyles).forEach(([property, value]) => {
    expectStyleProperty(element, property, value);
  });
};

describe('NativeProgress.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Component Structure', () => {
    it('should render container and progress bar elements', () => {
      expect(wrapper.find('[data-testid="native-progress"]').exists()).toBe(
        true,
      );
      expect(wrapper.find('[data-testid="native-progress-bar"]').exists()).toBe(
        true,
      );
    });

    it('should apply correct CSS classes', () => {
      const container = wrapper.find('[data-testid="native-progress"]');
      const progressBar = wrapper.find('[data-testid="native-progress-bar"]');

      expect(container.classes()).toContain('native-progress');
      expect(progressBar.classes()).toContain('native-progress__bar');
    });
  });

  describe('Default Props', () => {
    const defaultValues = [
      { prop: 'color', expected: '#3182CE' }, // colorBlue500
      { prop: 'backgroundColor', expected: '#F6F7F9' }, // colorGray50
      { prop: 'height', expected: 8 },
    ];

    defaultValues.forEach(({ prop, expected }) => {
      it(`should have correct default value for ${prop}`, () => {
        const testWrapper = createWrapper({ progress: 25 });
        expect(testWrapper.props(prop)).toBe(expected);
      });
    });
  });

  describe('Progress Value Normalization', () => {
    const progressTests = [
      { input: 0, expected: 0, description: 'minimum value' },
      { input: 50, expected: 50, description: 'normal value' },
      { input: 100, expected: 100, description: 'maximum value' },
      { input: -10, expected: 0, description: 'negative value' },
      { input: 150, expected: 100, description: 'exceeding maximum' },
    ];

    progressTests.forEach(({ input, expected, description }) => {
      it(`should normalize progress for ${description}`, () => {
        const testWrapper = createWrapper({ progress: input });
        expect(testWrapper.vm.normalizedProgress).toBe(expected);
      });
    });
  });

  describe('Style Calculations', () => {
    it('should calculate container styles correctly', () => {
      const testWrapper = createWrapper({
        backgroundColor: '#f0f0f0',
        height: 12,
      });

      const expectedStyles = {
        backgroundColor: '#f0f0f0',
        height: '12px',
      };

      expectElementStyles(testWrapper, 'native-progress', expectedStyles);
    });

    it('should calculate progress bar styles correctly', () => {
      const testWrapper = createWrapper({
        progress: 75,
        color: '#28a745',
      });

      const expectedStyles = {
        width: '75%',
        backgroundColor: '#28a745',
      };

      expectElementStyles(testWrapper, 'native-progress-bar', expectedStyles);
    });
  });

  describe('Props Integration', () => {
    it('should render with all custom props', () => {
      const customProps = {
        progress: 80,
        color: '#dc3545',
        backgroundColor: '#f8f9fa',
        height: 16,
      };

      const testWrapper = createWrapper(customProps);

      expectElementStyles(testWrapper, 'native-progress', {
        backgroundColor: '#f8f9fa',
        height: '16px',
      });

      expectElementStyles(testWrapper, 'native-progress-bar', {
        width: '80%',
        backgroundColor: '#dc3545',
      });
    });

    it('should update styles when props change', async () => {
      await wrapper.setProps({ progress: 25, color: '#ffc107' });

      expectElementStyles(wrapper, 'native-progress-bar', {
        width: '25%',
        backgroundColor: '#ffc107',
      });
    });
  });

  describe('Edge Cases', () => {
    const edgeCaseTests = [
      {
        progress: 0.5,
        expected: '0.5%',
        description: 'decimal progress value',
      },
      {
        progress: 99.99,
        expected: '99.99%',
        description: 'high decimal progress value',
      },
    ];

    edgeCaseTests.forEach(({ progress, expected, description }) => {
      it(`should handle ${description}`, () => {
        const testWrapper = createWrapper({ progress });
        expectElementStyles(testWrapper, 'native-progress-bar', {
          width: expected,
        });
      });
    });
  });

  describe('Computed Properties Reactivity', () => {
    it('should update computed properties when props change', async () => {
      const vm = wrapper.vm;

      expect(vm.normalizedProgress).toBe(50);
      expect(vm.containerStyles.height).toBe('8px');
      expect(vm.progressBarStyles.width).toBe('50%');

      await wrapper.setProps({
        progress: 75,
        height: 10,
        color: '#success',
      });

      expect(vm.normalizedProgress).toBe(75);
      expect(vm.containerStyles.height).toBe('10px');
      expect(vm.progressBarStyles.width).toBe('75%');
      expect(vm.progressBarStyles.backgroundColor).toBe('#success');
    });
  });

  describe('Component Lifecycle', () => {
    it('should mount successfully with minimal props', () => {
      const minimalWrapper = createWrapper({ progress: 10 });

      expect(minimalWrapper.exists()).toBe(true);
      expect(
        minimalWrapper.find('[data-testid="native-progress"]').exists(),
      ).toBe(true);
      expect(minimalWrapper.vm.normalizedProgress).toBe(10);
    });

    it('should handle prop updates without errors', async () => {
      const initialProgress = wrapper.vm.normalizedProgress;

      await wrapper.setProps({ progress: 90 });

      expect(wrapper.vm.normalizedProgress).not.toBe(initialProgress);
      expect(wrapper.vm.normalizedProgress).toBe(90);
    });
  });
});
