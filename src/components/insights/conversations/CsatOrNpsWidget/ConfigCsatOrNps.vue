<template>
  <section class="config-csat-or-nps">
    <h2
      class="config-csat-or-nps__title"
      data-testid="config-csat-or-nps-title"
    >
      {{ $t(`conversations_dashboard.${type}`) }}
    </h2>

    <p
      class="config-csat-or-nps__description"
      data-testid="config-csat-or-nps-description"
    >
      {{
        $tc(
          'conversations_dashboard.customize_your_dashboard.config_csat_or_nps_description',
          { type: type.toUpperCase() },
        )
      }}
    </p>

    <UnnnicCheckbox
      data-testid="config-csat-or-nps-checkbox-human-support"
      :modelValue="humanSupport"
      :textRight="
        $t('conversations_dashboard.customize_your_dashboard.human_support')
      "
      @change="handleChangeHumanSupport"
    />

    <section
      v-if="humanSupport"
      class="config-csat-or-nps__section"
      data-testid="config-csat-or-nps-section-human-support"
    >
      <SelectFlow
        v-model="flow.uuid"
        data-testid="config-csat-or-nps-select-flow"
        @update:model-value="handleChangeFlow"
      />

      <SelectFlowResult
        v-model="flow.result"
        data-testid="config-csat-or-nps-select-flow-result"
        :flow="flow.uuid"
        :disabled="!flow.uuid"
        @update:model-value="handleChangeFlowResult"
      />
    </section>

    <UnnnicCheckbox
      data-testid="config-csat-or-nps-checkbox-ai-support"
      :modelValue="aiSupport"
      :textRight="
        $t('conversations_dashboard.customize_your_dashboard.ai_support')
      "
      @change="handleChangeAiSupport"
    />
    <section
      v-if="aiSupport"
      class="config-csat-or-nps__section"
      data-testid="config-csat-or-nps-section-ai-support"
    >
      <UnnnicButton
        v-if="!agent"
        data-testid="config-csat-or-nps-button-activate-agent"
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
        data-testid="config-csat-or-nps-section-agent"
        class="config-csat-or-nps__section"
      >
        <section>
          <UnnnicLabel
            data-testid="config-csat-or-nps-label-select-agent"
            :label="
              $t(
                'conversations_dashboard.customize_your_dashboard.select_agent',
              )
            "
          />
          <UnnnicSelectSmart
            data-testid="config-csat-or-nps-select-agent"
            :modelValue="[{ value: agent?.uuid, label: agent?.name }]"
            :options="[]"
            autocomplete
            autocompleteIconLeft
            selectFirst
            disabled
            @update:model-value="handleChangeAgent"
          />
        </section>

        <p
          class="config-csat-or-nps__agent-active"
          data-testid="config-csat-or-nps-agent-active"
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
const { currentCsatWidget, currentNpsWidget, csatWidget, npsWidget } =
  storeToRefs(conversationalWidgets);

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

const humanSupport = ref(false);
const aiSupport = ref(false);

const flow = ref({
  uuid: null,
  result: null,
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
  flow.value.uuid = value;
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
  flow.value.result = value;
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
  humanSupport.value = $event;
  conversationalWidgets.setIsFormHuman($event);
}

function handleChangeAiSupport($event: boolean) {
  aiSupport.value = $event;
  conversationalWidgets.setIsFormAi($event);
}

function setFormDataAiSupport() {
  if (props.type === 'csat') {
    const config = currentCsatWidget.value?.config as CsatOrNpsCardConfig;
    if (config?.datalake_config?.agent_uuid) {
      aiSupport.value = true;
      conversationalWidgets.setIsFormAi(true);
    }
  } else {
    const config = currentNpsWidget.value?.config as CsatOrNpsCardConfig;
    if (config?.datalake_config?.agent_uuid) {
      aiSupport.value = true;
      conversationalWidgets.setIsFormAi(true);
    }
  }
}

async function setFormDataHumanSupport() {
  await getFlows();
  if (props.type === 'csat') {
    const config = currentCsatWidget.value?.config as CsatOrNpsCardConfig;
    if (config?.filter?.flow && config?.op_field) {
      humanSupport.value = true;
      conversationalWidgets.setIsFormHuman(true);
      if (project?.flows?.length > 0) {
        setFormFlow();
      }
    }
  } else {
    const config = currentNpsWidget.value?.config as CsatOrNpsCardConfig;
    if (config?.filter?.flow && config?.op_field) {
      humanSupport.value = true;
      conversationalWidgets.setIsFormHuman(true);
      if (project?.flows?.length > 0) {
        setFormFlow();
      }
    }
  }
}

function setFormFlow() {
  if (props.type === 'csat') {
    const config = currentCsatWidget.value?.config as CsatOrNpsCardConfig;
    flow.value = {
      uuid: config?.filter?.flow || null,
      result: config?.op_field || null,
    };
  } else {
    const config = currentNpsWidget.value?.config as CsatOrNpsCardConfig;
    flow.value = {
      uuid: config?.filter?.flow || null,
      result: config?.op_field || null,
    };
  }
}

watch(
  () => project.flows,
  () => {
    if (!props.isNew) {
      setFormFlow();
    }
  },
);

watch(
  () => agent.value,
  () => {
    handleSetAgent();
  },
);

onBeforeMount(() => {
  getFlows();
  getAgentsTeam();
});

onMounted(async () => {
  if (props.isNew) {
    widget.value.source =
      props.type === 'csat' ? 'conversations.csat' : 'conversations.nps';
    setNewWidget(widget.value);
  } else {
    setFormDataAiSupport();
    setFormDataHumanSupport();
  }
});
</script>

<style lang="scss" scoped>
.config-csat-or-nps,
.config-csat-or-nps__section {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;
}

.config-csat-or-nps {
  &__title {
    color: $unnnic-color-neutral-black;
    font-weight: $unnnic-font-weight-bold;
  }

  &__description {
    color: $unnnic-color-neutral-cloudy;
  }

  &__title,
  &__description {
    font-size: $unnnic-font-size-body-lg;
    font-family: $unnnic-font-family-secondary;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
  }

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
