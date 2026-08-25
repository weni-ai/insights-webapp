<template>
  <SubWidget
    v-for="(subwidget, index) of subwidgets"
    :key="subwidget.title"
    :title="subwidget.title"
    :config="subwidget.config"
    :active="activeSubwidget === index"
    @update:config="updateSubwidget(index + 1, $event)"
    @update:active="updateActiveSubwidget(index, $event)"
    @is-valid-form="updateSubwigetValid(index, $event)"
  />

  <RadioList
    v-model:selectedRadio="config.operation"
    :label="$t('drawers.config_card.operation')"
    :radios="operations"
  />

  <CheckboxList
    :label="$t('drawers.config_card.format')"
    :checkboxes="formatations"
    @update:checkboxes="updateFormatations"
  />
</template>
<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import { useWidgets } from '@/store/modules/widgets';
import RadioList from '@/components/RadioList.vue';
import CheckboxList from '@/components/CheckboxList.vue';
import SubWidget from './SubWidget.vue';

defineOptions({ name: 'FormDataCrossing' });

const emit = defineEmits<{
  'update:is-valid-form': [value: boolean];
}>();

const { t } = useI18n();
const widgetsStore = useWidgets();
const { currentWidgetEditing } = storeToRefs(widgetsStore);

const config = ref<Record<string, any> | null>(null);
const subwidgets = ref<any[] | null>(null);
const activeSubwidget = ref<number | null>(null);
const isSubwidgetsValids = ref({
  subwidget_1: false,
  subwidget_2: false,
});

const operations = [
  {
    value: 'multiply',
    label: t('drawers.config_card.radios.multiply'),
  },
  {
    value: 'sum',
    label: t('drawers.config_card.radios.sum'),
  },
  {
    value: 'sub',
    label: t('drawers.config_card.radios.difference'),
  },
  {
    value: 'percentage',
    label: t('drawers.config_card.radios.percentage'),
  },
];

const widgetConfig = computed(() => currentWidgetEditing.value.config);

const formatations = computed(() => [
  {
    value: 'currency',
    selected: config.value?.currency,
    label: t('drawers.config_card.checkbox.currency'),
    disabled: config.value?.operation === 'percentage',
  },
]);

const isValidForm = computed(() => {
  const currentConfig = config.value;

  return !!(
    Object.values(isSubwidgetsValids.value).every((subwiget) => !!subwiget) &&
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

    if (newConfig?.operation === 'percentage') config.value.currency = false;
  },
  { deep: true },
);

watch(
  () => config.value?.flow?.uuid,
  (_newFlow, oldFlow) => {
    if (typeof oldFlow === 'object') {
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

const createFlowConfig = (flowConfig: Record<string, any> | undefined) => ({
  uuid: flowConfig?.uuid || '',
  result: flowConfig?.result || '',
});

const createSubwidgetConfig = (
  subwidgetConfig: Record<string, any> | undefined,
) => ({
  result_type: subwidgetConfig?.result_type || 'executions',
  operation: subwidgetConfig?.operation || 'avg',
  flow: {
    ...createFlowConfig(subwidgetConfig?.flow),
    result_correspondence: subwidgetConfig?.result_correspondence || '',
  },
});

const handleConfig = () => {
  const currentWidgetConfig = widgetConfig.value;

  config.value = {
    subwidget_1: createSubwidgetConfig(currentWidgetConfig.subwidget_1),
    subwidget_2: createSubwidgetConfig(currentWidgetConfig.subwidget_2),
    operation: currentWidgetConfig.operation || 'percentage',
    currency: currentWidgetConfig.currency || false,
  };

  subwidgets.value = [
    {
      title: t('drawers.config_card.first_value'),
      config: config.value.subwidget_1,
    },
    {
      title: t('drawers.config_card.second_value'),
      config: config.value.subwidget_2,
    },
  ];
};

const updateSubwidget = (id: number, value: Record<string, any>) => {
  config.value[`subwidget_${id}`] = value;
};

const updateActiveSubwidget = (index: number, isActive: boolean) => {
  if (isActive) {
    activeSubwidget.value = index;
  }
  if (activeSubwidget.value === index && !isActive) {
    activeSubwidget.value = null;
  }
};

const updateSubwigetValid = (index: number, isValid: boolean) => {
  isSubwidgetsValids.value[`subwidget_${index + 1}`] = isValid;
};

const updateFormatations = (
  newFormatations: { value: string; selected: boolean }[],
) => {
  newFormatations.forEach((formatation) => {
    config.value[formatation.value] = formatation.selected;
  });
};

handleConfig();

nextTick().then(() => {
  activeSubwidget.value = 0;
});

defineExpose({
  config,
  subwidgets,
  activeSubwidget,
  isSubwidgetsValids,
  operations,
  widgetConfig,
  formatations,
  isValidForm,
  updateSubwidget,
  updateActiveSubwidget,
  updateSubwigetValid,
  updateFormatations,
});
</script>
