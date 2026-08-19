<template>
  <section class="content-recurrence">
    <section>
      <UnnnicLabel :label="$t('drawers.config_recurrence.name_metric')" />
      <UnnnicInput
        v-model="config.name"
        :placeholder="$t('drawers.config_card.name_card.placeholder')"
      />
    </section>

    <SelectFlow
      v-model="config.flow.uuid"
      data-test-id="select-flow"
    />

    <SelectFlowResult
      v-model="config.flow.result"
      data-test-id="select-flow-result"
      :flow="config.flow?.uuid"
      :disabled="!config.flow?.uuid"
    />
    <UnnnicButton
      class="clear-button"
      :text="$t('drawers.reset_widget')"
      type="tertiary"
      :disabled="isDisableResetWidget"
      @click="resetWidget"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';

import SelectFlow from '@/components/SelectFlow.vue';
import SelectFlowResult from '@/components/SelectFlowResult.vue';
import { useWidgets } from '@/store/modules/widgets';

defineOptions({ name: 'DrawerConfigContentRecurrence' });

const emit = defineEmits<{
  'update:is-valid-form': [value: boolean];
  'reset-widget': [];
  'update-disable-primary-button': [value: boolean];
}>();

const widgetsStore = useWidgets();
const { currentWidgetEditing } = storeToRefs(widgetsStore);

const config = ref<Record<string, any> | null>(null);

const widgetConfig = computed(() => currentWidgetEditing.value.config);

const isValidForm = computed(() => {
  const currentConfig = config.value;
  return (
    currentConfig?.flow.uuid &&
    currentConfig?.flow.result &&
    !!currentConfig?.name.trim()
  );
});

const isDisableResetWidget = computed(() => false);

watch(
  config,
  (newConfig) => {
    widgetsStore.updateCurrentWidgetEditingConfig({
      ...widgetConfig.value,
      ...newConfig,
    });

    if (newConfig?.operation === 'recurrence') config.value.currency = false;
  },
  { deep: true },
);

watch(
  () => config.value?.flow?.uuid,
  (newFlowUuid, oldFlowUuid) => {
    if (oldFlowUuid && newFlowUuid !== oldFlowUuid) {
      config.value.flow.result = '';
    }
  },
);

watch(
  isValidForm,
  (newIsValidForm) => {
    emit('update-disable-primary-button', !newIsValidForm);
  },
  { immediate: true },
);

const initialWidgetConfig = widgetConfig.value;
config.value = {
  name: currentWidgetEditing.value.name || '',
  flow: {
    uuid: initialWidgetConfig.flow?.uuid || '',
    result: initialWidgetConfig.flow?.result || '',
  },
  operation: initialWidgetConfig.operation || '',
  currency: initialWidgetConfig.currency || false,
};

const resetWidget = () => {
  emit('reset-widget');
};

defineExpose({
  config,
  isValidForm,
  isDisableResetWidget,
  resetWidget,
});
</script>

<style lang="scss" scoped>
.content-recurrence {
  display: grid;
  gap: $unnnic-space-1;

  .clear-button {
    margin-top: $unnnic-space-1;
  }
}
</style>
