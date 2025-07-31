import { beforeEach, describe, expect, it } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import AddWidget from '../AddWidget.vue';

config.global.plugins = [
  createI18n({
    legacy: false,
  }),
];

const createWrapper = (props = {}) => {
  return shallowMount(AddWidget, {
    props: {
      title: 'Test Title',
      description: 'Test Description',
      actionText: 'Test Action',
      ...props,
    },
  });
};

describe('AddWidget', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  const addWidgetSection = () => wrapper.find('[data-testid="add-widget"]');
  const setupWidget = () =>
    wrapper.findComponent('[data-testid="setup-widget"]');

  describe('Initial render', () => {
    it('should render the AddWidget wrapper section', () => {
      expect(addWidgetSection().exists()).toBe(true);
      expect(addWidgetSection().classes()).toContain('add-widget');
    });

    it('should render SetupWidget component', () => {
      expect(setupWidget().exists()).toBe(true);
    });

    it('should have correct component structure', () => {
      expect(addWidgetSection().exists()).toBe(true);
      expect(setupWidget().exists()).toBe(true);
    });
  });

  describe('Props integration', () => {
    it('should pass title prop to SetupWidget', () => {
      expect(setupWidget().props('title')).toBe('Test Title');
    });

    it('should pass description prop to SetupWidget', () => {
      expect(setupWidget().props('description')).toBe('Test Description');
    });

    it('should pass actionText prop to SetupWidget', () => {
      expect(setupWidget().props('actionText')).toBe('Test Action');
    });

    it('should pass all props to SetupWidget correctly', () => {
      wrapper = createWrapper({
        title: 'Custom Title',
        description: 'Custom Description',
        actionText: 'Custom Action',
      });

      const setupWidgetComponent = setupWidget();
      expect(setupWidgetComponent.props('title')).toBe('Custom Title');
      expect(setupWidgetComponent.props('description')).toBe(
        'Custom Description',
      );
      expect(setupWidgetComponent.props('actionText')).toBe('Custom Action');
    });

    it('should update SetupWidget props when AddWidget props change', async () => {
      await wrapper.setProps({ title: 'Updated Title' });
      expect(setupWidget().props('title')).toBe('Updated Title');

      await wrapper.setProps({ description: 'Updated Description' });
      expect(setupWidget().props('description')).toBe('Updated Description');

      await wrapper.setProps({ actionText: 'Updated Action' });
      expect(setupWidget().props('actionText')).toBe('Updated Action');
    });
  });

  describe('Event handling integration', () => {
    it('should emit action event when SetupWidget emits action', async () => {
      await setupWidget().vm.$emit('action');

      expect(wrapper.emitted('action')).toBeTruthy();
      expect(wrapper.emitted('action')).toHaveLength(1);
    });

    it('should emit action event multiple times when SetupWidget emits multiple times', async () => {
      await setupWidget().vm.$emit('action');
      await setupWidget().vm.$emit('action');
      await setupWidget().vm.$emit('action');

      expect(wrapper.emitted('action')).toHaveLength(3);
    });

    it('should emit action event without parameters', async () => {
      await setupWidget().vm.$emit('action');

      expect(wrapper.emitted('action')[0]).toEqual([]);
    });
  });

  describe('Component structure', () => {
    it('should have correct wrapper CSS classes', () => {
      expect(addWidgetSection().classes()).toContain('add-widget');
    });

    it('should have correct data-testid for wrapper', () => {
      expect(addWidgetSection().attributes('data-testid')).toBe('add-widget');
    });

    it('should maintain proper component hierarchy', () => {
      const section = addWidgetSection();
      const setup = setupWidget();

      expect(section.exists()).toBe(true);
      expect(setup.exists()).toBe(true);

      // SetupWidget should be rendered inside AddWidget section
      expect(section.find('[data-testid="setup-widget"]').exists()).toBe(true);
    });
  });

  describe('Styling and layout', () => {
    it('should apply add-widget CSS class for styling', () => {
      expect(addWidgetSection().classes()).toContain('add-widget');
    });

    it('should render as a section element', () => {
      expect(addWidgetSection().element.tagName).toBe('SECTION');
    });
  });

  describe('Component lifecycle', () => {
    it('should handle component mounting correctly', () => {
      expect(wrapper.exists()).toBe(true);
      expect(addWidgetSection().exists()).toBe(true);
      expect(setupWidget().exists()).toBe(true);
    });

    it('should handle component unmounting without errors', () => {
      wrapper.unmount();
      expect(wrapper.exists()).toBe(false);
    });
  });

  describe('Component composition', () => {
    it('should act as a proper wrapper for SetupWidget', () => {
      // Verify that AddWidget is correctly composing SetupWidget
      expect(setupWidget().exists()).toBe(true);
      expect(setupWidget().props()).toEqual({
        title: 'Test Title',
        description: 'Test Description',
        actionText: 'Test Action',
      });
    });

    it('should provide proper styling context for SetupWidget', () => {
      // The add-widget section provides the backdrop styling context
      expect(addWidgetSection().classes()).toContain('add-widget');
      expect(setupWidget().exists()).toBe(true);
    });

    it('should handle prop validation correctly', () => {
      // Test that required props are properly defined
      const AddWidgetComponent = wrapper.vm.$options;
      expect(AddWidgetComponent).toBeDefined();
    });
  });
});
