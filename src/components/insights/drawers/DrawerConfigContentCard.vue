<template>
  <section>
    <UnnnicLabel :label="$t('drawers.config_card.name_card.label')" />
    <UnnnicInput
      v-model="config.name"
      :placeholder="$t('drawers.config_card.name_card.placeholder')"
    />
  </section>

  <component
    :is="currentFormComponent"
    :data-testid="`form-${type}`"
    v-on="currentFormEvents"
  />

  <SelectEmojiButton
    v-model="config.friendly_id"
    :pickerPosition="type === 'executions' ? 'bottom' : 'top'"
  />

  <UnnnicButton
    :text="$t('drawers.reset_widget')"
    type="tertiary"
    :disabled="disableResetWidgetButton"
    data-testid="reset-widget-button"
    @click="$emit('reset-widget')"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { useWidgets } from '@/store/modules/widgets';
import FormExecutions from './DrawerForms/Card/FormExecutions.vue';
import FormFlowResult from './DrawerForms/Card/FormFlowResult.vue';
import FormDataCrossing from './DrawerForms/Card/FormDataCrossing/index.vue';
import SelectEmojiButton from '@/components/SelectEmojiButton.vue';
import { checkDeepEmptyValues } from '@/utils/object';

defineOptions({ name: 'DrawerConfigContentCard' });

interface DrawerConfigContentCardProps {
  type?: string;
}

const props = withDefaults(defineProps<DrawerConfigContentCardProps>(), {
  type: '',
});

const emit = defineEmits<{
  'update-disable-primary-button': [value: boolean];
  'reset-widget': [];
}>();

const widgetsStore = useWidgets();
const { currentWidgetEditing } = storeToRefs(widgetsStore);

const initialConfigStringfy = ref('');
const config = ref<Record<string, any> | null>(null);
const isCurrentFormValid = ref(false);

const widgetConfig = computed(() => currentWidgetEditing.value.config);

const currentFormComponent = computed(() => {
  const componentMap: Record<string, unknown> = {
    executions: FormExecutions,
    flow_result: FormFlowResult,
    data_crossing: FormDataCrossing,
  };

  return componentMap[props.type] || null;
});

const currentFormEvents = computed(() => {
  const defaultEvents = {
    'update:is-valid-form': (isValid: boolean) => {
      isCurrentFormValid.value = !!isValid;
    },
  };

  const mappingEvents: Record<string, Record<string, unknown>> = {};

  return { ...defaultEvents, ...mappingEvents[props.type] };
});

const isAllFieldsValid = computed(
  () => config.value?.name && isCurrentFormValid.value,
);

const disableResetWidgetButton = computed(() =>
  checkDeepEmptyValues(widgetConfig.value),
);

const initializeConfigString = () => {
  if (config.value && !initialConfigStringfy.value) {
    initialConfigStringfy.value = JSON.stringify(widgetConfig.value);
  }
};

const updatePrimaryButtonState = () => {
  const disablePrimaryButton =
    initialConfigStringfy.value === JSON.stringify(widgetConfig.value) ||
    !isAllFieldsValid.value;

  emit('update-disable-primary-button', disablePrimaryButton);
};

watch(
  config,
  (newConfig) => {
    widgetsStore.updateCurrentWidgetEditingConfig({
      ...widgetConfig.value,
      ...newConfig,
    });
  },
  { deep: true },
);

watch(widgetConfig, updatePrimaryButtonState, { deep: true });
watch(isAllFieldsValid, updatePrimaryButtonState);

config.value = {
  ...widgetConfig.value,
  type: props.type,
  friendly_id: widgetConfig.value.friendly_id || '',
};
initializeConfigString();

defineExpose({
  config,
  isCurrentFormValid,
  widgetConfig,
  currentFormComponent,
  isAllFieldsValid,
  disableResetWidgetButton,
  updatePrimaryButtonState,
});
</script>
