import { describe, it, expect, beforeEach, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';

import ProgressTableRow from '../ProgressTableRow.vue';

config.global.plugins = [];

const defaultProps = {
  label: 'Test Progress Row',
  value: 75,
  description: 'Test Description',
};

const expandableProps = {
  ...defaultProps,
  isExpandable: true,
  expandableDescription: 'Click to expand',
  expanded: false,
  subItems: [
    {
      label: 'Sub Item 1',
      value: 50,
      description: '50%',
      color: '#ff0000',
      backgroundColor: '#ffcccc',
    },
    {
      label: 'Sub Item 2',
      value: 25,
      description: '25%',
      color: '#00ff00',
      backgroundColor: '#ccffcc',
    },
  ],
};

const createWrapper = (props = {}) => {
  return mount(ProgressTableRow, {
    props: { ...defaultProps, ...props },
    global: {},
  });
};

describe('ProgressTableRow.vue', () => {
  let wrapper;

  const progressTableRowItemMain = () =>
    wrapper.findComponent('[data-testid="progress-table-row-item-main"]');

  const progressTableRowItemSub = () =>
    wrapper.findComponent('[data-testid="progress-table-row-item-sub"]');

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Component Structure', () => {
    it('should render main ProgressTableRowItem component', () => {
      expect(progressTableRowItemMain().exists()).toBe(true);
    });

    it('should pass all props to ProgressTableRowItem', () => {
      expect(progressTableRowItemMain().props('label')).toBe(
        defaultProps.label,
      );
      expect(progressTableRowItemMain().props('value')).toBe(
        defaultProps.value,
      );
      expect(progressTableRowItemMain().props('description')).toBe(
        defaultProps.description,
      );
    });
  });

  describe('Props Handling', () => {
    it('should handle basic props correctly', async () => {
      const customProps = {
        label: 'Custom Label',
        value: 90,
        description: 'Custom Description',
        color: '#blue',
        backgroundColor: '#lightblue',
      };

      await wrapper.setProps(customProps);

      expect(progressTableRowItemMain().props('label')).toBe(customProps.label);
      expect(progressTableRowItemMain().props('value')).toBe(customProps.value);
      expect(progressTableRowItemMain().props('description')).toBe(
        customProps.description,
      );
      expect(progressTableRowItemMain().props('color')).toBe(customProps.color);
      expect(progressTableRowItemMain().props('backgroundColor')).toBe(
        customProps.backgroundColor,
      );
    });

    it('should handle expandable props correctly', async () => {
      await wrapper.setProps(expandableProps);

      expect(progressTableRowItemMain().props('isExpandable')).toBe(true);
      expect(progressTableRowItemMain().props('expandableDescription')).toBe(
        'Click to expand',
      );
      expect(progressTableRowItemMain().props('expanded')).toBe(false);
    });
  });

  describe('Non-Expandable Behavior', () => {
    it('should not render sub-items when not expandable', () => {
      expect(progressTableRowItemSub().exists()).toBe(false);
    });
  });

  describe('Expandable Behavior', () => {
    beforeEach(() => {
      wrapper = createWrapper(expandableProps);
    });

    it('should not render sub-items when collapsed', () => {
      expect(progressTableRowItemSub().exists()).toBe(false);
    });

    it('should render sub-items when expanded', async () => {
      await wrapper.setProps({ expanded: true });

      expect(progressTableRowItemSub().exists()).toBe(true);
    });

    it('should pass correct props to sub-items', async () => {
      await wrapper.setProps({ expanded: true });

      const subItem1 = wrapper.findAllComponents(
        '[data-testid="progress-table-row-item-sub"]',
      )[0];
      const subItem2 = wrapper.findAllComponents(
        '[data-testid="progress-table-row-item-sub"]',
      )[1];

      expect(subItem1.exists()).toBe(true);
      expect(subItem2.exists()).toBe(true);

      expect(subItem1.props('label')).toBe('Sub Item 1');
      expect(subItem1.props('value')).toBe(50);
      expect(subItem1.props('description')).toBe('50%');
      expect(subItem1.props('color')).toBe('#ff0000');
      expect(subItem1.props('backgroundColor')).toBe('#ffcccc');

      expect(subItem2.props('label')).toBe('Sub Item 2');
      expect(subItem2.props('value')).toBe(25);
      expect(subItem2.props('description')).toBe('25%');
      expect(subItem2.props('color')).toBe('#00ff00');
      expect(subItem2.props('backgroundColor')).toBe('#ccffcc');
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      wrapper = createWrapper(expandableProps);
    });

    it('should emit expand event when main item emits expand', async () => {
      await progressTableRowItemMain().vm.$emit('expand', true);

      expect(wrapper.emitted('expand')).toBeTruthy();
      expect(wrapper.emitted('expand')[0]).toEqual([true]);
    });

    it('should emit multiple expand events correctly', async () => {
      await progressTableRowItemMain().vm.$emit('expand', true);
      await progressTableRowItemMain().vm.$emit('expand', false);
      await progressTableRowItemMain().vm.$emit('expand', true);

      const emittedEvents = wrapper.emitted('expand');
      expect(emittedEvents).toBeTruthy();
      expect(emittedEvents.length).toBe(3);
      expect(emittedEvents[0]).toEqual([true]);
      expect(emittedEvents[1]).toEqual([false]);
      expect(emittedEvents[2]).toEqual([true]);
    });
  });
});
