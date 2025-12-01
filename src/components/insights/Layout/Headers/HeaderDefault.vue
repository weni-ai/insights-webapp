<template>
  <InsightsLayoutHeaderFilters
    v-if="hasFilters"
    data-testid="insights-layout-header-filters"
  />

  <HeaderDashboardSettings />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import InsightsLayoutHeaderFilters from '../HeaderFilters/index.vue';
import HeaderDashboardSettings from '../HeaderDashboardSettings.vue';
import { useDashboards } from '@/store/modules/dashboards';

const dashboardsStore = useDashboards();
const { currentDashboardFilters } = storeToRefs(dashboardsStore);

const hasFilters = computed(() => !!currentDashboardFilters.value.length);
</script>
