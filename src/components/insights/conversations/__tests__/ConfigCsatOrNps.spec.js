import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import Unnnic from '@weni/unnnic-system';
import { nextTick } from 'vue';
import { createI18n } from 'vue-i18n';

import ConfigCsatOrNps from '../ConfigCsatOrNps.vue';

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

  return shallowMount(ConfigCsatOrNps, {
    props: {
      type: 'csat',
      ...props,
    },
    global: {
      plugins: [store],
      stubs: {
        UnnnicCheckbox: Unnnic.unnnicCheckbox,
        UnnnicSelectSmart: Unnnic.unnnicSelectSmart,
      },
    },
  });
};

describe('ConfigCsatOrNps', () => {
  let wrapper;

  const configCsatOrNpsTitle = () =>
    wrapper.find('[data-testid="config-csat-or-nps-title"]');
  const configCsatOrNpsDescription = () =>
    wrapper.find('[data-testid="config-csat-or-nps-description"]');
  const configCsatOrNpsCheckboxHumanSupport = () =>
    wrapper.findComponent(
      '[data-testid="config-csat-or-nps-checkbox-human-support"]',
    );
  const configCsatOrNpsCheckboxAiSupport = () =>
    wrapper.findComponent(
      '[data-testid="config-csat-or-nps-checkbox-ai-support"]',
    );
  const configCsatOrNpsSectionHumanSupport = () =>
    wrapper.find('[data-testid="config-csat-or-nps-section-human-support"]');
  const configCsatOrNpsSelectFlow = () =>
    wrapper.findComponent('[data-testid="config-csat-or-nps-select-flow"]');
  const configCsatOrNpsSelectFlowResult = () =>
    wrapper.findComponent(
      '[data-testid="config-csat-or-nps-select-flow-result"]',
    );
  const configCsatOrNpsSectionAiSupport = () =>
    wrapper.find('[data-testid="config-csat-or-nps-section-ai-support"]');
  const configCsatOrNpsButtonActivateAgent = () =>
    wrapper.find('[data-testid="config-csat-or-nps-button-activate-agent"]');
  const configCsatOrNpsLabelSelectAgent = () =>
    wrapper.find('[data-testid="config-csat-or-nps-label-select-agent"]');
  const configCsatOrNpsSelectAgent = () =>
    wrapper.findComponent('[data-testid="config-csat-or-nps-select-agent"]');
  const configCsatOrNpsAgentActive = () =>
    wrapper.find('[data-testid="config-csat-or-nps-agent-active"]');

  describe('Component Initialization', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should render component with correct structure', () => {
      expect(configCsatOrNpsTitle().exists()).toBe(true);
      expect(configCsatOrNpsDescription().exists()).toBe(true);
      expect(configCsatOrNpsCheckboxHumanSupport().exists()).toBe(true);
      expect(configCsatOrNpsCheckboxAiSupport().exists()).toBe(true);
      expect(configCsatOrNpsSectionHumanSupport().exists()).toBe(false);
      expect(configCsatOrNpsSelectFlow().exists()).toBe(false);
      expect(configCsatOrNpsSelectFlowResult().exists()).toBe(false);
      expect(configCsatOrNpsSectionAiSupport().exists()).toBe(false);
      expect(configCsatOrNpsButtonActivateAgent().exists()).toBe(false);
      expect(configCsatOrNpsLabelSelectAgent().exists()).toBe(false);
      expect(configCsatOrNpsSelectAgent().exists()).toBe(false);
      expect(configCsatOrNpsAgentActive().exists()).toBe(false);
    });

    it('should display correct title based on type prop', () => {
      expect(configCsatOrNpsTitle().text()).toBe(
        'conversations_dashboard.csat',
      );
    });

    it('should display correct title for NPS type', async () => {
      wrapper = createWrapper({ type: 'nps' });
      expect(configCsatOrNpsTitle().text()).toBe('conversations_dashboard.nps');
    });

    it('should display correct description with type interpolation', () => {
      expect(configCsatOrNpsDescription().text()).toBe(
        'conversations_dashboard.customize_your_dashboard.config_csat_or_nps_description',
      );
    });
  });

  describe('Human Support Functionality', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should not display flow selection section when humanSupport is false', () => {
      expect(configCsatOrNpsSectionHumanSupport().exists()).toBe(false);
    });

    it('should toggle humanSupport when checkbox is changed', async () => {
      await configCsatOrNpsCheckboxHumanSupport().vm.$emit('change', true);
      expect(wrapper.vm.humanSupport).toBe(true);

      await configCsatOrNpsCheckboxHumanSupport().vm.$emit('change', false);
      expect(wrapper.vm.humanSupport).toBe(false);
    });

    it('should display flow selection section when humanSupport is true', async () => {
      wrapper.vm.humanSupport = true;
      await nextTick();

      expect(configCsatOrNpsSectionHumanSupport().exists()).toBe(true);
    });

    it('should update flow uuid when SelectFlow emits update', async () => {
      wrapper.vm.humanSupport = true;
      await nextTick();

      await configCsatOrNpsSelectFlow().vm.$emit(
        'update:modelValue',
        'new-flow-uuid',
      );

      expect(wrapper.vm.flow.uuid).toBe('new-flow-uuid');
    });

    it('should update flow result when SelectFlowResult emits update', async () => {
      wrapper.vm.humanSupport = true;
      await nextTick();

      await configCsatOrNpsSelectFlowResult().vm.$emit(
        'update:modelValue',
        'new-result',
      );

      expect(wrapper.vm.flow.result).toBe('new-result');
    });

    it('should disable SelectFlowResult when no flow uuid is selected', async () => {
      wrapper.vm.humanSupport = true;
      await nextTick();

      expect(configCsatOrNpsSelectFlowResult().attributes('disabled')).toBe(
        'true',
      );
    });

    it('should enable SelectFlowResult when flow uuid is selected', async () => {
      wrapper.vm.humanSupport = true;
      wrapper.vm.flow.uuid = 'flow-1';
      await nextTick();

      expect(configCsatOrNpsSelectFlowResult().attributes('disabled')).toBe(
        'false',
      );
    });
  });

  describe('AI Support Functionality', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should toggle aiSupport when checkbox is changed', async () => {
      await configCsatOrNpsCheckboxAiSupport().vm.$emit('change', true);
      expect(wrapper.vm.aiSupport).toBe(true);

      await configCsatOrNpsCheckboxAiSupport().vm.$emit('change', false);
      expect(wrapper.vm.aiSupport).toBe(false);
    });

    it('should display activate agent button when aiSupport is true and no agent exists', async () => {
      wrapper = createWrapper({}, { agentsTeam: { agents: [] } });
      wrapper.vm.aiSupport = true;
      await nextTick();

      expect(configCsatOrNpsButtonActivateAgent().exists()).toBe(true);
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

      expect(configCsatOrNpsButtonActivateAgent().attributes('disabled')).toBe(
        'true',
      );
    });

    it('should display agent info when agent exists', async () => {
      wrapper.vm.aiSupport = true;
      await nextTick();

      expect(configCsatOrNpsSelectAgent().exists()).toBe(true);
      expect(configCsatOrNpsAgentActive().exists()).toBe(true);
    });

    it('should display correct agent info for CSAT type', async () => {
      wrapper.vm.aiSupport = true;
      await nextTick();

      console.log('configCsatOrNpsSelectAgent', wrapper.html());

      expect(configCsatOrNpsSelectAgent().props('modelValue')).toEqual([
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

      await configCsatOrNpsButtonActivateAgent().trigger('click');

      expect(activateAgentSpy).toHaveBeenCalled();
    });

    it('should display loading state on activate button', async () => {
      wrapper.vm.aiSupport = true;
      wrapper.vm.isActivatingAgent = true;
      await nextTick();

      expect(configCsatOrNpsButtonActivateAgent().attributes('loading')).toBe(
        'true',
      );
    });
  });
});
