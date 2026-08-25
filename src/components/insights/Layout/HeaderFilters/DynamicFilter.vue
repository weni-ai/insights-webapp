<template>
  <section class="dynamic-filter">
    <UnnnicLabel
      v-if="filter.label"
      :label="filter.label ? $t(filter.label) : ''"
    />
    <component
      :is="currentComponent"
      v-bind="filterProps"
      v-on="filterEvents"
      @update:model-value="updateModelValue"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import FilterDate from './FilterDate.vue';
import FilterInputText from './FilterInputText.vue';
import FilterSelect from './FilterSelect.vue';
import FilterSelectDate from './FilterSelectDate.vue';
import FilterMultiSelect from './FilterMultiSelect.vue';

import { findMatchingDate } from '@/utils/time';

defineOptions({ name: 'DynamicFilter' });

interface DynamicFilterProps {
  modelValue?: Record<string, any> | string | null;
  filter?: Record<string, any>;
  dependsOnValue?: Record<string, any>;
  disabled?: boolean;
}

const props = withDefaults(defineProps<DynamicFilterProps>(), {
  modelValue: null,
  filter: () => ({}),
  dependsOnValue: () => ({}),
  disabled: false,
});

const emit = defineEmits<{
  'update:model-value': [value: unknown];
}>();

const { t } = useI18n();

const type = computed(() => {
  if (props.filter.name === 'sector' && props.filter.type === 'select') {
    return 'select_multi';
  }

  return props.filter.type;
});

const currentComponent = computed(() => {
  const componentMap: Record<string, unknown> = {
    select_date_range: FilterSelectDate,
    date_range: FilterDate,
    input_text: FilterInputText,
    select: FilterSelect,
    select_multi: FilterMultiSelect,
  };

  return componentMap[type.value] || null;
});

const treatedModelValue = computed(() => {
  const { modelValue, filter } = props;

  const dateModel = {
    start: modelValue?.[filter.start_sufix],
    end: modelValue?.[filter.end_sufix],
  };

  const modelValuesMap: Record<string, unknown> = {
    date_range: dateModel,
    select_date_range: dateModel,
    select_multi: modelValue,
  };

  return modelValuesMap[filter.type] || modelValue;
});

const filterProps = computed(() => {
  const { disabled } = props;

  const {
    type: filterType,
    placeholder,
    source,
    depends_on,
    key_value_field,
    next,
    shortCutOptions,
    disableClear,
  } = props.filter;

  const defaultProps = {
    placeholder: placeholder ? t(placeholder) : '',
    modelValue: treatedModelValue.value,
    disabled,
    dependsOn: depends_on,
    dependsOnValue: props.dependsOnValue,
  };

  const treatedModelValueWithLabel =
    treatedModelValue.value && (treatedModelValue.value as any).start
      ? findMatchingDate(treatedModelValue.value, t)
      : {
          label: '-',
          value: {
            start: '',
            end: '',
          },
        };
  const mappingProps: Record<string, Record<string, unknown>> = {
    select_date_range: {
      modelValue: treatedModelValueWithLabel,
    },
    date_range: {
      modelValue: treatedModelValue.value,
      next,
      options: shortCutOptions,
      disableClear,
    },
    input_text: {},
    select: {
      source,
      keyValueField: key_value_field,
    },
    select_multi: {
      source,
      keyValueField: key_value_field,
    },
  };

  return { ...defaultProps, ...mappingProps[filterType] };
});

const filterEvents = computed(() => {
  const { type: filterType } = props.filter;
  const mappingEvents: Record<string, unknown> = {};

  return mappingEvents[filterType] || {};
});

const updateModelValue = (value: any) => {
  const dateModel = {
    [props.filter.start_sufix]: value?.start,
    [props.filter.end_sufix]: value?.end,
  };

  const modelValuesMap: Record<string, unknown> = {
    select_date_range: dateModel,
    date_range: dateModel,
    select: value,
    select_multi: value,
  };

  emit('update:model-value', modelValuesMap[type.value] || value);
};

defineExpose({
  type,
  currentComponent,
  treatedModelValue,
  filterProps,
  filterEvents,
  updateModelValue,
});
</script>

<style lang="scss" scoped>
.dynamic-filter {
  display: flex;
  flex-direction: column;

  :deep(.unnnic-label__label),
  :deep(.unnnic-form__label) {
    margin: 0 0 $unnnic-space-1;
  }
}
</style>
