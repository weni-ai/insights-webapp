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
        :modelValue="customizedForm.widgetName"
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
        :modelValue="agentSelectModel"
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
        :modelValue="customizedForm.key"
        @update:model-value="handleChangeKey"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useCustomWidgets } from '@/store/modules/conversational/customWidgets';
import { useConversationalForms } from '@/store/modules/conversational/forms';
import { useProject } from '@/store/modules/project';
import { storeToRefs } from 'pinia';
import { useConversational } from '@/store/modules/conversational/conversational';

const customWidgets = useCustomWidgets();
const { setCustomFormAgent, setCustomFormKey, setCustomFormWidgetName } =
  customWidgets;

const formsStore = useConversationalForms();
const { customizedForm } = storeToRefs(formsStore);

const { agentsTeam, isLoadingAgentsTeam } = storeToRefs(useProject());
const { isNewDrawerCustomizable } = useConversational();

const agentSelectModel = computed(() => [
  {
    value: customizedForm.value.agentUuid,
    label: customizedForm.value.agentName,
  },
]);

watch(agentsTeam, () => {
  if (!isNewDrawerCustomizable) {
    const agent = agentsTeam.value.agents.find(
      (agent) => agent.uuid === customizedForm.value.agentUuid,
    );
    if (agent) {
      formsStore.setCustomizedForm({
        agentUuid: agent.uuid,
        agentName: agent.name,
      });
      setCustomFormAgent(agent.uuid, agent.name);
    }
  }
});

const handleChangeAgent = (agent: any) => {
  formsStore.setCustomizedForm({
    agentUuid: agent[0].value,
    agentName: agent[0].label,
  });
  setCustomFormAgent(agent[0].value, agent[0].label);
};

const handleChangeWidgetName = (widgetName: string) => {
  formsStore.setCustomizedForm({ widgetName });
  setCustomFormWidgetName(widgetName);
};

const handleChangeKey = (key: string) => {
  formsStore.setCustomizedForm({ key });
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
