<template>
  <UnnnicMultiSelect
    ref="multiSelectRef"
    data-testid="unnnic-multi-select"
    :modelValue="treatedModelValue"
    :options="optionsWithAll"
    :placeholder="placeholder"
    :disabled="disabled"
    returnObject
    enableSearch
    :search="searchValue"
    @update:model-value="updateModelValue"
    @update:search="searchValue = $event"
  />
</template>

<script setup>
import { ref, computed, watch, onMounted, useTemplateRef } from 'vue';
import { UnnnicMultiSelect } from '@weni/unnnic-system';

import { useSectors } from '@/store/modules/sectors';

import Projects from '@/services/api/resources/projects';

import { compareEquals } from '@/utils/array';

const props = defineProps({
  modelValue: {
    type: [Object, String],
    default: () => {},
  },
  placeholder: {
    type: String,
    default: '',
  },
  source: {
    type: String,
    default: '',
  },
  dependsOn: {
    type: [Object, undefined],
    default: undefined,
  },
  dependsOnValue: {
    type: Object,
    default: null,
  },
  keyValueField: {
    type: String,
    default: '',
  },
  allLabel: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:model-value', 'on-options-active-change']);

const multiSelectRef = useTemplateRef('multiSelectRef');
const sectorsStore = useSectors();
const { updateSectors } = sectorsStore;

const searchValue = ref('');
const options = ref([]);

const treatedModelValue = computed(() => props.modelValue || []);

const optionsWithAll = computed(() => {
  const baseOptions = [...options.value];
  const hasOptions = baseOptions.length > 0;

  if (props.allLabel && hasOptions) {
    const allOption = {
      value: '__all__',
      label: props.allLabel,
    };
    return [allOption, ...baseOptions];
  }

  return baseOptions;
});

watch(
  () => multiSelectRef.value?.openPopover,
  (newValue) => {
    emit('on-options-active-change', !!newValue);
  },
);

watch(
  () => props.dependsOnValue,
  (newDependsOnValue, oldDependsOnValue) => {
    const newValues = Object.values(newDependsOnValue || {});
    const oldValues = Object.values(oldDependsOnValue || {});
    if (!compareEquals(newValues, oldValues)) {
      const filledDependsOnValue = newValues.every(Boolean);

      if (filledDependsOnValue) {
        clearOptions();
        fetchSource();
      }
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (!props.dependsOn?.search_param && !props.dependsOnValue) fetchSource();
});

async function fetchSource() {
  try {
    const response = await Projects.getProjectSource(
      props.source,
      props.dependsOnValue || {},
    );

    if (props.source === 'sectors') {
      updateSectors(response);
    }

    options.value = (response || []).map((source) => ({
      value: source[props.keyValueField] || source.uuid,
      label: source.name,
    }));
  } catch (e) {
    console.error('getProjectSource error', e);
  }
}

function clearOptions() {
  options.value = [];
}

function updateModelValue(value) {
  if (props.allLabel && value && Array.isArray(value)) {
    const hasAllSelected = value.some((item) => item.value === '__all__');
    const hasOthersSelected = value.some(
      (item) => item.value !== '__all__' && item.value !== '',
    );

    if (hasAllSelected && hasOthersSelected) {
      const allOption = value.find((item) => item.value === '__all__');
      emit('update:model-value', [allOption]);
      return;
    }

    if (
      hasOthersSelected &&
      props.modelValue &&
      Array.isArray(props.modelValue)
    ) {
      const wasAllSelected = props.modelValue.some(
        (item) => item.value === '__all__',
      );
      if (wasAllSelected) {
        const filteredValue = value.filter(
          (item) => item.value !== '__all__' && item.value !== '',
        );
        emit('update:model-value', filteredValue);
        return;
      }
    }
  }

  emit('update:model-value', value);
}

defineExpose({
  options,
  treatedModelValue,
  optionsWithAll,
  clearOptions,
  fetchSource,
  updateModelValue,
  searchValue,
});
</script>
