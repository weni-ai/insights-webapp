<template>
  <section class="export-filter-date">
    <UnnnicLabel :label="label" />
    <FilterDate
      :modelValue="modelValue"
      :placeholder="placeholder"
      :options="options"
      :minDate="minDate"
      :maxDate="maxDate"
      @update:model-value="handleUpdateModelValue"
    />
  </section>
</template>

<script setup lang="ts">
import FilterDate from '@/components/insights/Layout/HeaderFilters/FilterDate.vue';

interface DateRange {
  start: string;
  end: string;
}

interface ShortcutOption {
  name: string;
  id: string;
}

interface Props {
  modelValue: DateRange;
  label: string;
  placeholder: string;
  options: ShortcutOption[];
  minDate: string;
  maxDate: string;
}

withDefaults(defineProps<Props>(), {
  modelValue: () => ({ start: '', end: '' }),
  label: '',
  placeholder: '',
  options: () => [],
  minDate: '',
  maxDate: '',
});

const emit = defineEmits<{
  'update:model-value': [value: DateRange];
}>();

const handleUpdateModelValue = (value: DateRange): void => {
  emit('update:model-value', value);
};
</script>

<style scoped lang="scss">
.export-filter-date {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-nano;
}
</style>
