<template>
  <FilterDate
    :modelValue="appliedDateRange"
    :placeholder="$t('human_support.filters.date_range')"
    @update:model-value="handleUpdateModelValue"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import FilterDate from '@/components/insights/Layout/HeaderFilters/FilterDate.vue';
import {
  useHumanSupport,
  type DateRange,
} from '@/store/modules/humanSupport/humanSupport';

const humanSupportStore = useHumanSupport();
const { appliedDateRange } = storeToRefs(humanSupportStore);

const handleUpdateModelValue = (value: DateRange) => {
  humanSupportStore.appliedDateRange = value;
};
</script>
