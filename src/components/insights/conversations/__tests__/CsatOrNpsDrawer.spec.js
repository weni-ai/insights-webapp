import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createI18n } from 'vue-i18n';

import CsatOrNpsDrawer from '../CsatOrNpsWidget/CsatOrNpsDrawer.vue';

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
          emits: ['close', 'primary-button-click', 'secondary-button-click'],
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
  const modalAttention = () =>
    wrapper.findComponent('[data-testid="drawer-csat-or-nps-widget-modal"]');

  describe('Drawer functionality', () => {
    it('should open drawer when modelValue is true', async () => {
      expect(wrapper.vm.modelValue).toBe(true);
      expect(drawer().exists()).toBe(true);
    });

    it('should emit update:modelValue with false when drawer close event is triggered and no type is selected', async () => {
      wrapper.vm.type = null;
      await drawer().vm.$emit('close');
      await nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
    });

    it('should show warning modal when close event is triggered with type selected', async () => {
      wrapper.vm.type = 'csat';
      await wrapper.vm.closeDrawer();

      expect(wrapper.vm.warningModalType).toBe('cancel');
      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });
  });

  describe('Drawer button functionality', () => {
    it('should show empty primary and secondary button text when no type is selected', async () => {
      wrapper.vm.type = null;
      await nextTick();

      const drawerComponent = drawer();
      expect(drawerComponent.attributes('primarybuttontext')).toBe('');
      expect(drawerComponent.attributes('secondarybuttontext')).toBe('');
    });

    it('should show save and return button text when type is selected', async () => {
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

    it('should set warningModalType to return when secondary button is clicked', async () => {
      wrapper.vm.type = 'csat';
      await nextTick();

      await drawer().vm.$emit('secondary-button-click');

      expect(wrapper.vm.warningModalType).toBe('return');
    });

    it('should call saveWidgetConfigs when primary button is clicked', async () => {
      const saveWidgetConfigsSpy = vi.spyOn(wrapper.vm, 'saveWidgetConfigs');
      wrapper.vm.type = 'csat';
      await nextTick();

      await drawer().vm.$emit('primary-button-click');

      expect(saveWidgetConfigsSpy).toHaveBeenCalled();
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

  describe('Warning modal functionality', () => {
    it('should not render ModalAttention when warningModalType is empty', () => {
      expect(modalAttention().exists()).toBe(false);
    });

    it('should render ModalAttention when warningModalType is set', async () => {
      wrapper.vm.warningModalType = 'return';
      await nextTick();

      expect(modalAttention().exists()).toBe(true);
      expect(modalAttention().props('type')).toBe('return');
      expect(modalAttention().props('modelValue')).toBe(true);
    });

    it('should pass correct props to ModalAttention', async () => {
      wrapper.vm.warningModalType = 'cancel';
      await nextTick();

      const modal = modalAttention();
      expect(modal.props('type')).toBe('cancel');
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
      it('should log saveWidgetConfigs and close drawer', () => {
        const consoleSpy = vi
          .spyOn(console, 'log')
          .mockImplementation(() => {});

        wrapper.vm.saveWidgetConfigs();

        expect(consoleSpy).toHaveBeenCalledWith('saveWidgetConfigs');
        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
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

        wrapper.vm.cancelWidgetConfigs();

        expect(wrapper.vm.warningModalType).toBe('');
        expect(wrapper.vm.type).toBe(null);
        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
      });
    });

    describe('confirmAttentionModal', () => {
      it('should return widget type choice when warningModalType is return', () => {
        wrapper.vm.warningModalType = 'return';

        wrapper.vm.confirmAttentionModal();

        expect(wrapper.vm.type).toBe(null);
        expect(wrapper.vm.warningModalType).toBe('');
      });

      it('should cancel widget configs when warningModalType is cancel', () => {
        wrapper.vm.warningModalType = 'cancel';

        wrapper.vm.confirmAttentionModal();

        expect(wrapper.vm.type).toBe(null);
        expect(wrapper.vm.warningModalType).toBe('');
        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      });
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

  describe('Integration tests', () => {
    it('should complete full workflow: select widget -> return -> keep configuring', async () => {
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
    });

    it('should complete full workflow: select widget -> return -> confirm return', async () => {
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
    });

    it('should complete full workflow: select widget -> close -> cancel', async () => {
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
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
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
