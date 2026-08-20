<template>
  <FormAccordion
    :title="title"
    :active="active"
    :validConfig="isValidConfig"
    highlighted
    @update:active="$emit('update:active', $event)"
  >
    <template #content>
      <section class="subwidget-form">
        <SelectFlow
          v-model="configLocal.flow.uuid"
          data-testid="select-flow"
        />

        <RadioList
          v-model:selectedRadio="configLocal.result_type"
          :label="$t('drawers.config_card.result_type')"
          :radios="result_types"
          :wrap="false"
          data-testid="radio-list-result-type"
        />

        <template v-if="configLocal.result_type === 'flow_result'">
          <SelectFlowResult
            v-model="configLocal.flow.result"
            :flow="configLocal.flow?.uuid"
            :disabled="!configLocal.flow?.uuid"
            data-testid="select-flow-result"
          />

          <RadioList
            v-model:selectedRadio="configLocal.operation"
            :radios="operations"
            data-testid="radio-list-operation"
          />
        </template>
      </section>
    </template>
  </FormAccordion>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import FormAccordion from '@/components/FormAccordion.vue';
import SelectFlow from '@/components/SelectFlow.vue';
import RadioList from '@/components/RadioList.vue';
import SelectFlowResult from '@/components/SelectFlowResult.vue';

defineOptions({ name: 'SubWidget' });

interface SubWidgetConfig {
  result_type: string;
  operation: string;
  flow: {
    uuid: string;
    result: string;
    result_correspondence: string;
  };
}

interface SubWidgetProps {
  config: SubWidgetConfig;
  title?: string;
  active?: boolean;
}

const props = withDefaults(defineProps<SubWidgetProps>(), {
  title: '',
  active: false,
});

const emit = defineEmits<{
  'update:active': [value: boolean];
  'update:model-value': [value: unknown];
  'update:config': [config: SubWidgetConfig];
  'is-valid-form': [isValid: boolean];
}>();

const { t } = useI18n();

const configLocal = reactive(props.config);

const result_types = [
  {
    value: 'executions',
    label: t('drawers.config_card.radios.executions'),
  },
  {
    value: 'flow_result',
    label: t('drawers.config_card.radios.results'),
  },
];

const operations = [
  {
    value: 'sum',
    label: t('drawers.config_card.radios.sum'),
  },
  {
    value: 'avg',
    label: t('drawers.config_card.radios.avg'),
  },
  {
    value: 'min',
    label: t('drawers.config_card.radios.min'),
  },
  {
    value: 'max',
    label: t('drawers.config_card.radios.max'),
  },
];

const isValidConfig = computed(() => {
  const mapValidations: Record<string, boolean> = {
    executions: true,
    flow_result: !!configLocal.flow.result && !!configLocal.operation,
  };
  return !!configLocal.flow.uuid && mapValidations[configLocal.result_type];
});

watch(
  configLocal,
  (newConfig) => {
    const treatedConfig = {
      ...newConfig,
      operation:
        newConfig.result_type === 'executions' ? 'count' : newConfig.operation,
    };

    emit('update:config', treatedConfig);
  },
  { deep: true },
);

watch(
  isValidConfig,
  (newIsValid) => {
    emit('is-valid-form', newIsValid);
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.subwidget-form {
  display: grid;
  gap: $unnnic-space-2;
}
</style>
