<template>
  <LastUpdatedText v-if="isMonitoring" />

  <HeaderRefresh
    v-if="isMonitoring"
    type="human-support"
    :forceDisabled="!hasSectorsConfigured"
  />

  <InsightsLayoutHeaderFilters
    v-if="hasFilters"
    data-testid="insights-layout-header-filters"
  />

  <HumanSupportExport />

  <OperationalAlertsButton v-if="showOperationalAlerts" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import InsightsLayoutHeaderFilters from '../HeaderFilters/index.vue';
import HumanSupportExport from '../../export/HumanSupportExport.vue';
import LastUpdatedText from '../HeaderFilters/LastUpdatedText.vue';
import HeaderRefresh from '../HeaderRefresh.vue';
import OperationalAlertsButton from '../../humanSupport/Header/OperationalAlertsButton.vue';

import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { useDashboards } from '@/store/modules/dashboards';
import { useProject } from '@/store/modules/project';
import { useFeatureFlag } from '@/store/modules/featureFlag';

const projectStore = useProject();
const { hasSectorsConfigured } = storeToRefs(projectStore);

const humanSupportStore = useHumanSupport();
const { activeTab } = storeToRefs(humanSupportStore);

const dashboardsStore = useDashboards();
const { currentDashboardFilters } = storeToRefs(dashboardsStore);

const { isFeatureFlagEnabled } = useFeatureFlag();

const isMonitoring = computed(() => activeTab.value === 'monitoring');

const hasFilters = computed(() => !!currentDashboardFilters.value.length);

const showOperationalAlerts = computed(
  () =>
    isMonitoring.value && isFeatureFlagEnabled('insights-operational-alerts'),
);
</script>
