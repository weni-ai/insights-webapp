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

import HeaderHumanService from './Headers/HeaderHumanService.vue';
import HeaderHumanSupport from './Headers/HeaderHumanSupport.vue';
import HeaderConversational from './Headers/HeaderConversational.vue';
import HeaderDefault from './Headers/HeaderDefault.vue';
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
  human_service: HeaderHumanService,
  human_support: HeaderHumanSupport,
  conversational: HeaderConversational,
  metaTemplateMessage: HeaderDefault,
  default: HeaderDefault,
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
  return componentMap[props.dashboardType] || HeaderDefault;
});

const componentProps = computed(() => {
  const defaultProps = {
    hasFilters: hasFilters.value,
    isRenderInsightButton: isRenderInsightButton.value,
    isRenderHumanSupportBtnExport: isRenderHumanSupportBtnExport.value,
    isRenderConversationalBtnExport: isRenderConversationalBtnExport.value,
  };

  const mappingProps = {
    human_service: {
      ...defaultProps,
      showTagLive: showTagLive.value,
    },
    human_support: {
      ...defaultProps,
      showTagLive: showTagLive.value,
    },
    conversational: defaultProps,
  };

  return mappingProps[props.dashboardType] || defaultProps;
});
</script>
