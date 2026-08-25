<template>
  <section>
    <UnnnicLabel :label="$t('drawers.config_card.flow_result.label')" />
    <UnnnicSelect
      v-bind="$attrs"
      :modelValue="flowResult"
      :disabled="!flowResults.length"
      :options="flowResultsOptions"
      enableSearch
      :search="searchText"
      :placeholder="$t('drawers.config_card.flow_result.placeholder')"
      itemLabel="label"
      itemValue="value"
      @update:model-value="handleSelect"
      @update:search="searchText = $event"
    />
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { useProject } from '@/store/modules/project';

defineOptions({ name: 'SelectFlowResult' });

interface SelectFlowResultProps {
  modelValue?: unknown[] | string | Record<string, unknown>;
  flow: string;
}

const props = withDefaults(defineProps<SelectFlowResultProps>(), {
  modelValue: () => [],
});

const emit = defineEmits<{
  'update:model-value': [value: string];
}>();

const projectStore = useProject();
const { flows: projectFlows } = storeToRefs(projectStore);

const flowResultsOptions = ref<unknown[]>([]);
const flowResult = ref('');
const searchText = ref('');

const flowResults = computed(
  () =>
    projectFlows.value.find(
      (flow: { value: string; results?: unknown[] }) =>
        flow.value === props.flow,
    )?.results || [],
);

const handleSelect = (value: string) => {
  flowResult.value = value;
};

const treatModelValue = () => {
  const { modelValue } = props;

  if (!modelValue) {
    flowResult.value = '';
    return;
  }

  if (typeof modelValue === 'string') {
    flowResult.value = modelValue;
    return;
  }

  if (Array.isArray(modelValue) && modelValue.length) {
    flowResult.value = (modelValue[0] as { value?: string })?.value || '';
    return;
  }

  if (typeof modelValue === 'object') {
    flowResult.value = (modelValue as { value?: string }).value || '';
    return;
  }

  flowResult.value = '';
};

const updateFlowResultsOptions = () => {
  flowResultsOptions.value = [...flowResults.value];
  flowResult.value = '';
  searchText.value = '';
};

watch(
  () => props.modelValue,
  () => {
    treatModelValue();
  },
);

watch(
  () => props.flow,
  () => {
    updateFlowResultsOptions();
  },
);

watch(flowResult, (newResult) => {
  emit('update:model-value', newResult || '');
});

updateFlowResultsOptions();
treatModelValue();
</script>
