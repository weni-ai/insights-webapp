import { defineStore } from 'pinia';
import { reactive } from 'vue';

import { useCustomWidgets } from '@/store/modules/conversational/customWidgets';

interface CustomizedForm {
  widgetName: string;
  agentUuid: string;
  agentName: string;
  key: string;
}

export const useCustomizedWidgetForm = defineStore(
  'conversationalCustomizedForm',
  () => {
    const customizedForm = reactive<CustomizedForm>({
      widgetName: '',
      agentUuid: '',
      agentName: '',
      key: '',
    });

    function setCustomizedForm(data: Partial<CustomizedForm>) {
      Object.assign(customizedForm, data);
    }

    function resetCustomizedForm() {
      customizedForm.widgetName = '';
      customizedForm.agentUuid = '';
      customizedForm.agentName = '';
      customizedForm.key = '';
    }

    function setCustomFormAgent(agentUuid: string, agentName: string) {
      setCustomizedForm({
        agentUuid,
        agentName,
      });
      const customWidgets = useCustomWidgets();
      customWidgets.setCustomFormAgent(agentUuid, agentName);
    }

    function loadFromCustomWidget() {
      const customWidgets = useCustomWidgets();
      const { customForm } = customWidgets;

      setCustomizedForm({
        widgetName: customForm.widget_name,
        agentUuid: customForm.agent_uuid,
        agentName: customForm.agent_name,
        key: customForm.key,
      });
    }

    return {
      customizedForm,
      setCustomizedForm,
      resetCustomizedForm,
      setCustomFormAgent,
      loadFromCustomWidget,
    };
  },
);
