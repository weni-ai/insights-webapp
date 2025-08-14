<template>
  <section class="customized-form">
    <section>
      <UnnnicLabel
        data-testid="customized-form-label-select-agent"
        :label="
          $t('conversations_dashboard.customize_your_dashboard.select_agent')
        "
      />
      <UnnnicSelectSmart
        data-testid="customized-form-select-agent"
        :modelValue="[
          { value: customForm.agent_uuid, label: customForm.agent_name },
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
        data-testid="customized-form-label-select-agent"
        :label="$t('key')"
      />
      <UnnnicInput
        data-testid="customized-form-input-key"
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
import { onBeforeMount, onUnmounted, watch } from 'vue';
import { useCustomWidgets } from '@/store/modules/conversational/customWidgets';
import { useProject } from '@/store/modules/project';
import { storeToRefs } from 'pinia';
import { useConversational } from '@/store/modules/conversational/conversational';

const customWidgets = useCustomWidgets();
const { getCustomForm, setCustomFormAgent, setCustomFormKey, resetCustomForm } =
  customWidgets;

const { customForm } = storeToRefs(customWidgets);
const project = useProject();
const { getAgentsTeam } = project;
const { agentsTeam, isLoadingAgentsTeam } = storeToRefs(project);
const { isNewDrawerCustomizable } = useConversational();

onBeforeMount(() => {
  getAgentsTeam();
});

watch(agentsTeam, () => {
  if (!isNewDrawerCustomizable) {
    const agent = agentsTeam.value.agents.find(
      (agent) => agent.uuid === customForm.value.agent_uuid,
    );
    setCustomFormAgent(agent?.uuid || '', agent?.name || '');
  }
});

onUnmounted(() => {
  resetCustomForm();
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
