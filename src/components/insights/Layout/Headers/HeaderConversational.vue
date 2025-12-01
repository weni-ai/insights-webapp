<template>
  <InsightsLayoutHeaderFilters
    v-if="hasFilters"
    data-testid="insights-layout-header-filters"
  />

  <HeaderRefresh type="conversations" />

  <ConversationalExport v-if="isRenderConversationalBtnExport" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import InsightsLayoutHeaderFilters from '../HeaderFilters/index.vue';
import HeaderRefresh from '../HeaderRefresh.vue';
import ConversationalExport from '../../export/ConversationalExport.vue';
import { useDashboards } from '@/store/modules/dashboards';
import { useFeatureFlag } from '@/store/modules/featureFlag';

const dashboardsStore = useDashboards();
const { currentDashboardFilters } = storeToRefs(dashboardsStore);

const featureFlagStore = useFeatureFlag();

const hasFilters = computed(() => !!currentDashboardFilters.value.length);

const isRenderConversationalBtnExport = computed(() => {
  const isFeatureFlagEnabled = featureFlagStore.isFeatureFlagEnabled(
    'insightsConversationsReport',
  );

  return isFeatureFlagEnabled;
});
</script>
