<template>
  <HeaderTagLive
    v-if="isMonitoring"
    data-testid="insights-layout-header-tag-live"
  />

  <LastUpdatedText v-if="isMonitoring" />

  <HeaderRefresh
    v-if="isMonitoring"
    type="human-support"
  />

  <InsightsLayoutHeaderFilters
    v-if="hasFilters"
    data-testid="insights-layout-header-filters"
  />

  <HumanSupportExport />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import HeaderTagLive from '../HeaderTagLive.vue';
import InsightsLayoutHeaderFilters from '../HeaderFilters/index.vue';
import HumanSupportExport from '../../export/HumanSupportExport.vue';
import LastUpdatedText from '../HeaderFilters/LastUpdatedText.vue';
import HeaderRefresh from '../HeaderRefresh.vue';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { useDashboards } from '@/store/modules/dashboards';

const humanSupportStore = useHumanSupport();
const { activeTab } = storeToRefs(humanSupportStore);

const dashboardsStore = useDashboards();
const { currentDashboardFilters } = storeToRefs(dashboardsStore);

const isMonitoring = computed(() => activeTab.value === 'monitoring');

const hasFilters = computed(() => !!currentDashboardFilters.value.length);
</script>
