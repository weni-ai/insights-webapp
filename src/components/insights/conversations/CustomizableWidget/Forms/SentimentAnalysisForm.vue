<template>
  <section class="sentiment-analysis-form">
    <p
      class="sentiment-analysis-form__description"
      data-testid="sentiment-analysis-form-description"
    >
      {{
        $t(
          'conversations_dashboard.customize_your_dashboard.config_csat_or_nps_description',
          { type: props.type.toUpperCase() },
        )
      }}
    </p>

    <UnnnicCheckbox
      data-testid="sentiment-analysis-form-checkbox-human-support"
      :modelValue="sentimentForm.humanSupport"
      :textRight="
        $t('conversations_dashboard.customize_your_dashboard.human_support')
      "
      @change="handleChangeHumanSupport"
    />

    <section
      v-if="sentimentForm.humanSupport"
      class="sentiment-analysis-form__section"
      data-testid="sentiment-analysis-form-section-human-support"
    >
      <SelectFlow
        v-model="sentimentForm.flow.uuid"
        data-testid="sentiment-analysis-form-select-flow"
        @update:model-value="handleChangeFlow"
      />

      <SelectFlowResult
        v-model="sentimentForm.flow.result"
        data-testid="sentiment-analysis-form-select-flow-result"
        :flow="sentimentForm.flow.uuid || ''"
        :disabled="!sentimentForm.flow.uuid"
        @update:model-value="handleChangeFlowResult"
      />
    </section>

    <UnnnicCheckbox
      data-testid="sentiment-analysis-form-checkbox-ai-support"
      :modelValue="sentimentForm.aiSupport"
      :textRight="
        $t('conversations_dashboard.customize_your_dashboard.ai_support')
      "
      @change="handleChangeAiSupport"
    />
    <section
      v-if="sentimentForm.aiSupport"
      class="sentiment-analysis-form__section"
      data-testid="sentiment-analysis-form-section-ai-support"
    >
      <UnnnicButton
        v-if="!agent"
        data-testid="sentiment-analysis-form-button-activate-agent"
        :text="
          $t('conversations_dashboard.customize_your_dashboard.activate_agent')
        "
        type="secondary"
        :loading="isActivatingAgent"
        :disabled="project.isLoadingAgentsTeam"
        @click="handleActivateAgent"
      />
      <section
        v-else
        data-testid="sentiment-analysis-form-section-agent"
        class="sentiment-analysis-form__section"
      >
        <section>
          <UnnnicLabel
            data-testid="sentiment-analysis-form-label-select-agent"
            :label="
              $t(
                'conversations_dashboard.customize_your_dashboard.select_agent',
              )
            "
          />
          <UnnnicSelectSmart
            data-testid="sentiment-analysis-form-select-agent"
            :modelValue="agentSelectModel"
            :options="[]"
            autocomplete
            autocompleteIconLeft
            selectFirst
            disabled
            @update:model-value="handleChangeAgent"
          />
        </section>

        <p
          class="sentiment-analysis-form__agent-active"
          data-testid="sentiment-analysis-form-agent-active"
        >
          {{
            $t(
              'conversations_dashboard.customize_your_dashboard.your_agent_is_active',
            )
          }}
        </p>
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, onMounted, ref, watch } from 'vue';

import { useProject } from '@/store/modules/project';

import SelectFlow from '@/components/SelectFlow.vue';
import SelectFlowResult from '@/components/SelectFlowResult.vue';
import env from '@/utils/env';
import { useConversationalWidgets } from '@/store/modules/conversational/widgets';
import { useConversationalForms } from '@/store/modules/conversational/forms';
import { WidgetType, CsatOrNpsCardConfig } from '@/models/types/WidgetTypes';
import { storeToRefs } from 'pinia';

const props = defineProps<{
  type: 'csat' | 'nps';
  isNew: boolean;
}>();

const project = useProject();
const { isLoadedFlows, getProjectFlows, getAgentsTeam, activateAgent } =
  project;

const conversationalWidgets = useConversationalWidgets();
const { setNewWidget, setCsatWidget, setNpsWidget } = conversationalWidgets;
const { csatWidget, npsWidget } = storeToRefs(conversationalWidgets);

const formsStore = useConversationalForms();
const { sentimentForm } = storeToRefs(formsStore);

const widget = ref<WidgetType>({
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
  source: '',
  is_configurable: true,
});

async function getFlows() {
  if (!isLoadedFlows) {
    getProjectFlows();
  }
}

const currentWidget = computed(() => {
  if (props.isNew) {
    return widget.value;
  } else {
    return props.type === 'csat' ? csatWidget.value : npsWidget.value;
  }
});

const agent = computed(() => {
  return props.type === 'csat' ? project.csatAgent : project.npsAgent;
});

const isActivatingAgent = ref(false);

const agentSelectModel = computed(() => [
  { value: agent.value?.uuid || '', label: agent.value?.name || '' },
]);

async function handleActivateAgent() {
  isActivatingAgent.value = true;
  await activateAgent(
    props.type === 'csat' ? env('CSAT_AGENT_UUID') : env('NPS_AGENT_UUID'),
  );

  await getAgentsTeam();
  isActivatingAgent.value = false;
}

function handleSetAgent() {
  const type = props.type === 'csat' ? 'csat' : 'nps';
  if (props.isNew) {
    (widget.value.config as CsatOrNpsCardConfig).datalake_config = {
      type: type.toUpperCase(),
      agent_uuid:
        type === 'csat' ? env('CSAT_AGENT_UUID') : env('NPS_AGENT_UUID'),
    };
    setNewWidget(widget.value);
  } else {
    const data = {
      ...currentWidget.value,
      config: {
        ...(currentWidget?.value?.config as CsatOrNpsCardConfig),
        datalake_config: {
          type,
          agent_uuid:
            type === 'csat' ? env('CSAT_AGENT_UUID') : env('NPS_AGENT_UUID'),
        },
      },
    };
    if (props.type === 'csat') {
      setCsatWidget(data);
    } else {
      setNpsWidget(data);
    }
  }
}

function handleChangeAgent() {
  handleSetAgent();
}

function handleChangeFlow(value: string) {
  formsStore.setSentimentForm({
    flow: { ...sentimentForm?.value?.flow, uuid: value },
  });

  if (props.isNew) {
    (widget.value.config as CsatOrNpsCardConfig).filter.flow = value;
    setNewWidget(widget.value);
  } else {
    if (value) {
      const data = {
        ...currentWidget.value,
        config: {
          ...(currentWidget?.value?.config as CsatOrNpsCardConfig),
          filter: { flow: value },
          op_field: '',
        },
      };
      if (props.type === 'csat') {
        setCsatWidget(data);
      } else {
        setNpsWidget(data);
      }
    }
  }
}

function handleChangeFlowResult(value: string) {
  formsStore.setSentimentForm({
    flow: { ...sentimentForm?.value?.flow, result: value },
  });

  if (props.isNew) {
    (widget.value.config as CsatOrNpsCardConfig).op_field = value;
    setNewWidget(widget.value);
  } else {
    if (value) {
      const data = {
        ...currentWidget.value,
        config: {
          ...currentWidget.value.config,
          op_field: value,
        },
      };
      if (props.type === 'csat') {
        setCsatWidget(data);
      } else {
        setNpsWidget(data);
      }
    }
  }
}

function handleChangeHumanSupport($event: boolean) {
  formsStore.setSentimentForm({ humanSupport: $event });
  conversationalWidgets.setIsFormHuman($event);
}

function handleChangeAiSupport($event: boolean) {
  formsStore.setSentimentForm({ aiSupport: $event });
  conversationalWidgets.setIsFormAi($event);
}

watch(
  () => agent.value,
  () => {
    handleSetAgent();
  },
);

onBeforeMount(() => {
  getFlows();
});

onMounted(async () => {
  if (props.isNew) {
    widget.value.source =
      props.type === 'csat' ? 'conversations.csat' : 'conversations.nps';
    setNewWidget(widget.value);
  }
});
</script>

<style lang="scss" scoped>
.sentiment-analysis-form,
.sentiment-analysis-form__section {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;
}

.sentiment-analysis-form {
  &__section {
    :deep(.unnnic-label__label) {
      margin: 0;
      margin-bottom: $unnnic-spacing-nano;
    }
  }

  &__agent-active {
    color: $unnnic-color-neutral-cloudy;
    font-size: $unnnic-font-size-body-md;
    font-family: $unnnic-font-family-secondary;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
  }
}
</style>
