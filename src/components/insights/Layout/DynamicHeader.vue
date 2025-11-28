<template>
  <component
    :is="currentComponent"
    v-bind="componentProps"
  />
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue';
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

type DashboardHeaderType =
  | 'human_service'
  | 'human_support'
  | 'conversational'
  | 'metaTemplateMessage'
  | 'custom';

interface DynamicHeaderProps {
  dashboardType: DashboardHeaderType;
}

interface HeaderBaseProps {
  hasFilters: boolean;
}

interface HeaderPropsWithAllFilters extends HeaderBaseProps {
  showTagLive: boolean;
  isRenderInsightButton: boolean;
  isRenderHumanSupportBtnExport: boolean;
  isRenderConversationalBtnExport: boolean;
}

type HeaderProps = HeaderBaseProps | HeaderPropsWithAllFilters;

const props = defineProps<DynamicHeaderProps>();

const componentMap: Record<DashboardHeaderType, Component> = {
  human_service: HeaderHumanService,
  human_support: HeaderHumanSupport,
  conversational: HeaderConversational,
  metaTemplateMessage: HeaderDefault,
  custom: HeaderDefault,
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

const currentComponent = computed<Component>(() => {
  return componentMap[props.dashboardType] || HeaderDefault;
});

const componentProps = computed<HeaderProps>(() => {
  const defaultProps: HeaderBaseProps = {
    hasFilters: hasFilters.value,
  };

  const mappingProps: Partial<Record<DashboardHeaderType, HeaderProps>> = {
    human_service: {
      ...defaultProps,
      showTagLive: showTagLive.value,
      isRenderInsightButton: isRenderInsightButton.value,
      isRenderHumanSupportBtnExport: isRenderHumanSupportBtnExport.value,
    },
    human_support: {
      ...defaultProps,
      showTagLive: showTagLive.value,
      isRenderHumanSupportBtnExport: isRenderHumanSupportBtnExport.value,
    },
    conversational: {
      ...defaultProps,
      isRenderConversationalBtnExport: isRenderConversationalBtnExport.value,
    },
    custom: defaultProps,
  };

  return mappingProps[props.dashboardType] || defaultProps;
});
</script>
