import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { nextTick } from 'vue';

import FilterInput from '../FilterInput.vue';

const i18n = createI18n({ legacy: false });
config.global.plugins = [i18n];

const createWrapper = (props = {}) => {
  return mount(FilterInput, {
    props: {
      type: 'contact',
      modelValue: '',
      ...props,
    },
    global: {
      stubs: {
        UnnnicInput: {
          template: `
            <input 
              data-testid="mock-input"
              :value="modelValue"
              @input="$emit('update:model-value', $event.target.value)"
            />
          `,
          props: ['modelValue', 'label', 'iconLeft', 'placeholder'],
        },
      },
      mocks: {
        $t: (key) => key,
      },
    },
  });
};

describe('FilterInput', () => {
  let wrapper;

  const getFilterInput = () =>
    wrapper.find('[data-testid="filter-input-contact"]');
  const getMockInput = () => wrapper.find('[data-testid="mock-input"]');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render filter input component', () => {
      wrapper = createWrapper();

      expect(getFilterInput().exists()).toBe(true);
    });

    it('should render input field with correct data-testid', () => {
      wrapper = createWrapper();

      expect(
        wrapper.find('[data-testid="filter-input-field-contact"]').exists(),
      ).toBe(true);
    });

    it('should display correct label from computed property', () => {
      wrapper = createWrapper();

      expect(wrapper.vm.filterLabel).toBe(
        'human_support_dashboard.filters.contact.label',
      );
    });

    it('should display correct placeholder from computed property', () => {
      wrapper = createWrapper();

      expect(wrapper.vm.placeholder).toBe(
        'human_support_dashboard.filters.common.placeholder',
      );
    });
  });

  describe('Input Handling', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should emit update:modelValue immediately on input', async () => {
      wrapper = createWrapper();

      wrapper.vm.handleInput('test value');
      await nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['test value']);
    });

    it('should debounce change event by 500ms', async () => {
      wrapper = createWrapper();

      wrapper.vm.handleInput('debounced value');

      expect(wrapper.emitted('change')).toBeFalsy();

      vi.advanceTimersByTime(499);
      await nextTick();
      expect(wrapper.emitted('change')).toBeFalsy();

      vi.advanceTimersByTime(1);
      await nextTick();

      expect(wrapper.emitted('change')).toBeTruthy();
      expect(wrapper.emitted('change')[0]).toEqual(['debounced value']);
    });

    it('should cancel previous debounce timer on new input', async () => {
      wrapper = createWrapper();

      wrapper.vm.handleInput('first');
      vi.advanceTimersByTime(300);

      wrapper.vm.handleInput('second');
      vi.advanceTimersByTime(500);
      await nextTick();

      expect(wrapper.emitted('change').length).toBe(1);
      expect(wrapper.emitted('change')[0]).toEqual(['second']);
    });

    it('should handle empty input value', async () => {
      wrapper = createWrapper({ modelValue: 'initial' });

      wrapper.vm.handleInput('');
      vi.advanceTimersByTime(500);
      await nextTick();

      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['']);
      expect(wrapper.emitted('change')[0]).toEqual(['']);
    });
  });

  describe('Exposed Methods', () => {
    it('should expose clearData method', () => {
      wrapper = createWrapper();

      expect(typeof wrapper.vm.clearData).toBe('function');
    });

    it('should clear debounce timer and emit empty values when clearData is called', async () => {
      wrapper = createWrapper({ modelValue: 'test value' });

      wrapper.vm.clearData();
      await nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['']);
      expect(wrapper.emitted('change')).toBeTruthy();
      expect(wrapper.emitted('change')[0]).toEqual(['']);
      expect(wrapper.vm.debounceTimer).toBeNull();
    });

    it('should clear pending debounce when clearData is called', async () => {
      vi.useFakeTimers();
      wrapper = createWrapper();

      wrapper.vm.handleInput('test');

      wrapper.vm.clearData();
      vi.advanceTimersByTime(500);
      await nextTick();

      const changeEvents = wrapper.emitted('change');
      expect(changeEvents[changeEvents.length - 1]).toEqual(['']);

      vi.useRealTimers();
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should clear debounce timer on unmount', async () => {
      vi.useFakeTimers();
      wrapper = createWrapper();

      wrapper.vm.handleInput('test');
      expect(wrapper.vm.debounceTimer).not.toBeNull();

      wrapper.unmount();

      expect(wrapper.vm.debounceTimer).toBeNull();
      vi.useRealTimers();
    });

    it('should not throw error when unmounting without active timer', () => {
      wrapper = createWrapper();

      expect(() => wrapper.unmount()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid successive inputs correctly', async () => {
      vi.useFakeTimers();
      wrapper = createWrapper();

      wrapper.vm.handleInput('a');
      vi.advanceTimersByTime(100);
      wrapper.vm.handleInput('ab');
      vi.advanceTimersByTime(100);
      wrapper.vm.handleInput('abc');
      vi.advanceTimersByTime(500);
      await nextTick();

      expect(wrapper.emitted('change').length).toBe(1);
      expect(wrapper.emitted('change')[0]).toEqual(['abc']);
      expect(wrapper.emitted('update:modelValue').length).toBe(3);

      vi.useRealTimers();
    });

    it('should handle whitespace-only input', async () => {
      vi.useFakeTimers();
      wrapper = createWrapper();

      wrapper.vm.handleInput('   ');
      vi.advanceTimersByTime(500);
      await nextTick();

      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['   ']);
      expect(wrapper.emitted('change')[0]).toEqual(['   ']);

      vi.useRealTimers();
    });
  });
});
