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
import { watch } from 'vue';
import { useRouter } from 'vue-router';

const humanSupportStore = useHumanSupport();
const { appliedDateRange } = storeToRefs(humanSupportStore);

const router = useRouter();
const handleUpdateModelValue = (value: DateRange) => {
  humanSupportStore.appliedDateRange = value;
};

watch(
  appliedDateRange,
  (newVal) => {
    router.push({
      query: {
        ...router.currentRoute.value.query,
        start_date: newVal.start,
        end_date: newVal.end,
      },
    });
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.date-filter {
  min-width: 316px;
  padding-right: $unnnic-space-2;
}
</style>
