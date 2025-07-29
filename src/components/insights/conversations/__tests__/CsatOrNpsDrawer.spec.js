import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createI18n } from 'vue-i18n';

import CsatOrNpsDrawer from '../CsatOrNpsDrawer.vue';

config.global.plugins = [
  createI18n({
    legacy: false,
  }),
];

const createWrapper = (props = {}) => {
  return shallowMount(CsatOrNpsDrawer, {
    props: {
      modelValue: true,
      ...props,
    },
    global: {
      stubs: {
        UnnnicDrawer: {
          template: '<div><slot name="content" /></div>',
          emits: ['close'],
        },
      },
    },
  });
};

describe('CsatOrNpsDrawer', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  const drawer = () =>
    wrapper.findComponent('[data-testid="add-widget-drawer"]');
  const drawerItems = () =>
    wrapper.findAll('[data-testid="add-widget-drawer-item"]');
  const drawerItemTitles = () =>
    wrapper.findAll('[data-testid="add-widget-drawer-item-title"]');
  const drawerItemDescriptions = () =>
    wrapper.findAll('[data-testid="add-widget-drawer-item-description"]');
  const configCsatOrNpsWidget = () =>
    wrapper.findComponent('[data-testid="config-csat-or-nps-widget"]');

  describe('Drawer functionality', () => {
    it('should open drawer when AddWidget action is triggered', async () => {
      expect(wrapper.vm.modelValue).toBe(true);
      expect(drawer().exists()).toBe(true);
    });

    it('should close drawer when close event is emitted', async () => {
      await drawer().vm.$emit('close');
      await nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
    });

    it('should toggle drawer state with handleDrawerAddWidget method', async () => {
      wrapper.vm.handleDrawerAddWidget();

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
    });
  });

  describe('Drawer content', () => {
    it('should render drawer with correct props when open', () => {
      const drawerComponent = drawer();

      expect(drawerComponent.exists()).toBe(true);
      expect(drawerComponent.attributes('title')).toBe('Widgets');
      expect(drawerComponent.classes()).toContain('add-widget-drawer');
      expect(drawerComponent.attributes('data-testid')).toBe(
        'add-widget-drawer',
      );
    });

    it('should render correct number of available widgets', () => {
      expect(drawerItems()).toHaveLength(2);
    });

    it('should render CSAT widget with correct information', () => {
      const csatTitle = drawerItemTitles()[0];
      const csatDescription = drawerItemDescriptions()[0];

      expect(csatTitle.text()).toBe('CSAT');
      expect(csatDescription.text()).toBe(
        'The Customer Satisfaction Score indicates the contact level of satisfaction with the service received.',
      );
    });

    it('should render NPS widget with correct information', () => {
      const npsTitle = drawerItemTitles()[1];
      const npsDescription = drawerItemDescriptions()[1];

      expect(npsTitle.text()).toBe('NPS');
      expect(npsDescription.text()).toBe(
        'The Net Promoter Score indicates how likely contact are to recommend the service they received to others.',
      );
    });

    it('should render widget items with correct structure', () => {
      const items = drawerItems();

      items.forEach((item) => {
        expect(item.classes()).toContain('widget-list__item');
        expect(item.attributes('data-testid')).toBe('add-widget-drawer-item');
      });
    });

    it('should set type when widget is selected', async () => {
      await drawerItems()[0].trigger('click');
      await nextTick();
      expect(wrapper.vm.type).toBe('csat');
    });

    it('should render ConfigCsatOrNpsWidget component when widget is selected and hide drawer items', async () => {
      expect(configCsatOrNpsWidget().exists()).toBe(false);

      await drawerItems()[0].trigger('click');
      await nextTick();

      expect(configCsatOrNpsWidget().exists()).toBe(true);
      expect(drawerItems()).toHaveLength(0);
    });
  });

  describe('Available widgets data', () => {
    it('should have correct availableWidgets structure', () => {
      expect(wrapper.vm.availableWidgets).toHaveLength(2);

      expect(wrapper.vm.availableWidgets[0]).toEqual({
        name: 'CSAT',
        description:
          'The Customer Satisfaction Score indicates the contact level of satisfaction with the service received.',
      });

      expect(wrapper.vm.availableWidgets[1]).toEqual({
        name: 'NPS',
        description:
          'The Net Promoter Score indicates how likely contact are to recommend the service they received to others.',
      });
    });

    it('should maintain consistent widget data structure', () => {
      wrapper.vm.availableWidgets.forEach((widget) => {
        expect(widget).toHaveProperty('name');
        expect(widget).toHaveProperty('description');
        expect(typeof widget.name).toBe('string');
        expect(typeof widget.description).toBe('string');
        expect(widget.name.length).toBeGreaterThan(0);
        expect(widget.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Component state management', () => {
    it('should maintain state correctly through multiple toggles', async () => {
      // Test handleDrawerAddWidget method
      wrapper.vm.handleDrawerAddWidget();
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();

      // Reset emitted events for next test
      wrapper.clearEmittedEvents?.() || (wrapper.vm.$emit = vi.fn());
    });

    it('should handle rapid state changes correctly', async () => {
      // Rapidly call handleDrawerAddWidget multiple times
      for (let i = 0; i < 5; i++) {
        wrapper.vm.handleDrawerAddWidget();
        await nextTick();
      }

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    });
  });

  describe('Event handling integration', () => {
    it('should respond to drawer close event', async () => {
      // Close via drawer close event
      await drawer().vm.$emit('close');
      await nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
    });
  });

  describe('CSS classes and styling', () => {
    it('should apply correct CSS classes to drawer', async () => {
      expect(drawer().classes()).toContain('add-widget-drawer');
    });

    it('should apply correct CSS classes to widget list items', async () => {
      const items = drawerItems();
      items.forEach((item) => {
        expect(item.classes()).toContain('widget-list__item');
      });
    });

    it('should apply correct CSS classes to item titles and descriptions', async () => {
      const titles = drawerItemTitles();
      const descriptions = drawerItemDescriptions();

      titles.forEach((title) => {
        expect(title.classes()).toContain('item__title');
      });

      descriptions.forEach((description) => {
        expect(description.classes()).toContain('item__description');
      });
    });
  });

  describe('Component lifecycle', () => {
    it('should handle component mounting correctly', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.vm.availableWidgets).toHaveLength(2);
    });

    it('should handle component unmounting without errors', () => {
      wrapper.unmount();
      expect(wrapper.exists()).toBe(false);
    });
  });
});
