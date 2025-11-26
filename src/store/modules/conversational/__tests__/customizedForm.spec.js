import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { useCustomizedWidgetForm } from '../customizedForm';

let customWidgetsStoreMock;

const createCustomWidgetsStoreMock = () => ({
  customForm: {
    agent_uuid: '',
    agent_name: '',
    key: '',
    widget_uuid: '',
    widget_name: '',
  },
  setCustomFormAgent: vi.fn(function (uuid, name) {
    this.customForm.agent_uuid = uuid;
    this.customForm.agent_name = name;
  }),
  setCustomFormKey: vi.fn(function (key) {
    this.customForm.key = key;
  }),
  setCustomFormWidgetName: vi.fn(function (name) {
    this.customForm.widget_name = name;
  }),
});

vi.mock('@/store/modules/conversational/customWidgets', () => ({
  useCustomWidgets: () => customWidgetsStoreMock,
}));

describe('useCustomizedWidgetForm store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    customWidgetsStoreMock = createCustomWidgetsStoreMock();
  });

  it('initializes with default state', () => {
    const store = useCustomizedWidgetForm();
    expect(store.customizedForm).toEqual({
      widgetName: '',
      agentUuid: '',
      agentName: '',
      key: '',
    });
  });

  it('sets, resets and syncs customized form data', () => {
    const store = useCustomizedWidgetForm();

    store.setCustomizedForm({
      widgetName: 'Name',
      agentUuid: 'uuid',
      agentName: 'Agent',
      key: 'k',
    });

    expect(store.customizedForm.widgetName).toBe('Name');

    store.resetCustomizedForm();
    expect(store.customizedForm).toEqual({
      widgetName: '',
      agentUuid: '',
      agentName: '',
      key: '',
    });
  });

  it('setCustomFormAgent updates local state and customWidgets store', () => {
    const store = useCustomizedWidgetForm();

    store.setCustomFormAgent('agent-1', 'Agent 1');

    expect(store.customizedForm.agentUuid).toBe('agent-1');
    expect(store.customizedForm.agentName).toBe('Agent 1');
    expect(customWidgetsStoreMock.customForm.agent_uuid).toBe('agent-1');
    expect(customWidgetsStoreMock.customForm.agent_name).toBe('Agent 1');
  });

  it('loadFromCustomWidget reads from customWidgets.customForm', () => {
    const store = useCustomizedWidgetForm();
    customWidgetsStoreMock.customForm = {
      agent_uuid: 'a1',
      agent_name: 'Agent 1',
      key: 'k1',
      widget_uuid: 'w1',
      widget_name: 'Widget 1',
    };

    store.loadFromCustomWidget();

    expect(store.customizedForm).toEqual({
      widgetName: 'Widget 1',
      agentUuid: 'a1',
      agentName: 'Agent 1',
      key: 'k1',
    });
  });
});
