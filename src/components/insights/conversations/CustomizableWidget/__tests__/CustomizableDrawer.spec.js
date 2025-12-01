import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';
import { createI18n } from 'vue-i18n';

import CustomizableDrawer from '../CustomizableDrawer.vue';
import { useConversational } from '@/store/modules/conversational/conversational';
import { useConversationalWidgets } from '@/store/modules/conversational/widgets';
import { useSentimentAnalysisForm } from '@/store/modules/conversational/sentimentForm';

vi.mock('@/store/modules/project', () => ({
  useProject: () => ({
    isLoadedFlows: true,
    getProjectFlows: vi.fn(),
    getAgentsTeam: vi.fn(),
    agentsTeam: { manager: null, agents: [] },
    isLoadingAgentsTeam: false,
    hasValidSalesFunnelAgent: false,
  }),
}));

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
          'conversations_dashboard.customize_your_dashboard.horizontal_bar_chart.title':
            'Horizontal Bar Chart',
          'conversations_dashboard.customize_your_dashboard.horizontal_bar_chart.description':
            'Create custom horizontal bar charts with your data.',
          'conversations_dashboard.customize_your_dashboard.save_changes':
            'conversations_dashboard.customize_your_dashboard.save_changes',
          'conversations_dashboard.customize_your_dashboard.return':
            'conversations_dashboard.customize_your_dashboard.return',
          'conversations_dashboard.customize_your_dashboard.tabs.native':
            'Native',
          'conversations_dashboard.customize_your_dashboard.tabs.customized':
            'Customized',
          'conversations_dashboard.customize_your_dashboard.select_chart_type':
            'Select chart type',
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
        isDrawerCustomizableOpen: true,
        drawerWidgetType: 'add',
        isNewDrawerCustomizable: true,
        ...storeOverrides.conversational,
      },
      conversationalWidgets: {
        isEnabledSaveNewWidget: true,
        isCsatConfigured: false,
        isNpsConfigured: false,
        isEnabledUpdateWidgetCsat: true,
        isEnabledUpdateWidgetNps: true,
        currentCsatWidget: { config: {} },
        currentNpsWidget: { config: {} },
        ...storeOverrides.conversationalWidgets,
      },
    },
    stubActions: false,
  });

  return shallowMount(CustomizableDrawer, {
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
        UnnnicTab: {
          template:
            '<div><slot v-for="tab in tabs" :name="`tab-panel-${tab}`" :key="tab" /></div>',
          props: ['tabs', 'activeTab'],
        },
        ModalAttention: {
          template: '<div></div>',
          props: ['modelValue', 'type'],
          emits: ['primary-button-click', 'secondary-button-click'],
        },
        ConfigCustomizableForm: {
          template: '<div></div>',
          props: ['type', 'isNew'],
        },
      },
    },
  });
};

describe('CustomizableWidget', () => {
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
  const configCustomizableForm = () =>
    wrapper.findComponent('[data-testid="config-customizable-form"]');
  const modalAttention = () =>
    wrapper.findComponent('[data-testid="drawer-csat-or-nps-widget-modal"]');

  describe('Drawer functionality', () => {
    it('should open drawer when isDrawerCustomizableOpen is true', () => {
      expect(conversationalStore.isDrawerCustomizableOpen).toBe(true);
      expect(drawer().exists()).toBe(true);
    });

    it('should close drawer when close event is triggered', async () => {
      await drawer().vm.$emit('close');
      expect(conversationalStore.isDrawerCustomizableOpen).toBe(false);
    });

    it('should reset sentiment form when reopening the same new csat drawer after close', async () => {
      const sentimentStore = useSentimentAnalysisForm();

      conversationalStore.setIsDrawerCustomizableOpen(true, 'csat', true);
      await nextTick();

      sentimentStore.setSentimentForm({
        humanSupport: true,
        aiSupport: true,
        flow: { uuid: 'flow-1', result: 'result-1' },
        agentUuid: 'agent-1',
      });

      await drawer().vm.$emit('close');
      await nextTick();

      expect(sentimentStore.editingContext).toEqual({
        type: '',
        isNew: true,
        uuid: '',
      });

      conversationalStore.setIsDrawerCustomizableOpen(true, 'csat', true);
      await nextTick();

      expect(sentimentStore.sentimentForm).toEqual({
        humanSupport: false,
        aiSupport: false,
        flow: { uuid: null, result: null },
        agentUuid: null,
      });
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
      expect(conversationalStore.isDrawerCustomizableOpen).toBe(false);
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
          isNewDrawerCustomizable: false,
        },
      );
      const conversationalStoreConfig = useConversational();

      await nextTick();

      await wrapperWithConfig
        .findComponent('[data-testid="add-widget-drawer"]')
        .vm.$emit('secondary-button-click');

      expect(conversationalStoreConfig.isDrawerCustomizableOpen).toBe(false);
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

    it('should render correct number of available widgets when no CSAT/NPS configured', () => {
      expect(drawerItems()).toHaveLength(3);
    });

    it('should set type when widget is selected', async () => {
      await drawerItems()[0].trigger('click');
      expect(conversationalStore.drawerWidgetType).toBe('csat');
    });

    it('should render ConfigCustomizableForm component when widget is selected', async () => {
      await drawerItems()[0].trigger('click');
      await nextTick();
      expect(configCustomizableForm().exists()).toBe(true);
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
      expect(conversationalStore.isDrawerCustomizableOpen).toBe(false);
    });
  });

  describe('Tab functionality', () => {
    it('should show native tab as active when no CSAT/NPS configured', () => {
      expect(wrapper.vm.activeTab).toBe(
        'conversations_dashboard.customize_your_dashboard.tabs.native',
      );
    });

    it('should show customized tab as active when CSAT or NPS is configured', async () => {
      conversationalStore.drawerWidgetType = 'csat';
      await nextTick();
      expect(wrapper.vm.activeTab).toBe(
        'conversations_dashboard.customize_your_dashboard.tabs.customized',
      );
    });

    it('should return correct widgets for native tab when no widgets configured', () => {
      const sentimentWidgets = wrapper.vm.handleTabChoice('native');
      expect(sentimentWidgets).toHaveLength(2);
      expect(sentimentWidgets[0].key).toBe('csat');
      expect(sentimentWidgets[1].key).toBe('nps');
    });

    it('should filter out CSAT widget when already configured', async () => {
      const wrapperWithCsat = createWrapper(
        {},
        {
          conversationalWidgets: {
            isCsatConfigured: true,
            isNpsConfigured: false,
          },
        },
      );

      const conversationalWidgetsStore = useConversationalWidgets();
      conversationalWidgetsStore.isCsatConfigured = true;
      conversationalWidgetsStore.isNpsConfigured = false;

      await nextTick();

      const sentimentWidgets = wrapperWithCsat.vm.handleTabChoice('native');
      expect(sentimentWidgets).toHaveLength(1);
      expect(sentimentWidgets[0].key).toBe('nps');
    });

    it('should filter out NPS widget when already configured', async () => {
      const wrapperWithNps = createWrapper(
        {},
        {
          conversationalWidgets: {
            isCsatConfigured: false,
            isNpsConfigured: true,
          },
        },
      );

      const conversationalWidgetsStore = useConversationalWidgets();
      conversationalWidgetsStore.isCsatConfigured = false;
      conversationalWidgetsStore.isNpsConfigured = true;

      await nextTick();

      const sentimentWidgets = wrapperWithNps.vm.handleTabChoice('native');
      expect(sentimentWidgets).toHaveLength(1);
      expect(sentimentWidgets[0].key).toBe('csat');
    });

    it('should return custom for customized tab', () => {
      const customizedWidgets = wrapper.vm.handleTabChoice('customized');
      expect(customizedWidgets).toHaveLength(1);
      expect(customizedWidgets[0].key).toBe('custom');
      expect(customizedWidgets[0].name).toBe('Horizontal Bar Chart');
    });

    it('should return empty array for unknown tab', () => {
      const unknownWidgets = wrapper.vm.handleTabChoice('unknown');
      expect(unknownWidgets).toHaveLength(0);
    });
  });

  describe('Widget type selection', () => {
    it('should handle custom widget selection', async () => {
      conversationalStore.drawerWidgetType = 'add';
      await nextTick();

      const customizedWidgets = wrapper.vm.handleTabChoice('customized');
      expect(customizedWidgets[0].key).toBe('custom');
    });

    it('should find correct widget by type', () => {
      const csatWidget = wrapper.vm.handleWidgetTypeChoice('csat');
      expect(csatWidget.key).toBe('csat');
      expect(csatWidget.name).toBe('CSAT');

      const npsWidget = wrapper.vm.handleWidgetTypeChoice('nps');
      expect(npsWidget.key).toBe('nps');
      expect(npsWidget.name).toBe('NPS');

      const horizontalBarWidget = wrapper.vm.handleWidgetTypeChoice('custom');
      expect(horizontalBarWidget.key).toBe('custom');
      expect(horizontalBarWidget.name).toBe('Horizontal Bar Chart');
    });
  });

  describe('Available widgets', () => {
    it('should return all available widgets', () => {
      const widgets = wrapper.vm.availableWidgets;
      expect(widgets).toHaveLength(4);
      expect(widgets.map((w) => w.key)).toEqual([
        'csat',
        'nps',
        'custom',
        'sales_funnel',
      ]);
    });
  });
});
