<template>
  <section class="customized-form">
    <section>
      <UnnnicLabel
        data-testid="sentiment-analysis-form-label-select-agent"
        :label="
          $t('conversations_dashboard.customize_your_dashboard.select_agent')
        "
      />
      <UnnnicSelectSmart
        data-testid="sentiment-analysis-form-select-agent"
        :modelValue="[
          { value: getCustomForm.agent_uuid, label: getCustomForm.agent_name },
        ]"
        :options="
          agentsTeam.agents.map((agent) => ({
            value: agent.uuid,
            label: agent.name,
          }))
        "
        autocomplete
        autocompleteIconLeft
        selectFirst
        :isLoading="isLoadingAgentsTeam"
        @update:model-value="handleChangeAgent"
      />
    </section>
    <section>
      <UnnnicLabel
        data-testid="sentiment-analysis-form-label-select-agent"
        :label="$t('key')"
      />
      <UnnnicInput
        data-testid="sentiment-analysis-form-input-key"
        :placeholder="
          $t('conversations_dashboard.customize_your_dashboard.select_key')
        "
        :modelValue="getCustomForm.key"
        @update:model-value="handleChangeKey"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { useCustomWidgets } from '@/store/modules/conversational/customWidgets';
import { useProject } from '@/store/modules/project';
import { storeToRefs } from 'pinia';

const { getCustomForm, setCustomFormAgent, setCustomFormKey } =
  useCustomWidgets();
const project = useProject();
const { getAgentsTeam } = project;
const { agentsTeam, isLoadingAgentsTeam } = storeToRefs(project);

onBeforeMount(() => {
  getAgentsTeam();
});

const handleChangeAgent = (agent: any) => {
  setCustomFormAgent(agent[0].value, agent[0].label);
};

const handleChangeKey = (key: string) => {
  setCustomFormKey(key);
};
</script>

<style lang="scss" scoped>
.customized-form {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;
}
</style>
