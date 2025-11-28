<template>
  <InsightsLayoutHeaderFilters
    v-if="hasFilters"
    data-testid="insights-layout-header-filters"
  />

  <HeaderDashboardSettings />
</template>

<script setup lang="ts">
import InsightsLayoutHeaderFilters from '../HeaderFilters/index.vue';
import HeaderDashboardSettings from '../HeaderDashboardSettings.vue';

defineProps<{
  hasFilters: boolean;
}>();
</script>
