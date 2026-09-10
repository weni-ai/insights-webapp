<template>
  <DateFilter v-if="showDateFilter" />
  <FiltersDropdown />
</template>

<script setup lang="ts">
import FiltersDropdown from '@/components/insights/humanSupport/Header/FiltersDropdown.vue';
import DateFilter from '@/components/insights/humanSupport/Header/DateFilter.vue';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { computed } from 'vue';

const humanSupportStore = useHumanSupport();

const showDateFilter = computed(() => {
  return ['analysis', 'sales'].includes(humanSupportStore.activeTab);
});
</script>
