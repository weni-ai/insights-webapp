import { defineStore } from 'pinia';
import { reactive } from 'vue';

interface SentimentForm {
  humanSupport: boolean;
  aiSupport: boolean;
  flow: {
    uuid: string | null;
    result: string | null;
  };
  agentUuid: string | null;
}

interface CustomizedForm {
  widgetName: string;
  agentUuid: string;
  agentName: string;
  key: string;
}

export const useConversationalForms = defineStore('conversationalForms', () => {
  const sentimentForm = reactive<SentimentForm>({
    humanSupport: false,
    aiSupport: false,
    flow: {
      uuid: null,
      result: null,
    },
    agentUuid: null,
  });

  const customizedForm = reactive<CustomizedForm>({
    widgetName: '',
    agentUuid: '',
    agentName: '',
    key: '',
  });

  // Initialize refs for UnnnicSelectSmart v-model to avoid reactivity issues with complex objects
  // UnnnicSelectSmart expects an array for modelValue
  const customizedFormSelectAgentModel = reactive([{ value: '', label: '' }]);

  const editingContext = reactive({
    type: '',
    isNew: true,
    uuid: '',
  });

  function setSentimentForm(data: Partial<SentimentForm>) {
    Object.assign(sentimentForm, data);
  }

  function setCustomizedForm(data: Partial<CustomizedForm>) {
    Object.assign(customizedForm, data);
  }

  function setEditingContext(type: string, isNew: boolean, uuid = '') {
    editingContext.type = type;
    editingContext.isNew = isNew;
    editingContext.uuid = uuid;
  }

  function resetSentimentForm() {
    sentimentForm.humanSupport = false;
    sentimentForm.aiSupport = false;
    sentimentForm.flow.uuid = null;
    sentimentForm.flow.result = null;
    sentimentForm.agentUuid = null;
  }

  function resetCustomizedForm() {
    customizedForm.widgetName = '';
    customizedForm.agentUuid = '';
    customizedForm.agentName = '';
    customizedForm.key = '';
  }

  return {
    sentimentForm,
    customizedForm,
    editingContext,
    setSentimentForm,
    setCustomizedForm,
    setEditingContext,
    resetSentimentForm,
    resetCustomizedForm,
  };
});
