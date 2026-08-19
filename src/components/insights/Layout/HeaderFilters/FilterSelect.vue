<template>
  <UnnnicSelect
    :modelValue="modelValue"
    :options="options"
    :placeholder="placeholder"
    itemLabel="label"
    itemValue="value"
    @update:model-value="$emit('update:model-value', $event)"
  />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import Projects from '@/services/api/resources/projects';
import { compareEquals } from '@/utils/array';

defineOptions({ name: 'FilterSelect' });

interface FilterSelectProps {
  modelValue?: Record<string, unknown> | string;
  placeholder?: string;
  source?: string;
  dependsOn?: Record<string, unknown>;
  dependsOnValue?: Record<string, unknown> | null;
  keyValueField?: string;
  fetchRequest?: (..._args: unknown[]) => Promise<unknown[] | null>;
}

const props = withDefaults(defineProps<FilterSelectProps>(), {
  modelValue: () => ({}),
  placeholder: '',
  source: '',
  dependsOn: undefined,
  dependsOnValue: null,
  keyValueField: '',
  fetchRequest: (...params: unknown[]) => {
    return Projects.getProjectSource(...params);
  },
});

defineEmits<{
  'update:model-value': [value: unknown];
}>();

const options = ref([{ value: '', label: props.placeholder }]);

const fetchSource = async () => {
  try {
    const response = await props.fetchRequest(
      props.source,
      props.dependsOnValue || {},
    );
    response?.forEach((source: any) => {
      options.value.push({
        value: source[props.keyValueField] || source.uuid,
        label: source.name,
      });
    });
  } catch (e) {
    console.error('getProjectSource error', e);
  }
};

const clearOptions = () => {
  const optionsPlaceholder = options.value[0];
  options.value = [optionsPlaceholder];
};

watch(
  () => props.dependsOnValue,
  (newDependsOnValue, oldDependsOnValue) => {
    const newValues = Object.values(newDependsOnValue || {});
    const oldValues = Object.values(oldDependsOnValue || {});
    if (!compareEquals(newValues, oldValues)) {
      const filledDependsOnValue = newValues.every((value) => value);
      if (filledDependsOnValue) {
        clearOptions();
        fetchSource();
      }
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (!props.dependsOn?.search_param) fetchSource();
});
</script>

<style lang="scss">
.unnnic-popover {
  background-color: $unnnic-color-background-snow;
}
</style>
