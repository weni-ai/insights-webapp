import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { useSentimentAnalysisForm } from '../sentimentForm';
import { useCustomizedWidgetForm } from '../customizedForm';
import { useConversationalWidgets } from '../widgets';

let customWidgetsStoreMock;
let projectStoreMock;

const createCustomWidgetsStoreMock = () => ({
  customForm: {
    agent_uuid: '',
    agent_name: '',
    key: '',
    widget_uuid: '',
    widget_name: '',
  },
  setCustomFormAgent: vi.fn(),
  setCustomFormKey: vi.fn(),
  setCustomFormWidgetName: vi.fn(),
});

const createProjectStoreMock = () => ({
  activateAgent: vi.fn(() => Promise.resolve()),
  getAgentsTeam: vi.fn(() => Promise.resolve()),
});

vi.mock('@/store/modules/conversational/customWidgets', () => ({
  useCustomWidgets: () => customWidgetsStoreMock,
}));

vi.mock('@/store/modules/project', () => ({
  useProject: () => projectStoreMock,
}));

vi.mock('@/utils/env', () => ({
  default: vi.fn((key) =>
    key === 'CSAT_AGENT_UUID'
      ? 'csat-agent-uuid'
      : key === 'NPS_AGENT_UUID'
        ? 'nps-agent-uuid'
        : key,
  ),
}));

describe('useSentimentAnalysisForm store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    customWidgetsStoreMock = createCustomWidgetsStoreMock();
    projectStoreMock = createProjectStoreMock();
  });

  const setupSentimentStore = () => {
    const store = useSentimentAnalysisForm();
    return { store };
  };

  it('initializes with default state', () => {
    const { store } = setupSentimentStore();
    expect(store.sentimentForm).toEqual({
      humanSupport: false,
      aiSupport: false,
      flow: { uuid: null, result: null },
      agentUuid: null,
    });
  });

  it('setSentimentForm merges data', () => {
    const { store } = setupSentimentStore();
    store.setSentimentForm({
      humanSupport: true,
      flow: { uuid: 'f1', result: null },
    });

    expect(store.sentimentForm.humanSupport).toBe(true);
    expect(store.sentimentForm.flow.uuid).toBe('f1');
  });

  it('setHumanSupport and setAiSupport update flags and widget store', () => {
    const { store } = setupSentimentStore();
    const widgetsStore = useConversationalWidgets();
    const spyHuman = vi.spyOn(widgetsStore, 'setIsFormHuman');
    const spyAi = vi.spyOn(widgetsStore, 'setIsFormAi');

    store.setHumanSupport(true);
    expect(store.sentimentForm.humanSupport).toBe(true);
    expect(spyHuman).toHaveBeenCalledWith(true);

    store.setAiSupport(true);
    expect(store.sentimentForm.aiSupport).toBe(true);
    expect(spyAi).toHaveBeenCalledWith(true);
  });

  it('initializeForm with type add resets both forms', () => {
    const { store } = setupSentimentStore();
    const customizedStore = useCustomizedWidgetForm();

    store.setSentimentForm({
      humanSupport: true,
      aiSupport: true,
      flow: { uuid: 'f1', result: 'r1' },
      agentUuid: 'a1',
    });
    customizedStore.setCustomizedForm({
      widgetName: 'W',
      agentUuid: 'u',
      agentName: 'N',
      key: 'k',
    });

    store.initializeForm('add', true);

    expect(store.sentimentForm).toEqual({
      humanSupport: false,
      aiSupport: false,
      flow: { uuid: null, result: null },
      agentUuid: null,
    });
    expect(customizedStore.customizedForm).toEqual({
      widgetName: '',
      agentUuid: '',
      agentName: '',
      key: '',
    });
  });

  it('initializeForm for existing csat loads widget data into sentimentForm', () => {
    const { store } = setupSentimentStore();
    const widgetsStore = useConversationalWidgets();
    widgetsStore.csatWidget = {
      uuid: 'w1',
      config: {
        filter: { flow: 'flow-1' },
        op_field: 'result-1',
        datalake_config: { agent_uuid: 'agent-1' },
      },
    };

    store.initializeForm('csat', false, 'w1');

    expect(store.sentimentForm.humanSupport).toBe(true);
    expect(store.sentimentForm.aiSupport).toBe(true);
    expect(widgetsStore.isFormHuman).toBe(true);
    expect(widgetsStore.isFormAi).toBe(true);
    expect(store.sentimentForm.flow).toEqual({
      uuid: 'flow-1',
      result: 'result-1',
    });
    expect(store.sentimentForm.agentUuid).toBe('agent-1');
  });

  it('setAgent updates form and widget config for csat', () => {
    const { store } = setupSentimentStore();
    const widgetsStore = useConversationalWidgets();

    store.editingContext.type = 'csat';
    store.editingContext.isNew = false;
    widgetsStore.csatWidget = {
      uuid: 'w1',
      config: {},
    };

    store.setAgent('any-agent', 'Agent Name');

    expect(store.sentimentForm.agentUuid).toBe('any-agent');
    expect(widgetsStore.csatWidget.config.datalake_config).toEqual({
      type: 'CSAT',
      agent_uuid: 'csat-agent-uuid',
    });
  });

  it('setFlow and setFlowResult update widget and form for existing csat', () => {
    const { store } = setupSentimentStore();
    const widgetsStore = useConversationalWidgets();

    store.editingContext.type = 'csat';
    store.editingContext.isNew = false;
    widgetsStore.csatWidget = {
      uuid: 'w1',
      config: {},
    };

    store.setFlow('flow-1');
    expect(store.sentimentForm.flow.uuid).toBe('flow-1');
    expect(widgetsStore.csatWidget.config.filter).toEqual({
      flow: 'flow-1',
    });
    expect(widgetsStore.csatWidget.config.op_field).toBe('');

    store.setFlowResult('result-1');
    expect(store.sentimentForm.flow.result).toBe('result-1');
    expect(widgetsStore.csatWidget.config.op_field).toBe('result-1');
  });

  it('setFlow and setFlowResult create new widget when isNew', () => {
    const { store } = setupSentimentStore();
    const widgetsStore = useConversationalWidgets();

    store.editingContext.type = 'nps';
    store.editingContext.isNew = true;

    store.setFlow('flow-1');
    expect(widgetsStore.newWidget.config.filter.flow).toBe('flow-1');

    store.setFlowResult('result-1');
    expect(widgetsStore.newWidget.config.op_field).toBe('result-1');
  });

  it('activateAgent calls project actions and toggles loading flag', async () => {
    const { store } = setupSentimentStore();

    await store.activateAgent('csat');

    expect(store.isActivatingAgent).toBe(false);
    expect(projectStoreMock.activateAgent).toHaveBeenCalledWith(
      'csat-agent-uuid',
    );
    expect(projectStoreMock.getAgentsTeam).toHaveBeenCalled();
  });
});
