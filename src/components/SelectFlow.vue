<template>
  <section>
    <UnnnicLabel
      data-testid="select-flow-label"
      :label="$t('drawers.config_card.select_origin_flow')"
    />
    <UnnnicSelect
      v-bind="$attrs"
      v-model="flow"
      :options="flowsOptions"
      enableSearch
      :search="searchText"
      :placeholder="$t('drawers.config_funnel.select_flow')"
      itemLabel="label"
      itemValue="value"
      @update:search="searchText = $event"
    />
  </section>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { useProject } from '@/store/modules/project';

defineOptions({ name: 'SelectFlow' });

interface SelectFlowProps {
  modelValue?: unknown[] | string | Record<string, unknown>;
}

const props = withDefaults(defineProps<SelectFlowProps>(), {
  modelValue: () => [],
});

const emit = defineEmits<{
  'update:model-value': [value: string];
}>();

const projectStore = useProject();
const { flows: projectFlows } = storeToRefs(projectStore);

const flowsOptions = ref<unknown[]>([]);
const flow = ref('');
const searchText = ref('');

const treatModelValue = () => {
  const { modelValue } = props;

  if (!modelValue || (Array.isArray(modelValue) && !modelValue.length)) {
    flow.value = '';
    return;
  }

  if (typeof modelValue === 'string') {
    flow.value = modelValue;
    return;
  }

  if (Array.isArray(modelValue) && modelValue.length) {
    flow.value = (modelValue[0] as { value?: string })?.value || '';
    return;
  }

  if (typeof modelValue === 'object') {
    flow.value = (modelValue as { value?: string }).value || '';
    return;
  }

  flow.value = '';
};

watch(flow, (newFlow) => {
  emit('update:model-value', newFlow || '');
});

watch(
  () => props.modelValue,
  () => {
    treatModelValue();
  },
);

watch(projectFlows, () => {
  flowsOptions.value = [...projectFlows.value];
  treatModelValue();
});

flowsOptions.value = [...projectFlows.value];
treatModelValue();
</script>

<style lang="scss">
.unnnic-popover {
  background-color: $unnnic-color-background-snow;
}
</style>
