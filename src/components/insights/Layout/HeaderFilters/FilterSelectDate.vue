<template>
  <UnnnicSelectSmart
    v-model="currentDate"
    :options="dates"
    size="md"
    class="filter-date"
    :orderedByIndex="true"
    @update:model-value="updateCurrentDate"
  />
</template>

<script setup>
import {
  getYesterdayDate,
  getLastNDays,
  getLastMonthRange,
} from '@/utils/time';
import { defineProps, defineEmits, computed, ref } from 'vue';
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

const currentDate = ref([props.modelValue]);

const dates = computed(() => [
  createDateOption(
    i18n.global.t('select_date.yesterday', {
      date: dateRanges.yesterday.dmFormat,
    }),
    dateRanges.yesterday,
  ),
  ...[7, 14, 30, 90].map((days) =>
    createDateOption(
      i18n.global.t('select_date.last_days', {
        value: days,
        date: dateRanges[`last${days}Days`].dmFormat,
      }),
      dateRanges[`last${days}Days`],
    ),
  ),
  createDateOption(
    i18n.global.t('select_date.previous_month', {
      date: dateRanges.lastMonth.dmFormat,
    }),
    dateRanges.lastMonth,
  ),
]);

const createDateOption = (label, range) => ({
  label,
  value: {
    start: range.start,
    end: range.end,
  },
});

const updateCurrentDate = (option) => {
  currentDate.value = option;
  emit('update:modelValue', option[0].value);
};
</script>

<style lang="scss" scoped>
.filter-date {
  :deep(.input) {
    color: $unnnic-color-neutral-darkest;

    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-style: normal;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-line-height-large * 1.375;
  }

  :deep(.unnnic-select-smart-option--selectable) {
    &:hover {
      color: $unnnic-color-weni-600;
      font-weight: $unnnic-font-weight-bold;
    }

    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-style: normal;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-line-height-large * 1.375;
  }
}
</style>
