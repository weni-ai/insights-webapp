import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import Unnnic from '@weni/unnnic-system';
import { nextTick } from 'vue';
import { createI18n } from 'vue-i18n';

import SentimentAnalysisForm from '../SentimentAnalysisForm.vue';
import { useSentimentAnalysisForm } from '@/store/modules/conversational/sentimentForm';

import Projects from '@/services/api/resources/projects';
import NexusApi from '@/services/api/resources/nexus';

config.global.plugins = [
  createI18n({
    legacy: false,
  }),
];

vi.stubEnv('CSAT_AGENT_UUID', 'csat-agent-uuid');
vi.stubEnv('NPS_AGENT_UUID', 'nps-agent-uuid');

vi.mock('@/services/api/resources/projects');
vi.mock('@/services/api/resources/nexus');

const createWrapper = (props = {}, storeOverrides = {}) => {
  Projects.getProjectSource.mockResolvedValue([]);
  NexusApi.getAgentsTeam.mockResolvedValue({
    manager: null,
    agents: [
      { uuid: 'csat-agent-uuid', name: 'CSAT Agent' },
      { uuid: 'nps-agent-uuid', name: 'NPS Agent' },
    ],
  });
  NexusApi.activateAgent.mockResolvedValue({});

  const store = createTestingPinia({
    stubActions: false,
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
      conversationalForms: {
        sentimentForm: {
          humanSupport: false,
          aiSupport: false,
          flow: {
            uuid: null,
            result: null,
          },
          agentUuid: null,
        },
      },
    },
  });

  return shallowMount(SentimentAnalysisForm, {
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
        UnnnicButton: Unnnic.unnnicButton,
        UnnnicLabel: Unnnic.unnnicLabel,
        SelectFlow: true,
        SelectFlowResult: true,
      },
      mocks: {
        $t: (key) => key,
      },
    },
  });
};

describe('SentimentAnalysisForm', () => {
  let wrapper;
  let formsStore;

  const sentimentAnalysisFormCheckboxHumanSupport = () =>
    wrapper.findComponent(
      '[data-testid="sentiment-analysis-form-checkbox-human-support"]',
    );
  const sentimentAnalysisFormCheckboxAiSupport = () =>
    wrapper.findComponent(
      '[data-testid="sentiment-analysis-form-checkbox-ai-support"]',
    );
  const sentimentAnalysisFormSectionHumanSupport = () =>
    wrapper.find(
      '[data-testid="sentiment-analysis-form-section-human-support"]',
    );
  const sentimentAnalysisFormSelectFlow = () =>
    wrapper.findComponent(
      '[data-testid="sentiment-analysis-form-select-flow"]',
    );
  const sentimentAnalysisFormSelectFlowResult = () =>
    wrapper.findComponent(
      '[data-testid="sentiment-analysis-form-select-flow-result"]',
    );
  const sentimentAnalysisFormSectionAiSupport = () =>
    wrapper.find('[data-testid="sentiment-analysis-form-section-ai-support"]');
  const sentimentAnalysisFormButtonActivateAgent = () =>
    wrapper.findComponent(
      '[data-testid="sentiment-analysis-form-button-activate-agent"]',
    );
  const sentimentAnalysisFormLabelSelectAgent = () =>
    wrapper.find('[data-testid="sentiment-analysis-form-label-select-agent"]');
  const sentimentAnalysisFormSelectAgent = () =>
    wrapper.findComponent(
      '[data-testid="sentiment-analysis-form-select-agent"]',
    );
  const sentimentAnalysisFormAgentActive = () =>
    wrapper.find('[data-testid="sentiment-analysis-form-agent-active"]');

  describe('Component Initialization', () => {
    beforeEach(() => {
      wrapper = createWrapper();
      formsStore = useSentimentAnalysisForm();
    });

    it('should render component with correct structure', () => {
      expect(sentimentAnalysisFormCheckboxHumanSupport().exists()).toBe(true);
      expect(sentimentAnalysisFormCheckboxAiSupport().exists()).toBe(true);
      expect(sentimentAnalysisFormSectionHumanSupport().exists()).toBe(false);
      expect(sentimentAnalysisFormSelectFlow().exists()).toBe(false);
      expect(sentimentAnalysisFormSelectFlowResult().exists()).toBe(false);
      expect(sentimentAnalysisFormSectionAiSupport().exists()).toBe(false);
      expect(sentimentAnalysisFormButtonActivateAgent().exists()).toBe(false);
      expect(sentimentAnalysisFormLabelSelectAgent().exists()).toBe(false);
      expect(sentimentAnalysisFormSelectAgent().exists()).toBe(false);
      expect(sentimentAnalysisFormAgentActive().exists()).toBe(false);
    });
  });

  describe('Human Support Functionality', () => {
    beforeEach(() => {
      wrapper = createWrapper();
      formsStore = useSentimentAnalysisForm();
    });

    it('should not display flow selection section when humanSupport is false', () => {
      expect(sentimentAnalysisFormSectionHumanSupport().exists()).toBe(false);
    });

    it('should toggle humanSupport when checkbox is changed', async () => {
      await sentimentAnalysisFormCheckboxHumanSupport().vm.$emit(
        'change',
        true,
      );
      expect(formsStore.sentimentForm.humanSupport).toBe(true);

      await sentimentAnalysisFormCheckboxHumanSupport().vm.$emit(
        'change',
        false,
      );
      expect(formsStore.sentimentForm.humanSupport).toBe(false);
    });

    it('should display flow selection section when humanSupport is true', async () => {
      formsStore.setSentimentForm({ humanSupport: true });
      await nextTick();

      expect(sentimentAnalysisFormSectionHumanSupport().exists()).toBe(true);
    });

    it('should update flow uuid when SelectFlow emits update', async () => {
      formsStore.setSentimentForm({ humanSupport: true });
      await nextTick();

      await sentimentAnalysisFormSelectFlow().vm.$emit(
        'update:modelValue',
        'new-flow-uuid',
      );

      expect(formsStore.sentimentForm.flow.uuid).toBe('new-flow-uuid');
    });

    it('should update flow result when SelectFlowResult emits update', async () => {
      wrapper = createWrapper({ isNew: true });
      formsStore = useSentimentAnalysisForm();
      formsStore.setSentimentForm({ humanSupport: true });
      await nextTick();

      await sentimentAnalysisFormSelectFlowResult().vm.$emit(
        'update:modelValue',
        'new-result',
      );

      expect(formsStore.sentimentForm.flow.result).toBe('new-result');
    });

    it('should disable SelectFlowResult when no flow uuid is selected', async () => {
      formsStore.setSentimentForm({ humanSupport: true });
      await nextTick();

      expect(
        sentimentAnalysisFormSelectFlowResult().attributes('disabled'),
      ).toBeDefined();
    });

    it('should enable SelectFlowResult when flow uuid is selected', async () => {
      formsStore.setSentimentForm({
        humanSupport: true,
        flow: { uuid: 'flow-1' },
      });
      await nextTick();

      expect(
        sentimentAnalysisFormSelectFlowResult().attributes('disabled'),
      ).toBe('false');
    });
  });

  describe('AI Support Functionality', () => {
    beforeEach(() => {
      wrapper = createWrapper();
      formsStore = useSentimentAnalysisForm();
    });

    it('should toggle aiSupport when checkbox is changed', async () => {
      await sentimentAnalysisFormCheckboxAiSupport().vm.$emit('change', true);
      expect(formsStore.sentimentForm.aiSupport).toBe(true);

      await sentimentAnalysisFormCheckboxAiSupport().vm.$emit('change', false);
      expect(formsStore.sentimentForm.aiSupport).toBe(false);
    });

    it('should display activate agent button when aiSupport is true and no agent exists', async () => {
      wrapper = createWrapper({}, { agentsTeam: { agents: [] } });
      formsStore = useSentimentAnalysisForm();
      formsStore.setSentimentForm({ aiSupport: true });
      await nextTick();

      expect(sentimentAnalysisFormButtonActivateAgent().exists()).toBe(true);
    });

    it('should disable activate button when agents team is loading', async () => {
      wrapper = createWrapper(
        {},
        {
          isLoadingAgentsTeam: true,
          agentsTeam: { agents: [] },
        },
      );
      formsStore = useSentimentAnalysisForm();
      formsStore.setSentimentForm({ aiSupport: true });
      await nextTick();

      expect(
        sentimentAnalysisFormButtonActivateAgent().attributes('disabled'),
      ).toBeDefined();
    });

    it('should display agent info when agent exists', async () => {
      formsStore.setSentimentForm({ aiSupport: true });
      await nextTick();

      expect(sentimentAnalysisFormSelectAgent().exists()).toBe(true);
      expect(sentimentAnalysisFormAgentActive().exists()).toBe(true);
    });

    it('should display correct agent info for CSAT type', async () => {
      formsStore.setSentimentForm({ aiSupport: true });
      await nextTick();

      expect(sentimentAnalysisFormSelectAgent().props('modelValue')).toEqual([
        { value: 'csat-agent-uuid', label: 'CSAT Agent' },
      ]);
    });
  });
});
