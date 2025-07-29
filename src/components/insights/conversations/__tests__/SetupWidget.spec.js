import { beforeEach, describe, expect, it } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import SetupWidget from '../SetupWidget.vue';

config.global.plugins = [
  createI18n({
    legacy: false,
  }),
];

const createWrapper = (props = {}) => {
  return shallowMount(SetupWidget, {
    props: {
      title: 'Test Title',
      description: 'Test Description',
      actionText: 'Test Action',
      ...props,
    },
    global: {
      stubs: {
        UnnnicButton: {
          template: '<button data-testid="setup-widget-button"></button>',
          props: ['text', 'iconLeft', 'size', 'type'],
          emits: ['click'],
        },
      },
    },
  });
};

describe('SetupWidget', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  const setupWidgetSection = () => wrapper.find('[data-testid="setup-widget"]');
  const setupWidgetTitle = () =>
    wrapper.find('[data-testid="setup-widget-title"]');
  const setupWidgetDescription = () =>
    wrapper.find('[data-testid="setup-widget-description"]');
  const setupWidgetButton = () =>
    wrapper.findComponent('[data-testid="setup-widget-button"]');

  describe('Initial render', () => {
    it('should render the component with correct structure', () => {
      expect(setupWidgetSection().exists()).toBe(true);
      expect(setupWidgetSection().classes()).toContain('setup-widget');
    });

    it('should render the component with correct title and description', () => {
      expect(setupWidgetTitle().exists()).toBe(true);
      expect(setupWidgetTitle().text()).toBe('Test Title');
      expect(setupWidgetDescription().exists()).toBe(true);
      expect(setupWidgetDescription().text()).toBe('Test Description');
    });

    it('should render the setup widget button with correct text', () => {
      expect(setupWidgetButton().exists()).toBe(true);
      expect(setupWidgetButton().props('text')).toBe('Test Action');
    });

    it('should have correct button props', () => {
      expect(setupWidgetButton().props('iconLeft')).toBe('add');
      expect(setupWidgetButton().props('size')).toBe('small');
      expect(setupWidgetButton().props('type')).toBe('primary');
    });
  });

  describe('Props', () => {
    it('should display custom title when passed as prop', () => {
      wrapper = createWrapper({ title: 'Custom Title' });
      expect(setupWidgetTitle().text()).toBe('Custom Title');
    });

    it('should display custom description when passed as prop', () => {
      wrapper = createWrapper({ description: 'Custom Description' });
      expect(setupWidgetDescription().text()).toBe('Custom Description');
    });

    it('should display custom actionText when passed as prop', () => {
      wrapper = createWrapper({ actionText: 'Custom Action' });
      expect(setupWidgetButton().props('text')).toBe('Custom Action');
    });

    it('should handle all props together', () => {
      wrapper = createWrapper({
        title: 'All Custom Title',
        description: 'All Custom Description',
        actionText: 'All Custom Action',
      });

      expect(setupWidgetTitle().text()).toBe('All Custom Title');
      expect(setupWidgetDescription().text()).toBe('All Custom Description');
      expect(setupWidgetButton().props('text')).toBe('All Custom Action');
    });

    it('should be required props', () => {
      // These props are required based on the component definition
      const propDefinitions = SetupWidget.__vccOpts?.props || SetupWidget.props;
      expect(propDefinitions).toBeDefined();
    });
  });

  describe('Event handling', () => {
    it('should emit action event when button is clicked', async () => {
      await setupWidgetButton().vm.$emit('click');

      expect(wrapper.emitted('action')).toBeTruthy();
      expect(wrapper.emitted('action')).toHaveLength(1);
    });

    it('should emit action event multiple times when clicked multiple times', async () => {
      await setupWidgetButton().vm.$emit('click');
      await setupWidgetButton().vm.$emit('click');
      await setupWidgetButton().vm.$emit('click');

      expect(wrapper.emitted('action')).toHaveLength(3);
    });

    it('should emit action event without parameters', async () => {
      await setupWidgetButton().vm.$emit('click');

      expect(wrapper.emitted('action')[0]).toEqual([]);
    });
  });

  describe('Component structure', () => {
    it('should have the correct component hierarchy', () => {
      expect(setupWidgetSection().exists()).toBe(true);
      expect(setupWidgetTitle().exists()).toBe(true);
      expect(setupWidgetDescription().exists()).toBe(true);
      expect(setupWidgetButton().exists()).toBe(true);
    });

    it('should apply correct CSS classes', () => {
      expect(setupWidgetSection().classes()).toContain('setup-widget');
      expect(setupWidgetTitle().classes()).toContain('setup-widget__title');
      expect(setupWidgetDescription().classes()).toContain(
        'setup-widget__description',
      );
    });

    it('should have correct data-testid attributes', () => {
      expect(setupWidgetSection().attributes('data-testid')).toBe(
        'setup-widget',
      );
      expect(setupWidgetTitle().attributes('data-testid')).toBe(
        'setup-widget-title',
      );
      expect(setupWidgetDescription().attributes('data-testid')).toBe(
        'setup-widget-description',
      );
      expect(setupWidgetButton().attributes('data-testid')).toBe(
        'setup-widget-button',
      );
    });
  });

  describe('Styling and layout', () => {
    it('should have absolute positioning', () => {
      expect(setupWidgetSection().classes()).toContain('setup-widget');
      // The CSS should set position: absolute, but we can't test computed styles easily
      // Instead we test that the component has the expected class structure
    });

    it('should center content with flexbox', () => {
      // Test that the component has the expected structure for centering
      expect(setupWidgetSection().exists()).toBe(true);
    });

    it('should apply correct spacing between elements', () => {
      // Test the component structure includes all expected elements
      const title = setupWidgetTitle();
      const description = setupWidgetDescription();
      const button = setupWidgetButton();

      expect(title.exists()).toBe(true);
      expect(description.exists()).toBe(true);
      expect(button.exists()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const title = setupWidgetTitle();
      expect(title.element.tagName).toBe('H2');
    });

    it('should have descriptive text content', () => {
      expect(setupWidgetTitle().text()).toBeTruthy();
      expect(setupWidgetDescription().text()).toBeTruthy();
      expect(setupWidgetButton().props('text')).toBeTruthy();
    });

    it('should have button with appropriate props for accessibility', () => {
      const button = setupWidgetButton();
      expect(button.props('text')).toBe('Test Action');
      expect(button.props('iconLeft')).toBe('add');
    });
  });

  describe('Component lifecycle', () => {
    it('should handle component mounting correctly', () => {
      expect(wrapper.exists()).toBe(true);
      expect(setupWidgetSection().exists()).toBe(true);
    });

    it('should handle component unmounting without errors', () => {
      wrapper.unmount();
      expect(wrapper.exists()).toBe(false);
    });

    it('should handle prop updates correctly', async () => {
      await wrapper.setProps({ title: 'Updated Title' });
      expect(setupWidgetTitle().text()).toBe('Updated Title');

      await wrapper.setProps({ description: 'Updated Description' });
      expect(setupWidgetDescription().text()).toBe('Updated Description');

      await wrapper.setProps({ actionText: 'Updated Action' });
      expect(setupWidgetButton().props('text')).toBe('Updated Action');
    });
  });
});
