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
import { computed, onBeforeMount, watch } from 'vue';

import { useProject } from '@/store/modules/project';

import SelectFlow from '@/components/SelectFlow.vue';
import SelectFlowResult from '@/components/SelectFlowResult.vue';
import { useSentimentAnalysisForm } from '@/store/modules/conversational/sentimentForm';
import { storeToRefs } from 'pinia';

const props = defineProps<{
  type: 'csat' | 'nps';
  isNew: boolean;
}>();

const project = useProject();
const { isLoadedFlows, getProjectFlows } = project;

const formsStore = useSentimentAnalysisForm();
const { sentimentForm, isActivatingAgent } = storeToRefs(formsStore);
const {
  activateAgent,
  setAgent,
  setFlow,
  setFlowResult,
  setHumanSupport,
  setAiSupport,
} = formsStore;

async function getFlows() {
  if (!isLoadedFlows) {
    getProjectFlows();
  }
}

const agent = computed(() => {
  return props.type === 'csat' ? project.csatAgent : project.npsAgent;
});

const agentSelectModel = computed(() => [
  { value: agent.value?.uuid || '', label: agent.value?.name || '' },
]);

async function handleActivateAgent() {
  await activateAgent(props.type);
}

function handleSetAgent() {
  if (agent.value) {
    setAgent(agent.value.uuid, agent.value.name);
  }
}

function handleChangeAgent() {
  handleSetAgent();
}

function handleChangeFlow(value: string) {
  setFlow(value);
}

function handleChangeFlowResult(value: string) {
  setFlowResult(value);
}

function handleChangeHumanSupport($event: boolean) {
  setHumanSupport($event);
}

function handleChangeAiSupport($event: boolean) {
  console.log('handleChangeAiSupport', $event);
  setAiSupport($event);
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
