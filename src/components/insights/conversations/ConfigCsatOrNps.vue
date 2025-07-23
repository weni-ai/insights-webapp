<template>
  <section class="config-csat-or-nps">
    <h2 class="config-csat-or-nps__title">
      {{ $t(`conversations_dashboard.${type}`) }}
    </h2>

    <p class="config-csat-or-nps__description">
      {{
        $t(
          'conversations_dashboard.customize_your_dashboard.config_csat_or_nps_description',
          { type },
        )
      }}
    </p>

    <UnnnicCheckbox
      :modelValue="humanSupport"
      :textRight="
        $t('conversations_dashboard.customize_your_dashboard.human_support')
      "
      @change="humanSupport = $event"
    />

    <section
      v-if="humanSupport"
      class="config-csat-or-nps__section"
    >
      <SelectFlow
        v-model="flow.uuid"
        data-test-id="select-flow"
      />

      <SelectFlowResult
        v-model="flow.result"
        data-test-id="select-flow-result"
        :flow="flow.uuid"
        :disabled="!flow.uuid"
      />
    </section>

    <UnnnicCheckbox
      :modelValue="aiSupport"
      :textRight="
        $t('conversations_dashboard.customize_your_dashboard.ai_support')
      "
      @change="aiSupport = $event"
    />
    <section
      v-if="aiSupport"
      class="config-csat-or-nps__section"
    >
      <UnnnicButton
        v-if="!agent"
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
        class="config-csat-or-nps__section"
      >
        <section>
          <UnnnicLabel
            :label="
              $t(
                'conversations_dashboard.customize_your_dashboard.select_agent',
              )
            "
          />
          <UnnnicSelectSmart
            :modelValue="[{ value: agent.uuid, label: agent.name }]"
            :options="[]"
            autocomplete
            autocompleteIconLeft
            selectFirst
            disabled
          />
        </section>

        <p class="config-csat-or-nps__agent-active">
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
import { computed, onMounted, ref } from 'vue';

import { useProject } from '@/store/modules/project';

import SelectFlow from '@/components/SelectFlow.vue';
import SelectFlowResult from '@/components/SelectFlowResult.vue';
import env from '@/utils/env';

const props = defineProps<{
  type: 'csat' | 'nps';
}>();

const project = useProject();
const { isLoadedFlows, getProjectFlows, getAgentsTeam, activateAgent } =
  project;

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

onMounted(() => {
  getFlows();
  getAgentsTeam();
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
