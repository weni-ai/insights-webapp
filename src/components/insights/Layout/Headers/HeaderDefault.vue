<template>
  <InsightsLayoutHeaderFilters
    v-if="hasFilters"
    data-testid="insights-layout-header-filters"
  />

  <HeaderDashboardSettings />
</template>

<script setup>
import InsightsLayoutHeaderFilters from '../HeaderFilters/index.vue';
import HeaderDashboardSettings from '../HeaderDashboardSettings.vue';

defineProps({
  hasFilters: {
    type: Boolean,
    required: true,
  },
});
</script>
