<template>
  <section class="customized-form">
    <p
      class="customized-form__description"
      data-testid="customized-form-description"
    >
      {{
        $t('conversations_dashboard.customize_your_dashboard.set_widget_name')
      }}
    </p>
    <section>
      <UnnnicLabel
        data-testid="customized-form-label-widget-name"
        :label="
          $t(
            'conversations_dashboard.customize_your_dashboard.label_widget_name',
          )
        "
      />
      <UnnnicInput
        data-testid="customized-form-input-widget-name"
        :placeholder="
          $t(
            'conversations_dashboard.customize_your_dashboard.widget_name_description',
          )
        "
        :modelValue="getCustomForm.widget_name"
        @update:model-value="handleChangeWidgetName"
      />
    </section>

    <p
      class="customized-form__description"
      data-testid="customized-form-description"
    >
      {{ $t('conversations_dashboard.customize_your_dashboard.select_data') }}
    </p>

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
import { onUnmounted, watch } from 'vue';
import { useCustomWidgets } from '@/store/modules/conversational/customWidgets';
import { useProject } from '@/store/modules/project';
import { storeToRefs } from 'pinia';
import { useConversational } from '@/store/modules/conversational/conversational';

const customWidgets = useCustomWidgets();
const {
  getCustomForm,
  setCustomFormAgent,
  setCustomFormKey,
  setCustomFormWidgetName,
  resetCustomForm,
} = customWidgets;

const { customForm } = storeToRefs(customWidgets);
const { agentsTeam, isLoadingAgentsTeam } = storeToRefs(useProject());
const { isNewDrawerCustomizable } = useConversational();

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

const handleChangeWidgetName = (widgetName: string) => {
  setCustomFormWidgetName(widgetName);
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
