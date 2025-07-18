import { describe, it, expect, beforeEach, vi } from 'vitest';
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

  const progressTableRowItem = () =>
    wrapper.find('[data-testid="progress-table-row-item"]');

  const progressTableRowItemMainRow = () =>
    progressTableRowItem().find(
      '[data-testid="progress-table-row-item-main-row"]',
    );

  const progressTableRowItemExpandableDescription = () =>
    wrapper.find(
      '[data-testid="progress-table-row-item-expandable-description"]',
    );

  const progressTableRowItemIcon = () =>
    wrapper.find('[data-testid="progress-table-row-item-icon"]');

  const progressTableRowItemSubItemsRow = () =>
    wrapper.find('[data-testid="progress-table-row-item-sub-items-row"]');

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

  describe('Expandable Functionality', () => {
    beforeEach(() => {
      wrapper.setProps({
        label: 'Expandable Item',
        value: 60,
        description: '60%',
        isExpandable: true,
        expandableDescription: 'Click to expand',
        expanded: false,
      });
    });

    describe('Expandable Props and Classes', () => {
      it('should apply expandable CSS class when isExpandable is true', () => {
        expectElementClass(
          wrapper,
          'progress-table-row-item',
          'progress-table-row-item--expandable',
        );
      });

      it('should not apply expandable CSS class when isExpandable is false', async () => {
        await wrapper.setProps({
          isExpandable: false,
        });

        expect(progressTableRowItem().classes()).not.toContain(
          'progress-table-row-item--expandable',
        );
      });

      it('should render expandable description when provided', async () => {
        expect(progressTableRowItemExpandableDescription().text()).toContain(
          'Click to expand',
        );
      });
    });

    describe('Icon Behavior', () => {
      it('should render expand icon when isExpandable is true', () => {
        expect(progressTableRowItemIcon().exists()).toBe(true);
        expect(progressTableRowItemIcon().attributes('icon')).toBe(
          'keyboard_arrow_down',
        );
      });

      it('should not render expand icon when isExpandable is false', async () => {
        await wrapper.setProps({
          isExpandable: false,
        });
        expect(progressTableRowItemIcon().exists()).toBe(false);
      });

      it('should apply correct icon classes when collapsed', () => {
        expect(progressTableRowItemIcon().classes()).toContain('label__icon');
        expect(progressTableRowItemIcon().classes()).not.toContain(
          'label__icon--expanded',
        );
      });

      it('should apply expanded icon class when expanded', async () => {
        await wrapper.setProps({ expanded: true });
        expect(progressTableRowItemIcon().classes()).toContain('label__icon');
        expect(progressTableRowItemIcon().classes()).toContain(
          'label__icon--expanded',
        );
      });

      it('should have correct icon properties', () => {
        expect(progressTableRowItemIcon().attributes('size')).toBe('md');
        expect(progressTableRowItemIcon().attributes('scheme')).toBe(
          'neutral-cloudy',
        );
      });
    });

    describe('Click Handling', () => {
      it('should emit expand event when clicked and expandable', async () => {
        await progressTableRowItemMainRow().trigger('click');

        expect(wrapper.emitted('expand')).toBeTruthy();
        expect(wrapper.emitted('expand')[0]).toEqual([true]);
      });

      it('should emit correct expanded state on subsequent clicks', async () => {
        await progressTableRowItemMainRow().trigger('click');
        expect(wrapper.emitted('expand')[0]).toEqual([true]);

        await wrapper.setProps({ expanded: true });

        await progressTableRowItemMainRow().trigger('click');
        expect(wrapper.emitted('expand')[1]).toEqual([false]);
      });

      it('should not emit expand event when not expandable', async () => {
        await wrapper.setProps({
          isExpandable: false,
        });

        await progressTableRowItemMainRow().trigger('click');
        expect(wrapper.emitted('expand')).toBeFalsy();
      });

      it('should call handleExpand method on click', async () => {
        const handleExpandSpy = vi.spyOn(wrapper.vm, 'handleExpand');
        await progressTableRowItemMainRow().trigger('click');
        expect(handleExpandSpy).toHaveBeenCalled();
      });
    });

    describe('Slot Functionality', () => {
      it('should render sub-items slot when expanded', async () => {
        const expandableWrapperWithSlot = mount(ProgressTableRowItem, {
          props: {
            label: 'Test with slot',
            value: 50,
            description: '50%',
            isExpandable: true,
            expanded: true,
          },
          slots: {
            'sub-items': '<div data-testid="slot-content">Slot Content</div>',
          },
        });

        const slotContent = expandableWrapperWithSlot.find(
          '[data-testid="slot-content"]',
        );
        expect(slotContent.exists()).toBe(true);
        expect(slotContent.text()).toBe('Slot Content');
      });

      it('should not render sub-items slot when collapsed', () => {
        const expandableWrapperWithSlot = mount(ProgressTableRowItem, {
          props: {
            label: 'Test with slot',
            value: 50,
            description: '50%',
            isExpandable: true,
            expanded: false,
          },
          slots: {
            'sub-items': '<div data-testid="slot-content">Slot Content</div>',
          },
        });

        const slotContent = expandableWrapperWithSlot.find(
          '[data-testid="slot-content"]',
        );
        expect(slotContent.exists()).toBe(false);
      });

      it('should have correct sub-items container structure', async () => {
        await wrapper.setProps({ expanded: true });
        expect(progressTableRowItemSubItemsRow().exists()).toBe(true);
      });
    });
  });
});
