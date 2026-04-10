<template>
  <UnnnicSelect
    :modelValue="currentDateId"
    :options="dates"
    class="filter-date"
    itemLabel="label"
    itemValue="id"
    @update:model-value="updateCurrentDate"
  />
</template>

<script setup>
import { defineProps, defineEmits, computed, ref, watch } from 'vue';

import {
  getYesterdayDate,
  getLastNDays,
  getLastMonthRange,
} from '@/utils/time';

import i18n from '@/utils/plugins/i18n';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:modelValue']);

const getDateRanges = () => ({
  yesterday: getYesterdayDate(),
  last7Days: getLastNDays(7),
  last14Days: getLastNDays(14),
  last30Days: getLastNDays(30),
  last90Days: getLastNDays(90),
  lastMonth: getLastMonthRange(),
});

const dateRanges = getDateRanges();

const createDateOption = (id, label, range) => ({
  id,
  label,
  value: {
    start: range.start,
    end: range.end,
  },
});

const dates = computed(() => [
  createDateOption(
    'yesterday',
    i18n.global.t('select_date.yesterday', {
      date: dateRanges.yesterday.dmFormat,
    }),
    dateRanges.yesterday,
  ),
  ...[
    { days: 7, id: 'last7' },
    { days: 14, id: 'last14' },
    { days: 30, id: 'last30' },
    { days: 90, id: 'last90' },
  ].map(({ days, id }) =>
    createDateOption(
      id,
      i18n.global.t('select_date.last_days', {
        value: days,
        date: dateRanges[`last${days}Days`].dmFormat,
      }),
      dateRanges[`last${days}Days`],
    ),
  ),
  createDateOption(
    'lastMonth',
    i18n.global.t('select_date.previous_month', {
      date: dateRanges.lastMonth.dmFormat,
    }),
    dateRanges.lastMonth,
  ),
]);

const findDateIdByValue = (modelValue) => {
  const start = modelValue?.value?.start || modelValue?.start;
  const end = modelValue?.value?.end || modelValue?.end;
  if (!start) return '';
  return (
    dates.value.find((d) => d.value.start === start && d.value.end === end)
      ?.id || ''
  );
};

const currentDateId = ref(findDateIdByValue(props.modelValue));

watch(
  () => props.modelValue,
  (newVal) => {
    const id = findDateIdByValue(newVal);
    if (id && id !== currentDateId.value) {
      currentDateId.value = id;
    }
  },
);

const updateCurrentDate = (id) => {
  currentDateId.value = id;
  const option = dates.value.find((d) => d.id === id);
  if (option) {
    emit('update:modelValue', option.value);
  }
};
</script>

<style lang="scss" scoped>
.filter-date {
  :deep(.unnnic-select__input .unnnic-input__field) {
    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-body;
  }
}
</style>
