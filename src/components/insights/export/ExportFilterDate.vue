<template>
  <section
    class="export-filter-date"
    data-testid="export-filter-date"
  >
    <UnnnicLabel :label="label" />
    <FilterDate
      data-testid="export-filter-date-picker"
      :modelValue="modelValue"
      :placeholder="placeholder"
      :options="options"
      :minDate="minDate"
      :maxDate="maxDate"
      @update:model-value="handleUpdateModelValue"
      @select-date="handleDateSelect"
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
  'select-date': [value: DateRange];
}>();

const handleUpdateModelValue = (value: DateRange): void => {
  emit('update:model-value', value);
};

const handleDateSelect = (value: DateRange): void => {
  emit('select-date', value);
};
</script>

<style scoped lang="scss">
.export-filter-date {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-nano;
}
</style>
