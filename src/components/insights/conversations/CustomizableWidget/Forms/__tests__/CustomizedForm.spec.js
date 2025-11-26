import { beforeEach, describe, expect, it } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createI18n } from 'vue-i18n';

import CustomizedForm from '../CustomizedForm.vue';
import { useCustomizedWidgetForm } from '@/store/modules/conversational/customizedForm';
import { useCustomWidgets } from '@/store/modules/conversational/customWidgets';

config.global.plugins = [
  createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: { conversations_dashboard: { customize_your_dashboard: {} } },
    },
    fallbackWarn: false,
    missingWarn: false,
  }),
];

const factory = ({
  isNewDrawerCustomizable = false,
  customizedFormOverrides = {},
  agents = [{ uuid: 'agent-1', name: 'Agent 1' }],
  projectOverrides = {},
} = {}) => {
  const pinia = createTestingPinia({
    stubActions: false,
    initialState: {
      project: {
        agentsTeam: { manager: null, agents },
        isLoadingAgentsTeam: false,
        ...projectOverrides,
      },
      conversational: {
        isDrawerCustomizableOpen: true,
        drawerWidgetType: 'custom',
        isNewDrawerCustomizable,
      },
      conversationalCustomizedForm: {
        customizedForm: {
          widgetName: '',
          agentUuid: 'agent-1',
          agentName: '',
          key: '',
          ...customizedFormOverrides,
        },
      },
      customWidgets: {
        customForm: {
          agent_uuid: '',
          agent_name: '',
          key: '',
          widget_uuid: '',
          widget_name: '',
        },
      },
    },
  });

  return mount(CustomizedForm, {
    global: {
      plugins: [pinia],
      stubs: {
        UnnnicLabel: true,
        UnnnicInput: true,
        UnnnicSelectSmart: true,
      },
      mocks: {
        $t: (key) => key,
      },
    },
  });
};

describe('CustomizedForm.vue', () => {
  let wrapper;

  const findWidgetNameInput = () =>
    wrapper.find('[data-testid="customized-form-input-widget-name"]');
  const findKeyInput = () =>
    wrapper.find('[data-testid="customized-form-input-key"]');
  const findAgentSelect = () =>
    wrapper.findComponent('[data-testid="customized-form-select-agent"]');

  beforeEach(() => {
    wrapper = factory();
  });

  describe('Component structure', () => {
    it('renders main sections and inputs', () => {
      expect(
        wrapper.find('[data-testid="customized-form-description"]').exists(),
      ).toBe(true);
      expect(
        wrapper
          .find('[data-testid="customized-form-label-widget-name"]')
          .exists(),
      ).toBe(true);
      expect(findWidgetNameInput().exists()).toBe(true);
      expect(
        wrapper
          .find('[data-testid="customized-form-label-select-agent"]')
          .exists(),
      ).toBe(true);
      expect(findAgentSelect().exists()).toBe(true);
      expect(findKeyInput().exists()).toBe(true);
    });
  });

  describe('Initialization behavior', () => {
    it('syncs agent from project when editing existing widget', () => {
      wrapper = factory({
        isNewDrawerCustomizable: false,
        customizedFormOverrides: { agentUuid: 'agent-1', agentName: '' },
      });

      const formsStore = useCustomizedWidgetForm();
      const customWidgets = useCustomWidgets();

      expect(formsStore.customizedForm.agentName).toBe('Agent 1');
      expect(customWidgets.customForm.agent_name).toBe('Agent 1');
    });

    it('does not sync agent when creating a new widget', () => {
      wrapper = factory({
        isNewDrawerCustomizable: true,
        customizedFormOverrides: { agentUuid: 'agent-1', agentName: '' },
      });

      const formsStore = useCustomizedWidgetForm();
      expect(formsStore.customizedForm.agentName).toBe('');
    });
  });

  describe('Interactions', () => {
    it('updates agent on select change', async () => {
      const formsStore = useCustomizedWidgetForm();
      const customWidgets = useCustomWidgets();

      await findAgentSelect().vm.$emit('update:modelValue', [
        { value: 'agent-2', label: 'Agent 2' },
      ]);

      expect(formsStore.customizedForm.agentUuid).toBe('agent-2');
      expect(formsStore.customizedForm.agentName).toBe('Agent 2');
      expect(customWidgets.customForm.agent_uuid).toBe('agent-2');
      expect(customWidgets.customForm.agent_name).toBe('Agent 2');
    });

    it('updates widget name and key and syncs with customWidgets store', async () => {
      const formsStore = useCustomizedWidgetForm();
      const customWidgets = useCustomWidgets();

      const inputs = wrapper.findAllComponents({ name: 'UnnnicInput' });

      await inputs[0].vm.$emit('update:modelValue', 'New Widget Name');
      await inputs[1].vm.$emit('update:modelValue', 'new-key');

      expect(formsStore.customizedForm.widgetName).toBe('New Widget Name');
      expect(formsStore.customizedForm.key).toBe('new-key');
      expect(customWidgets.customForm.widget_name).toBe('New Widget Name');
      expect(customWidgets.customForm.key).toBe('new-key');
    });

    it('uses isLoadingAgentsTeam to control select loading state', () => {
      const projectOverrides = {
        agentsTeam: { manager: null, agents: [] },
        isLoadingAgentsTeam: true,
      };
      wrapper = factory({
        customizedFormOverrides: {},
        agents: [],
        projectOverrides,
      });

      expect(findAgentSelect().attributes('isloading')).toBe('true');
    });
  });
});
