<template>
  <FilterDate
    :modelValue="appliedDateRange"
    className="date-filter"
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

<style lang="scss" scoped>
.date-filter {
  min-width: 316px;
}
</style>
