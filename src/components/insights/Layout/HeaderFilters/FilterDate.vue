<template>
  <UnnnicInputDatePicker
    :class="['filter-date', className]"
    data-testid="filter-date"
    :modelValue="modelValue"
    :inputFormat="$t('date_format')"
    size="md"
    position="right"
    :minDate="minDate"
    :maxDate="maxDate"
    :periodBaseDate="periodBaseDate"
    :disabled="disabled"
    disableClear
    :options="shortcuts"
    useDateFns
    @select-date="selectedDates = $event"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { format, subDays } from 'date-fns';

import { useDashboards } from '@/store/modules/dashboards';
import { UnnnicInputDatePicker } from '@weni/unnnic-system';

defineOptions({ name: 'FilterDate' });

interface FilterDateProps {
  modelValue?: Record<string, unknown>;
  className?: string;
  disabled?: boolean;
  shortcuts?: { name: string; id: string }[];
}

withDefaults(defineProps<FilterDateProps>(), {
  modelValue: () => ({}),
  className: '',
  disabled: false,
  shortcuts: () => [],
});

defineEmits<{
  'update:modelValue': [value: unknown];
}>();

const dashboardsStore = useDashboards();
const { currentDashboard } = storeToRefs(dashboardsStore);

const selectedDates = ref({ start: '', end: '' });

const isHumanServiceDashboard = computed(
  () => currentDashboard.value?.name === 'human_support_dashboard.title',
);

const isConversationalDashboard = computed(
  () => currentDashboard.value?.name === 'conversations_dashboard.title',
);

const minDate = computed(() => {
  if (isHumanServiceDashboard.value) return undefined;
  if (isConversationalDashboard.value) return undefined;
  return format(subDays(new Date(), 89), 'yyyy-MM-dd');
});

const maxDate = computed(() => {
  if (isConversationalDashboard.value) {
    return format(subDays(new Date(), 1), 'yyyy-MM-dd');
  }
  return format(new Date(), 'yyyy-MM-dd');
});

const periodBaseDate = computed(() => {
  if (isConversationalDashboard.value) {
    return format(subDays(new Date(), 1), 'yyyy-MM-dd');
  }
  return null;
});
</script>

<style lang="scss" scoped>
// .dropdown class comes from the unnnic component and is used here to override its style
.filter-date.dropdown {
  display: grid;
  height: 100%;
  z-index: 3;
}
</style>
