import { defineStore, storeToRefs } from 'pinia';
import { reactive, ref } from 'vue';

import { useProject } from '@/store/modules/project';
import { useConversationalWidgets } from '@/store/modules/conversational/widgets';
import { useCustomizedWidgetForm } from './customizedForm';
import { CsatOrNpsCardConfig, WidgetType } from '@/models/types/WidgetTypes';
import env from '@/utils/env';

type SentimentType = 'csat' | 'nps';

interface SentimentForm {
  humanSupport: boolean;
  aiSupport: boolean;
  flow: {
    uuid: string | null;
    result: string | null;
  };
  agentUuid: string | null;
}

interface EditingContext {
  type: string;
  isNew: boolean;
  uuid: string;
}

export const useSentimentAnalysisForm = defineStore(
  'conversationalSentimentForm',
  () => {
    const sentimentForm = reactive<SentimentForm>({
      humanSupport: false,
      aiSupport: false,
      flow: {
        uuid: null,
        result: null,
      },
      agentUuid: null,
    });

    const editingContext = reactive<EditingContext>({
      type: '',
      isNew: true,
      uuid: '',
    });

    const isActivatingAgent = ref(false);

    function setSentimentForm(data: Partial<SentimentForm>) {
      Object.assign(sentimentForm, data);
    }

    function resetSentimentForm() {
      sentimentForm.humanSupport = false;
      sentimentForm.aiSupport = false;
      sentimentForm.flow.uuid = null;
      sentimentForm.flow.result = null;
      sentimentForm.agentUuid = null;
    }

    function setEditingContext(type: string, isNew: boolean, uuid = '') {
      editingContext.type = type;
      editingContext.isNew = isNew;
      editingContext.uuid = uuid;
    }

    async function activateAgent(type: SentimentType) {
      const projectStore = useProject();
      const { activateAgent, getAgentsTeam } = projectStore;

      isActivatingAgent.value = true;
      await activateAgent(
        type === 'csat' ? env('CSAT_AGENT_UUID') : env('NPS_AGENT_UUID'),
      );

      await getAgentsTeam();
      isActivatingAgent.value = false;
    }

    function setAgent(uuid: string, _name: string) {
      setSentimentForm({ agentUuid: uuid });

      const { type, isNew } = editingContext;

      if (type !== 'csat' && type !== 'nps') {
        return;
      }

      const sentimentType = type as SentimentType;
      const conversationalWidgets = useConversationalWidgets();
      const { setNewWidget, setCsatWidget, setNpsWidget } =
        conversationalWidgets;

      const envUuid =
        sentimentType === 'csat'
          ? env('CSAT_AGENT_UUID')
          : env('NPS_AGENT_UUID');

      const datalakeConfig = {
        type: sentimentType.toUpperCase(),
        agent_uuid: envUuid,
      };

      const currentWidget = getWorkingWidget(sentimentType, isNew);

      if (!currentWidget) {
        return;
      }

      if (isNew) {
        const widget = currentWidget as WidgetType;
        (widget.config as CsatOrNpsCardConfig).datalake_config = datalakeConfig;
        setNewWidget(widget);
      } else {
        const data: WidgetType = {
          ...currentWidget,
          config: {
            ...(currentWidget.config as CsatOrNpsCardConfig),
            datalake_config: datalakeConfig,
          },
        };

        if (type === 'csat') {
          setCsatWidget(data);
        } else {
          setNpsWidget(data);
        }
      }
    }

    function setFlow(uuid: string) {
      setSentimentForm({
        flow: { ...sentimentForm.flow, uuid },
      });

      const { type, isNew } = editingContext;

      if (type !== 'csat' && type !== 'nps') {
        return;
      }

      const sentimentType = type as SentimentType;
      const conversationalWidgets = useConversationalWidgets();
      const { setNewWidget, setCsatWidget, setNpsWidget } =
        conversationalWidgets;
      const currentWidget = getWorkingWidget(sentimentType, isNew);

      if (!currentWidget) {
        return;
      }

      if (isNew) {
        (currentWidget.config as CsatOrNpsCardConfig).filter = {
          ...(currentWidget.config as CsatOrNpsCardConfig).filter,
          flow: uuid,
        };
        setNewWidget(currentWidget);
      } else {
        const data: WidgetType = {
          ...currentWidget,
          config: {
            ...(currentWidget.config as CsatOrNpsCardConfig),
            filter: { flow: uuid },
            op_field: '',
          },
        };

        if (sentimentType === 'csat') {
          setCsatWidget(data);
        } else {
          setNpsWidget(data);
        }
      }
    }

    function setFlowResult(result: string) {
      setSentimentForm({
        flow: { ...sentimentForm.flow, result },
      });

      const { type, isNew } = editingContext;

      if (type !== 'csat' && type !== 'nps') {
        return;
      }

      const sentimentType = type as SentimentType;
      const conversationalWidgets = useConversationalWidgets();
      const { setNewWidget, setCsatWidget, setNpsWidget } =
        conversationalWidgets;
      const currentWidget = getWorkingWidget(sentimentType, isNew);

      if (!currentWidget) {
        return;
      }

      if (isNew) {
        (currentWidget.config as CsatOrNpsCardConfig).op_field = result;
        setNewWidget(currentWidget);
      } else {
        const data: WidgetType = {
          ...currentWidget,
          config: {
            ...(currentWidget.config as CsatOrNpsCardConfig),
            op_field: result,
          },
        };

        if (sentimentType === 'csat') {
          setCsatWidget(data);
        } else {
          setNpsWidget(data);
        }
      }
    }

    function getWorkingWidget(
      type: SentimentType,
      isNew: boolean,
    ): WidgetType | null {
      const conversationalWidgets = useConversationalWidgets();
      const { newWidget, csatWidget, npsWidget } = storeToRefs(
        conversationalWidgets,
      );

      let currentWidget: WidgetType | null = null;

      if (isNew) {
        currentWidget = (newWidget.value as WidgetType) || null;
      } else if (type === 'csat') {
        currentWidget =
          (csatWidget.value as WidgetType | null) ||
          (conversationalWidgets.currentCsatWidget as WidgetType | null);
      } else {
        currentWidget =
          (npsWidget.value as WidgetType | null) ||
          (conversationalWidgets.currentNpsWidget as WidgetType | null);
      }

      if (isNew && !currentWidget) {
        currentWidget = initializeNewWidget(type);
      }

      return currentWidget;
    }

    function initializeNewWidget(type: SentimentType): WidgetType {
      const conversationalWidgets = useConversationalWidgets();
      const { setNewWidget } = conversationalWidgets;
      const newWidget = {
        uuid: '',
        name: '',
        type: 'flow_result',
        config: {
          filter: {
            flow: null,
          },
          op_field: null,
          type: 'flow_result',
          operation: 'recurrence',
          datalake_config: {
            type: '',
            agent_uuid: '',
          },
        } as CsatOrNpsCardConfig,
        grid_position: {
          column_start: 0,
          column_end: 0,
          row_start: 0,
          row_end: 0,
        },
        report: null,
        source: type === 'csat' ? 'conversations.csat' : 'conversations.nps',
        is_configurable: true,
      };
      setNewWidget(newWidget as WidgetType);
      return newWidget as WidgetType;
    }

    function setHumanSupport(enabled: boolean) {
      setSentimentForm({ humanSupport: enabled });
      const conversationalWidgets = useConversationalWidgets();
      conversationalWidgets.setIsFormHuman(enabled);
    }

    function setAiSupport(enabled: boolean) {
      setSentimentForm({ aiSupport: enabled });
      const conversationalWidgets = useConversationalWidgets();
      conversationalWidgets.setIsFormAi(enabled);
    }

    function loadSentimentData(type: 'csat' | 'nps') {
      const conversationalWidgets = useConversationalWidgets();
      const { csatWidget, npsWidget } = storeToRefs(conversationalWidgets);

      const widget = type === 'csat' ? csatWidget.value : npsWidget.value;
      if (!widget) return;
      const config = widget.config as CsatOrNpsCardConfig;

      let humanSupport = false;
      let aiSupport = false;
      let flowUuid = null;
      let flowResult = null;

      if (config.filter?.flow && config.op_field) {
        humanSupport = true;
        flowUuid = config.filter.flow;
        flowResult = config.op_field;
      }

      if (config.datalake_config?.agent_uuid) {
        aiSupport = true;
      }

      setSentimentForm({
        humanSupport,
        aiSupport,
        flow: {
          uuid: flowUuid,
          result: flowResult,
        },
        agentUuid: config.datalake_config?.agent_uuid || null,
      });
    }

    function initializeForm(type: string, isNew: boolean, uuid = '') {
      const customizedStore = useCustomizedWidgetForm();

      if (
        editingContext.type === type &&
        editingContext.isNew === isNew &&
        editingContext.uuid === uuid
      ) {
        return;
      }

      setEditingContext(type, isNew, uuid);

      if (type === 'add') {
        resetSentimentForm();
        customizedStore.resetCustomizedForm();
        return;
      }

      if (isNew) {
        resetSentimentForm();
        customizedStore.resetCustomizedForm();
      } else {
        if (type === 'csat' || type === 'nps') {
          loadSentimentData(type);
        } else if (type === 'custom') {
          customizedStore.loadFromCustomWidget();
        }
      }
    }

    return {
      sentimentForm,
      editingContext,
      isActivatingAgent,
      setSentimentForm,
      resetSentimentForm,
      activateAgent,
      setAgent,
      setFlow,
      setFlowResult,
      setHumanSupport,
      setAiSupport,
      initializeForm,
    };
  },
);
