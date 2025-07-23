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
  const addWidgetTitle = () => wrapper.find('[data-testid="add-widget-title"]');
  const addWidgetDescription = () =>
    wrapper.find('[data-testid="add-widget-description"]');
  const addWidgetButton = () =>
    wrapper.find('[data-testid="add-widget-button"]');

  describe('Initial render', () => {
    it('should render the component with correct structure', () => {
      expect(addWidgetSection().exists()).toBe(true);
      expect(addWidgetSection().classes()).toContain('add-widget');
    });

    it('should render the component with correct title and description', () => {
      expect(addWidgetTitle().exists()).toBe(true);
      expect(addWidgetTitle().text()).toBe('Test Title');
      expect(addWidgetDescription().exists()).toBe(true);
      expect(addWidgetDescription().text()).toBe('Test Description');
    });

    it('should render the add widget button with correct text', () => {
      expect(addWidgetButton().exists()).toBe(true);
      expect(addWidgetButton().attributes('text')).toBe('Test Action');
    });

    it('should have correct button props', () => {
      expect(addWidgetButton().attributes('iconleft')).toBe('add');
      expect(addWidgetButton().attributes('size')).toBe('small');
      expect(addWidgetButton().attributes('type')).toBe('primary');
    });
  });

  describe('Props', () => {
    it('should display custom title when passed as prop', () => {
      wrapper = createWrapper({ title: 'Custom Title' });
      expect(addWidgetTitle().text()).toBe('Custom Title');
    });

    it('should display custom description when passed as prop', () => {
      wrapper = createWrapper({ description: 'Custom Description' });
      expect(addWidgetDescription().text()).toBe('Custom Description');
    });

    it('should display custom actionText when passed as prop', () => {
      wrapper = createWrapper({ actionText: 'Custom Action' });
      expect(addWidgetButton().attributes('text')).toBe('Custom Action');
    });

    it('should handle all props together', () => {
      wrapper = createWrapper({
        title: 'All Custom Title',
        description: 'All Custom Description',
        actionText: 'All Custom Action',
      });

      expect(addWidgetTitle().text()).toBe('All Custom Title');
      expect(addWidgetDescription().text()).toBe('All Custom Description');
      expect(addWidgetButton().attributes('text')).toBe('All Custom Action');
    });
  });

  describe('Event handling', () => {
    it('should emit action event when button is clicked', async () => {
      await addWidgetButton().trigger('click');

      expect(wrapper.emitted('action')).toBeTruthy();
      expect(wrapper.emitted('action')).toHaveLength(1);
    });

    it('should emit action event multiple times when clicked multiple times', async () => {
      await addWidgetButton().trigger('click');
      await addWidgetButton().trigger('click');
      await addWidgetButton().trigger('click');

      expect(wrapper.emitted('action')).toHaveLength(3);
    });
  });

  describe('Component structure', () => {
    it('should have the correct component hierarchy', () => {
      expect(addWidgetSection().exists()).toBe(true);
      expect(addWidgetTitle().exists()).toBe(true);
      expect(addWidgetDescription().exists()).toBe(true);
      expect(addWidgetButton().exists()).toBe(true);
    });

    it('should apply correct CSS classes', () => {
      expect(addWidgetSection().classes()).toContain('add-widget');
      expect(addWidgetTitle().classes()).toContain('add-widget__title');
      expect(addWidgetDescription().classes()).toContain(
        'add-widget__description',
      );
    });

    it('should have correct data-testid attributes', () => {
      expect(addWidgetSection().attributes('data-testid')).toBe('add-widget');
      expect(addWidgetTitle().attributes('data-testid')).toBe(
        'add-widget-title',
      );
      expect(addWidgetDescription().attributes('data-testid')).toBe(
        'add-widget-description',
      );
      expect(addWidgetButton().attributes('data-testid')).toBe(
        'add-widget-button',
      );
    });
  });
});
