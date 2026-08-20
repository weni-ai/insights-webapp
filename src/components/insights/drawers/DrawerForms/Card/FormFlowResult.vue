<template>
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

  <RadioList
    v-model:selectedRadio="config.operation"
    data-test-id="radio-list"
    :label="$t('drawers.config_card.operation')"
    :radios="operations"
  />

  <section>
    <UnnnicLabel
      :label="$t('drawers.config_card.format')"
      data-test-id="label"
    />
    <UnnnicCheckbox
      data-test-id="check-box"
      :modelValue="config.currency"
      :textRight="$t('drawers.config_card.checkbox.currency')"
      :disabled="config.operation === 'recurrence'"
      @change="config.currency = $event"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import { useWidgets } from '@/store/modules/widgets';
import SelectFlow from '@/components/SelectFlow.vue';
import SelectFlowResult from '@/components/SelectFlowResult.vue';
import RadioList from '@/components/RadioList.vue';

defineOptions({ name: 'FormFlowResult' });

const emit = defineEmits<{
  'update:is-valid-form': [value: unknown];
}>();

const { t } = useI18n();
const widgetsStore = useWidgets();
const { currentWidgetEditing } = storeToRefs(widgetsStore);

const config = ref<Record<string, any> | null>(null);

const operations = [
  {
    value: 'sum',
    label: t('drawers.config_card.radios.total'),
  },
  {
    value: 'max',
    label: t('drawers.config_card.radios.highest_value'),
  },
  {
    value: 'avg',
    label: t('drawers.config_card.radios.avg'),
  },
  {
    value: 'min',
    label: t('drawers.config_card.radios.lowest_value'),
  },
];

const widgetConfig = computed(() => currentWidgetEditing.value.config);

const isValidForm = computed(() => {
  const currentConfig = config.value;
  return (
    currentConfig?.flow.uuid &&
    currentConfig?.flow.result &&
    currentConfig?.operation
  );
});

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
    emit('update:is-valid-form', newIsValidForm);
  },
  { immediate: true },
);

const initialWidgetConfig = widgetConfig.value;
config.value = {
  flow: {
    uuid: initialWidgetConfig.flow?.uuid || '',
    result: initialWidgetConfig.flow?.result || '',
  },
  operation: initialWidgetConfig.operation || '',
  currency: initialWidgetConfig.currency || false,
};

defineExpose({
  config,
  operations,
  isValidForm,
  widgetConfig,
});
</script>
