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
    @select-date="selectedDates = $event"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import moment from 'moment';

import { useDashboards } from '@/store/modules/dashboards';

defineOptions({ name: 'FilterDate' });

interface FilterDateProps {
  modelValue?: Record<string, unknown>;
  className?: string;
  disabled?: boolean;
}

withDefaults(defineProps<FilterDateProps>(), {
  modelValue: () => ({}),
  className: '',
  disabled: false,
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
  return moment().subtract(89, 'days').format('YYYY-MM-DD');
});

const maxDate = computed(() => {
  if (isConversationalDashboard.value) {
    return moment().subtract(1, 'days').format('YYYY-MM-DD');
  }
  return moment().format('YYYY-MM-DD');
});

const periodBaseDate = computed(() => {
  if (isConversationalDashboard.value) {
    return moment().subtract(1, 'day').format('YYYY-MM-DD');
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
