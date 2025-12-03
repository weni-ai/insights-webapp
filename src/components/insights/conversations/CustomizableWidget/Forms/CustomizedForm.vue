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
        disableInternalFilter
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
import { useCustomizedWidgetForm } from '@/store/modules/conversational/customizedForm';
import { useProject } from '@/store/modules/project';
import { storeToRefs } from 'pinia';
import { useConversational } from '@/store/modules/conversational/conversational';

const customWidgets = useCustomWidgets();
const { setCustomFormKey, setCustomFormWidgetName } = customWidgets;

const formsStore = useCustomizedWidgetForm();
const { customizedForm } = storeToRefs(formsStore);
const { setCustomFormAgent } = formsStore;

const { agentsTeam, isLoadingAgentsTeam } = storeToRefs(useProject());
const conversational = useConversational();

const agentSelectModel = computed(() => [
  {
    value: customizedForm.value.agentUuid,
    label: customizedForm.value.agentName,
  },
]);

watch(
  [agentsTeam, () => customizedForm.value.agentUuid],
  ([agentsTeamValue, agentUuid]) => {
    if (conversational.isNewDrawerCustomizable) {
      return;
    }

    if (!agentUuid || !agentsTeamValue?.agents?.length) {
      return;
    }

    const agent = agentsTeamValue.agents.find(
      (agent: { uuid: string }) => agent.uuid === agentUuid,
    );

    if (agent && customizedForm.value.agentName !== agent.name) {
      setCustomFormAgent(agent.uuid, agent.name);
    }
  },
  { immediate: true },
);

const handleChangeAgent = (agent: any) => {
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
