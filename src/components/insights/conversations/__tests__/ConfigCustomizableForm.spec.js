import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import Unnnic from '@weni/unnnic-system';
import { nextTick } from 'vue';
import { createI18n } from 'vue-i18n';

import ConfigCustomizableForm from '../CustomizableWidget/ConfigCustomizableForm.vue';

config.global.plugins = [
  createI18n({
    legacy: false,
  }),
];

vi.stubEnv('CSAT_AGENT_UUID', 'csat-agent-uuid');
vi.stubEnv('NPS_AGENT_UUID', 'nps-agent-uuid');

const createWrapper = (props = {}, storeOverrides = {}) => {
  const store = createTestingPinia({
    initialState: {
      project: {
        isLoadedFlows: false,
        isLoadingFlows: false,
        flows: [
          {
            value: 'flow-1',
            label: 'Flow 1',
            results: [{ value: 'result-1', label: 'Result 1' }],
          },
          {
            value: 'flow-2',
            label: 'Flow 2',
            results: [{ value: 'result-2', label: 'Result 2' }],
          },
        ],
        agentsTeam: {
          manager: null,
          agents: [
            { uuid: 'csat-agent-uuid', name: 'CSAT Agent' },
            { uuid: 'nps-agent-uuid', name: 'NPS Agent' },
          ],
        },
        isLoadingAgentsTeam: false,
        ...storeOverrides,
      },
    },
  });

  return shallowMount(ConfigCustomizableForm, {
    props: {
      type: 'csat',
      isNew: false,
      ...props,
    },
    global: {
      plugins: [store],
      stubs: {
        UnnnicCheckbox: Unnnic.unnnicCheckbox,
        UnnnicSelectSmart: Unnnic.unnnicSelectSmart,
        SelectFlow: true,
        SelectFlowResult: true,
      },
      mocks: {
        $tc: (key) => key,
      },
    },
  });
};

describe('ConfigCustomizableForm', () => {
  let wrapper;

  const configCustomizableFormTitle = () =>
    wrapper.find('[data-testid="config-customizable-form-title"]');
  const configCustomizableFormDescription = () =>
    wrapper.find('[data-testid="config-customizable-form-description"]');
  const configCustomizableFormCheckboxHumanSupport = () =>
    wrapper.findComponent(
      '[data-testid="config-customizable-form-checkbox-human-support"]',
    );
  const configCustomizableFormCheckboxAiSupport = () =>
    wrapper.findComponent(
      '[data-testid="config-customizable-form-checkbox-ai-support"]',
    );
  const configCustomizableFormSectionHumanSupport = () =>
    wrapper.find(
      '[data-testid="config-customizable-form-section-human-support"]',
    );
  const configCustomizableFormSelectFlow = () =>
    wrapper.findComponent(
      '[data-testid="config-customizable-form-select-flow"]',
    );
  const configCustomizableFormSelectFlowResult = () =>
    wrapper.findComponent(
      '[data-testid="config-customizable-form-select-flow-result"]',
    );
  const configCustomizableFormSectionAiSupport = () =>
    wrapper.find('[data-testid="config-customizable-form-section-ai-support"]');
  const configCustomizableFormButtonActivateAgent = () =>
    wrapper.find(
      '[data-testid="config-customizable-form-button-activate-agent"]',
    );
  const configCustomizableFormLabelSelectAgent = () =>
    wrapper.find('[data-testid="config-customizable-form-label-select-agent"]');
  const configCustomizableFormSelectAgent = () =>
    wrapper.findComponent(
      '[data-testid="config-customizable-form-select-agent"]',
    );
  const configCustomizableFormAgentActive = () =>
    wrapper.find('[data-testid="config-customizable-form-agent-active"]');

  describe('Component Initialization', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should render component with correct structure', () => {
      expect(configCustomizableFormTitle().exists()).toBe(true);
      expect(configCustomizableFormDescription().exists()).toBe(true);
      expect(configCustomizableFormCheckboxHumanSupport().exists()).toBe(true);
      expect(configCustomizableFormCheckboxAiSupport().exists()).toBe(true);
      expect(configCustomizableFormSectionHumanSupport().exists()).toBe(false);
      expect(configCustomizableFormSelectFlow().exists()).toBe(false);
      expect(configCustomizableFormSelectFlowResult().exists()).toBe(false);
      expect(configCustomizableFormSectionAiSupport().exists()).toBe(false);
      expect(configCustomizableFormButtonActivateAgent().exists()).toBe(false);
      expect(configCustomizableFormLabelSelectAgent().exists()).toBe(false);
      expect(configCustomizableFormSelectAgent().exists()).toBe(false);
      expect(configCustomizableFormAgentActive().exists()).toBe(false);
    });

    it('should display correct title based on type prop', () => {
      expect(configCustomizableFormTitle().text()).toBe(
        'conversations_dashboard.csat',
      );
    });

    it('should display correct title for NPS type', async () => {
      wrapper = createWrapper({ type: 'nps' });
      expect(configCustomizableFormTitle().text()).toBe(
        'conversations_dashboard.nps',
      );
    });

    it('should display correct description with type interpolation', () => {
      expect(configCustomizableFormDescription().text()).toBe(
        'conversations_dashboard.customize_your_dashboard.config_csat_or_nps_description',
      );
    });
  });

  describe('Human Support Functionality', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should not display flow selection section when humanSupport is false', () => {
      expect(configCustomizableFormSectionHumanSupport().exists()).toBe(false);
    });

    it('should toggle humanSupport when checkbox is changed', async () => {
      await configCustomizableFormCheckboxHumanSupport().vm.$emit(
        'change',
        true,
      );
      expect(wrapper.vm.humanSupport).toBe(true);

      await configCustomizableFormCheckboxHumanSupport().vm.$emit(
        'change',
        false,
      );
      expect(wrapper.vm.humanSupport).toBe(false);
    });

    it('should display flow selection section when humanSupport is true', async () => {
      wrapper.vm.humanSupport = true;
      await nextTick();

      expect(configCustomizableFormSectionHumanSupport().exists()).toBe(true);
    });

    it('should update flow uuid when SelectFlow emits update', async () => {
      wrapper.vm.humanSupport = true;
      await nextTick();

      await configCustomizableFormSelectFlow().vm.$emit(
        'update:modelValue',
        'new-flow-uuid',
      );

      expect(wrapper.vm.flow.uuid).toBe('new-flow-uuid');
    });

    it('should update flow result when SelectFlowResult emits update', async () => {
      wrapper = createWrapper({ isNew: true });
      wrapper.vm.humanSupport = true;
      await nextTick();

      await configCustomizableFormSelectFlowResult().vm.$emit(
        'update:modelValue',
        'new-result',
      );

      expect(wrapper.vm.flow.result).toBe('new-result');
    });

    it('should disable SelectFlowResult when no flow uuid is selected', async () => {
      wrapper.vm.humanSupport = true;
      await nextTick();

      expect(
        configCustomizableFormSelectFlowResult().attributes('disabled'),
      ).toBeDefined();
    });

    it('should enable SelectFlowResult when flow uuid is selected', async () => {
      wrapper.vm.humanSupport = true;
      wrapper.vm.flow.uuid = 'flow-1';
      await nextTick();

      expect(
        configCustomizableFormSelectFlowResult().attributes('disabled'),
      ).toBe('false');
    });
  });

  describe('AI Support Functionality', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should toggle aiSupport when checkbox is changed', async () => {
      await configCustomizableFormCheckboxAiSupport().vm.$emit('change', true);
      expect(wrapper.vm.aiSupport).toBe(true);

      await configCustomizableFormCheckboxAiSupport().vm.$emit('change', false);
      expect(wrapper.vm.aiSupport).toBe(false);
    });

    it('should display activate agent button when aiSupport is true and no agent exists', async () => {
      wrapper = createWrapper({}, { agentsTeam: { agents: [] } });
      wrapper.vm.aiSupport = true;
      await nextTick();

      expect(configCustomizableFormButtonActivateAgent().exists()).toBe(true);
    });

    it('should disable activate button when agents team is loading', async () => {
      wrapper = createWrapper(
        {},
        {
          isLoadingAgentsTeam: true,
          agentsTeam: { agents: [] },
        },
      );
      wrapper.vm.aiSupport = true;
      await nextTick();

      expect(
        configCustomizableFormButtonActivateAgent().attributes('disabled'),
      ).toBeDefined();
    });

    it('should display agent info when agent exists', async () => {
      wrapper.vm.aiSupport = true;
      await nextTick();

      expect(configCustomizableFormSelectAgent().exists()).toBe(true);
      expect(configCustomizableFormAgentActive().exists()).toBe(true);
    });

    it('should display correct agent info for CSAT type', async () => {
      wrapper.vm.aiSupport = true;
      await nextTick();

      expect(configCustomizableFormSelectAgent().props('modelValue')).toEqual([
        { value: 'csat-agent-uuid', label: 'CSAT Agent' },
      ]);
    });
  });

  describe('Agent Activation', () => {
    beforeEach(() => {
      wrapper = createWrapper({}, { agentsTeam: { agents: [] } });
    });

    it('should call handleActivateAgent when activate button is clicked', async () => {
      const activateAgentSpy = vi.spyOn(wrapper.vm, 'handleActivateAgent');

      wrapper.vm.aiSupport = true;
      await nextTick();

      await configCustomizableFormButtonActivateAgent().trigger('click');

      expect(activateAgentSpy).toHaveBeenCalled();
    });

    it('should display loading state on activate button', async () => {
      wrapper.vm.aiSupport = true;
      wrapper.vm.isActivatingAgent = true;
      await nextTick();

      expect(
        configCustomizableFormButtonActivateAgent().attributes('loading'),
      ).toBeDefined();
    });
  });
});
