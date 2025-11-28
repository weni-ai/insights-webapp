<template>
  <component
    :is="currentComponent"
    v-bind="componentProps"
  />
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import moment from 'moment';

import DynamicHeaderHumanService from './DynamicHeaderHumanService.vue';
import DynamicHeaderHumanSupportMonitoring from './DynamicHeaderHumanSupportMonitoring.vue';
import DynamicHeaderHumanSupportAnalysis from './DynamicHeaderHumanSupportAnalysis.vue';
import DynamicHeaderConversational from './DynamicHeaderConversational.vue';
import DynamicHeaderDefault from './DynamicHeaderDefault.vue';
import { useDashboards } from '@/store/modules/dashboards';
import { useFeatureFlag } from '@/store/modules/featureFlag';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';

const props = defineProps({
  dashboardType: {
    type: String,
    required: true,
  },
});

const componentMap = {
  human_service: DynamicHeaderHumanService,
  human_support_monitoring: DynamicHeaderHumanSupportMonitoring,
  human_support_analysis: DynamicHeaderHumanSupportAnalysis,
  conversational: DynamicHeaderConversational,
  metaTemplateMessage: DynamicHeaderDefault,
  default: DynamicHeaderDefault,
};

const dashboardsStore = useDashboards();
const { currentDashboard, currentDashboardFilters, appliedFilters } =
  storeToRefs(dashboardsStore);

const humanSupportStore = useHumanSupport();
const { activeTab } = storeToRefs(humanSupportStore);

const featureFlagStore = useFeatureFlag();

const route = useRoute();

const isHumanServiceDashboard = computed(
  () => currentDashboard.value?.name === 'human_service_dashboard.title',
);

const isHumanSupportDashboard = computed(
  () => currentDashboard.value?.name === 'human_support_dashboard.title',
);

const isHumanSupportMonitoringDashboard = computed(() => {
  const isMonitoring = activeTab.value === 'monitoring';
  return isHumanSupportDashboard.value && isMonitoring;
});

const isConversationalDashboard = computed(
  () => currentDashboard.value?.name === 'conversations_dashboard.title',
);

const showTagLive = computed(() => {
  if (isHumanSupportMonitoringDashboard.value) {
    return true;
  }

  const dateFilter = currentDashboardFilters.value.find(
    (filter) => filter.type === 'date_range',
  );

  const { query } = route;
  const today = moment().format('YYYY-MM-DD');

  const filteringDateValues = Object.values(
    appliedFilters.value[dateFilter?.name] || {},
  );

  const isFilteringToday = filteringDateValues.every(
    (filterDate) => filterDate === today,
  );

  return !query[dateFilter?.name] || isFilteringToday;
});

const hasFilters = computed(() => !!currentDashboardFilters.value.length);

const isRenderInsightButton = computed(() => isHumanServiceDashboard.value);

const isRenderHumanSupportBtnExport = computed(
  () => isHumanServiceDashboard.value || isHumanSupportDashboard.value,
);

const isRenderConversationalBtnExport = computed(() => {
  const isFeatureFlagEnabled = featureFlagStore.isFeatureFlagEnabled(
    'insightsConversationsReport',
  );

  return isConversationalDashboard.value && isFeatureFlagEnabled;
});

const currentComponent = computed(() => {
  return componentMap[props.dashboardType] || DynamicHeaderDefault;
});

const componentProps = computed(() => ({
  showTagLive: showTagLive.value,
  hasFilters: hasFilters.value,
  isRenderInsightButton: isRenderInsightButton.value,
  isRenderHumanSupportBtnExport: isRenderHumanSupportBtnExport.value,
  isRenderConversationalBtnExport: isRenderConversationalBtnExport.value,
}));
</script>
