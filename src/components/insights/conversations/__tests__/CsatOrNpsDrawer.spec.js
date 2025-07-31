import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';
import { createI18n } from 'vue-i18n';

import CsatOrNpsDrawer from '../CsatOrNpsWidget/CsatOrNpsDrawer.vue';
import { useConversational } from '@/store/modules/conversational/conversational';

vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: {
      t: vi.fn((key) => {
        const translations = {
          'conversations_dashboard.csat': 'CSAT',
          'conversations_dashboard.nps': 'NPS',
          'conversations_dashboard.customize_your_dashboard.csat_description':
            'The Customer Satisfaction Score indicates the contact level of satisfaction with the service received.',
          'conversations_dashboard.customize_your_dashboard.nps_description':
            'The Net Promoter Score indicates how likely contact are to recommend the service they received to others.',
          'conversations_dashboard.customize_your_dashboard.save_changes':
            'conversations_dashboard.customize_your_dashboard.save_changes',
          'conversations_dashboard.customize_your_dashboard.return':
            'conversations_dashboard.customize_your_dashboard.return',
          cancel: 'cancel',
        };
        return translations[key] || key;
      }),
    },
  },
}));

config.global.plugins = [
  createI18n({
    legacy: false,
  }),
];

const createWrapper = (props = {}, storeOverrides = {}) => {
  const pinia = createTestingPinia({
    initialState: {
      conversational: {
        isDrawerCsatOrNpsOpen: true,
        drawerWidgetType: 'add',
        isNewDrawerCsatOrNps: true,
        ...storeOverrides,
      },
      conversationalWidgets: {
        isEnabledSaveNewWidget: true,
        isCsatConfigured: false,
        isNpsConfigured: false,
        isEnabledUpdateWidgetCsat: true,
        isEnabledUpdateWidgetNps: true,
        currentCsatWidget: { config: {} },
        currentNpsWidget: { config: {} },
      },
    },
    stubActions: false,
  });

  return shallowMount(CsatOrNpsDrawer, {
    props: {
      ...props,
    },
    global: {
      plugins: [pinia],
      stubs: {
        UnnnicDrawer: {
          template:
            '<div><slot name="content" /><slot name="header-close" /></div>',
          emits: ['close', 'primary-button-click', 'secondary-button-click'],
        },
        ModalAttention: {
          template: '<div></div>',
          props: ['modelValue', 'type'],
          emits: ['primary-button-click', 'secondary-button-click'],
        },
        ConfigCsatOrNpsWidget: true,
      },
    },
  });
};

describe('CsatOrNpsDrawer', () => {
  let wrapper;
  let conversationalStore;

  beforeEach(() => {
    wrapper = createWrapper();
    conversationalStore = useConversational();
  });

  const drawer = () =>
    wrapper.findComponent('[data-testid="add-widget-drawer"]');
  const drawerItems = () =>
    wrapper.findAll('[data-testid="add-widget-drawer-item"]');
  const configCsatOrNpsWidget = () =>
    wrapper.findComponent('[data-testid="config-csat-or-nps-widget"]');
  const modalAttention = () =>
    wrapper.findComponent('[data-testid="drawer-csat-or-nps-widget-modal"]');

  describe('Drawer functionality', () => {
    it('should open drawer when isDrawerCsatOrNpsOpen is true', () => {
      expect(conversationalStore.isDrawerCsatOrNpsOpen).toBe(true);
      expect(drawer().exists()).toBe(true);
    });

    it('should close drawer when close event is triggered', async () => {
      await drawer().vm.$emit('close');
      expect(conversationalStore.isDrawerCsatOrNpsOpen).toBe(false);
    });
  });

  describe('Drawer button functionality', () => {
    it('should show correct button text when in add mode', () => {
      const drawerComponent = drawer();
      expect(drawerComponent.attributes('primarybuttontext')).toBe('');
      expect(drawerComponent.attributes('secondarybuttontext')).toBe('cancel');
    });

    it('should show correct button text when drawerWidgetType is falsy', async () => {
      conversationalStore.drawerWidgetType = null;
      await nextTick();

      const drawerComponent = drawer();
      expect(drawerComponent.attributes('primarybuttontext')).toBe(
        'conversations_dashboard.customize_your_dashboard.save_changes',
      );
      expect(drawerComponent.attributes('secondarybuttontext')).toBe(
        'conversations_dashboard.customize_your_dashboard.return',
      );
    });

    it('should show correct button text when type is selected', async () => {
      conversationalStore.drawerWidgetType = 'csat';
      await nextTick();

      const drawerComponent = drawer();
      expect(drawerComponent.attributes('primarybuttontext')).toBe(
        'conversations_dashboard.customize_your_dashboard.save_changes',
      );
      expect(drawerComponent.attributes('secondarybuttontext')).toBe(
        'conversations_dashboard.customize_your_dashboard.return',
      );
    });

    it('should handle secondary button click when in add mode', async () => {
      await drawer().vm.$emit('secondary-button-click');
      expect(conversationalStore.isDrawerCsatOrNpsOpen).toBe(false);
    });

    it('should handle secondary button click when drawerWidgetType is falsy', async () => {
      conversationalStore.drawerWidgetType = null;
      await nextTick();

      await drawer().vm.$emit('secondary-button-click');
      expect(wrapper.vm.warningModalType).toBe('return');
    });

    it('should handle secondary button click when type is selected but no changes detected', async () => {
      const wrapperWithConfig = createWrapper(
        {},
        {
          drawerWidgetType: 'csat',
          isNewDrawerCsatOrNps: false,
        },
      );
      const conversationalStoreConfig = useConversational();

      await nextTick();

      await wrapperWithConfig
        .findComponent('[data-testid="add-widget-drawer"]')
        .vm.$emit('secondary-button-click');

      expect(conversationalStoreConfig.isDrawerCsatOrNpsOpen).toBe(false);
    });

    it('should call saveWidgetConfigs when primary button is clicked', async () => {
      const saveWidgetConfigsSpy = vi
        .spyOn(wrapper.vm, 'saveWidgetConfigs')
        .mockImplementation(() => Promise.resolve());
      conversationalStore.drawerWidgetType = 'csat';
      await nextTick();

      await drawer().vm.$emit('primary-button-click');
      expect(saveWidgetConfigsSpy).toHaveBeenCalled();
    });
  });

  describe('Drawer content', () => {
    it('should render drawer with correct initial props', () => {
      const drawerComponent = drawer();
      expect(drawerComponent.exists()).toBe(true);
      expect(drawerComponent.attributes('title')).toBe('Widgets');
    });

    it('should render correct number of available widgets', () => {
      expect(drawerItems()).toHaveLength(2);
    });

    it('should set type when widget is selected', async () => {
      await drawerItems()[0].trigger('click');
      expect(conversationalStore.drawerWidgetType).toBe('csat');
    });

    it('should render ConfigCsatOrNpsWidget component when widget is selected', async () => {
      await drawerItems()[0].trigger('click');
      await nextTick();
      expect(configCsatOrNpsWidget().exists()).toBe(true);
    });
  });

  describe('Warning modal functionality', () => {
    it('should render ModalAttention with modelValue true when warningModalType is set', async () => {
      wrapper.vm.warningModalType = 'return';
      await nextTick();
      expect(modalAttention().exists()).toBe(true);
      expect(modalAttention().vm.modelValue).toBe(true);
    });
  });

  describe('Warning modal methods', () => {
    it('should clear warningModalType on close', () => {
      wrapper.vm.warningModalType = 'return';
      wrapper.vm.closeWarningModal();
      expect(wrapper.vm.warningModalType).toBe('');
    });

    it('should reset type on returnWidgetTypeChoice', () => {
      conversationalStore.drawerWidgetType = 'csat';
      wrapper.vm.returnWidgetTypeChoice();
      expect(conversationalStore.drawerWidgetType).toBe('add');
    });

    it('should close drawer on cancelWidgetConfigs', () => {
      wrapper.vm.cancelWidgetConfigs();
      expect(conversationalStore.drawerWidgetType).toBe(null);
      expect(conversationalStore.isDrawerCsatOrNpsOpen).toBe(false);
    });
  });
});
