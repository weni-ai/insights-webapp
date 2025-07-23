import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createI18n } from 'vue-i18n';

import AddCsatOrNpsWidget from '../CsatOrNpsWidget/AddCsatOrNpsWidget.vue';

config.global.plugins = [
  createI18n({
    legacy: false,
  }),
];

const createWrapper = (props = {}) => {
  return shallowMount(AddCsatOrNpsWidget, {
    props: { ...props },
    global: {
      stubs: {
        UnnnicDrawer: {
          template: '<div><slot name="content" /></div>',
          emits: ['close', 'primary-button-click', 'secondary-button-click'],
        },
      },
    },
  });
};

describe('AddCsatOrNpsWidget', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  const addWidget = () => wrapper.findComponent('[data-testid="add-widget"]');
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
  const modalAttention = () =>
    wrapper.findComponent('[data-testid="drawer-csat-or-nps-widget-modal"]');

  describe('Initial render', () => {
    it('should render AddWidget component', () => {
      expect(addWidget().exists()).toBe(true);
    });

    it('should not render drawer initially', () => {
      expect(drawer().exists()).toBe(false);
    });

    it('should pass correct props to AddWidget', () => {
      const addWidgetComponent = addWidget();

      expect(addWidgetComponent.attributes('title')).toBe(
        'conversations_dashboard.customize_your_dashboard.title',
      );
      expect(addWidgetComponent.attributes('description')).toBe(
        'conversations_dashboard.customize_your_dashboard.description',
      );
      expect(addWidgetComponent.attributes('actiontext')).toBe(
        'conversations_dashboard.customize_your_dashboard.add_widget',
      );
    });
  });

  describe('Drawer functionality', () => {
    it('should open drawer when AddWidget action is triggered', async () => {
      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(false);

      await addWidget().vm.$emit('action');
      await nextTick();

      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(true);
      expect(drawer().exists()).toBe(true);
    });

    it('should close drawer when close event is emitted', async () => {
      wrapper.vm.handleDrawerAddWidget();
      await nextTick();
      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(true);

      await drawer().vm.$emit('close');
      await nextTick();

      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(false);
    });

    it('should toggle drawer state with handleDrawerAddWidget method', async () => {
      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(false);

      wrapper.vm.handleDrawerAddWidget();
      await nextTick();
      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(true);

      wrapper.vm.handleDrawerAddWidget();
      await nextTick();
      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(false);
    });
  });

  describe('Drawer content', () => {
    beforeEach(async () => {
      wrapper.vm.handleDrawerAddWidget();
      await nextTick();
    });

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
    it('should initialize with drawer closed', () => {
      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(false);
    });

    it('should maintain state correctly through multiple toggles', async () => {
      // Initial state
      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(false);

      // Open
      wrapper.vm.handleDrawerAddWidget();
      await nextTick();
      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(true);

      // Close
      wrapper.vm.handleDrawerAddWidget();
      await nextTick();
      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(false);

      // Open again
      wrapper.vm.handleDrawerAddWidget();
      await nextTick();
      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(true);
    });

    it('should handle rapid state changes correctly', async () => {
      // Rapidly toggle multiple times
      for (let i = 0; i < 5; i++) {
        wrapper.vm.handleDrawerAddWidget();
        await nextTick();
      }

      // Should end up in open state (started false, toggled 5 times)
      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(true);
    });
  });

  describe('Event handling integration', () => {
    it('should respond to AddWidget action event', async () => {
      expect(drawer().exists()).toBe(false);

      await addWidget().vm.$emit('action');
      await nextTick();

      expect(drawer().exists()).toBe(true);
      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(true);
    });

    it('should respond to drawer close event', async () => {
      // Open drawer first
      wrapper.vm.handleDrawerAddWidget();
      await nextTick();
      expect(drawer().exists()).toBe(true);

      // Close via drawer close event
      await drawer().vm.$emit('close');
      await nextTick();

      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(false);
    });
  });

  describe('CSS classes and styling', () => {
    it('should apply correct CSS classes to drawer', async () => {
      wrapper.vm.handleDrawerAddWidget();
      await nextTick();

      expect(drawer().classes()).toContain('add-widget-drawer');
    });

    it('should apply correct CSS classes to widget list items', async () => {
      wrapper.vm.handleDrawerAddWidget();
      await nextTick();

      const items = drawerItems();
      items.forEach((item) => {
        expect(item.classes()).toContain('widget-list__item');
      });
    });

    it('should apply correct CSS classes to item titles and descriptions', async () => {
      wrapper.vm.handleDrawerAddWidget();
      await nextTick();

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
      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(false);
      expect(wrapper.vm.availableWidgets).toHaveLength(2);
    });

    it('should handle component unmounting without errors', () => {
      wrapper.unmount();
      expect(wrapper.exists()).toBe(false);
    });
  });

  describe('Drawer button functionality', () => {
    it('should show empty primary and secondary button text when no type is selected', async () => {
      wrapper.vm.handleDrawerAddWidget();
      await nextTick();

      const drawerComponent = drawer();
      expect(drawerComponent.attributes('primarybuttontext')).toBe('');
      expect(drawerComponent.attributes('secondarybuttontext')).toBe('');
    });

    it('should show save and return button text when type is selected', async () => {
      wrapper.vm.handleDrawerAddWidget();
      wrapper.vm.type = 'csat';
      await nextTick();

      const drawerComponent = drawer();
      expect(drawerComponent.attributes('primarybuttontext')).toBe(
        'conversations_dashboard.customize_your_dashboard.save_changes',
      );
      expect(drawerComponent.attributes('secondarybuttontext')).toBe(
        'conversations_dashboard.customize_your_dashboard.return',
      );
    });

    it('should set warningModalType to return when secondary button is clicked and type exists', async () => {
      wrapper.vm.handleDrawerAddWidget();
      wrapper.vm.type = 'csat';
      await nextTick();

      await drawer().vm.$emit('secondary-button-click');

      expect(wrapper.vm.warningModalType).toBe('return');
    });
  });

  describe('Drawer close behavior', () => {
    it('should show warning modal when closing drawer with type selected', async () => {
      wrapper.vm.isAddWidgetDrawerOpen = true;
      wrapper.vm.type = 'csat';

      wrapper.vm.closeDrawer();

      expect(wrapper.vm.warningModalType).toBe('cancel');
      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(true);
    });

    it('should close drawer immediately when no type is selected', async () => {
      wrapper.vm.isAddWidgetDrawerOpen = true;
      wrapper.vm.type = null;

      wrapper.vm.closeDrawer();

      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(false);
      expect(wrapper.vm.warningModalType).toBe('');
    });
  });

  describe('Warning modal functionality', () => {
    it('should not render ModalAttention when warningModalType is empty', () => {
      expect(modalAttention().exists()).toBe(false);
    });

    it('should render ModalAttention when warningModalType is set', async () => {
      wrapper.vm.warningModalType = 'return';
      await nextTick();

      expect(modalAttention().exists()).toBe(true);
      expect(modalAttention().attributes('type')).toBe('return');
      expect(modalAttention().attributes('modelvalue')).toBe('true');
    });

    it('should pass correct props to ModalAttention', async () => {
      wrapper.vm.warningModalType = 'cancel';
      await nextTick();

      const modal = modalAttention();
      expect(modal.attributes('type')).toBe('cancel');
      expect(modal.attributes('data-testid')).toBe(
        'drawer-csat-or-nps-widget-modal',
      );
    });
  });

  describe('Warning modal methods', () => {
    describe('closeWarningModal', () => {
      it('should clear warningModalType', () => {
        wrapper.vm.warningModalType = 'return';
        wrapper.vm.closeWarningModal();

        expect(wrapper.vm.warningModalType).toBe('');
      });
    });

    describe('saveWidgetConfigs', () => {
      it('should log saveWidgetConfigs', () => {
        const consoleSpy = vi
          .spyOn(console, 'log')
          .mockImplementation(() => {});

        wrapper.vm.saveWidgetConfigs();

        expect(consoleSpy).toHaveBeenCalledWith('saveWidgetConfigs');
        consoleSpy.mockRestore();
      });
    });

    describe('returnWidgetTypeChoice', () => {
      it('should close warning modal and reset type', () => {
        wrapper.vm.warningModalType = 'return';
        wrapper.vm.type = 'csat';

        wrapper.vm.returnWidgetTypeChoice();

        expect(wrapper.vm.warningModalType).toBe('');
        expect(wrapper.vm.type).toBe(null);
      });
    });

    describe('cancelWidgetConfigs', () => {
      it('should close warning modal, reset type and close drawer', () => {
        wrapper.vm.warningModalType = 'cancel';
        wrapper.vm.type = 'nps';
        wrapper.vm.isAddWidgetDrawerOpen = true;

        wrapper.vm.cancelWidgetConfigs();

        expect(wrapper.vm.warningModalType).toBe('');
        expect(wrapper.vm.type).toBe(null);
        expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(false);
      });
    });
  });

  describe('Integration tests', () => {
    it('should complete full workflow: open drawer -> select widget -> return -> keep configuring', async () => {
      // Open drawer
      wrapper.vm.handleDrawerAddWidget();
      await nextTick();
      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(true);

      // Select widget
      await drawerItems()[0].trigger('click');
      await nextTick();
      expect(wrapper.vm.type).toBe('csat');

      // Return
      await drawer().vm.$emit('secondary-button-click');
      expect(wrapper.vm.warningModalType).toBe('return');

      // Keep configuring
      await modalAttention().vm.$emit('secondary-button-click');
      expect(wrapper.vm.warningModalType).toBe('');
      expect(wrapper.vm.type).toBe('csat');
      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(true);
    });

    it('should complete full workflow: open drawer -> select widget -> return -> confirm return', async () => {
      // Open drawer
      wrapper.vm.handleDrawerAddWidget();
      await nextTick();
      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(true);

      // Select widget
      await drawerItems()[0].trigger('click');
      await nextTick();
      expect(wrapper.vm.type).toBe('csat');

      // Return
      await drawer().vm.$emit('secondary-button-click');
      expect(wrapper.vm.warningModalType).toBe('return');

      // Confirm return
      await modalAttention().vm.$emit('primary-button-click');
      expect(wrapper.vm.warningModalType).toBe('');
      expect(wrapper.vm.type).toBe(null);
      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(true);
    });

    it('should complete full workflow: open drawer -> select widget -> close -> cancel', async () => {
      // Open drawer
      wrapper.vm.handleDrawerAddWidget();
      await nextTick();
      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(true);

      // Select widget
      await drawerItems()[0].trigger('click');
      await nextTick();
      expect(wrapper.vm.type).toBe('csat');

      // Close
      wrapper.vm.closeDrawer();
      await nextTick();
      expect(wrapper.vm.warningModalType).toBe('cancel');

      // Cancel
      await modalAttention().vm.$emit('primary-button-click');
      expect(wrapper.vm.warningModalType).toBe('');
      expect(wrapper.vm.type).toBe(null);
      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(false);
    });
  });
});
