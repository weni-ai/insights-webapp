<template>
  <component
    :is="currentComponent"
    v-bind="dashboardProps"
    v-on="dashboardEvents"
  />
</template>

<script lang="ts" setup>
import { computed, watch, defineAsyncComponent } from 'vue';
import { useDashboards } from '@/store/modules/dashboards';
import { useWidgets } from '@/store/modules/widgets';

const widgetsStore = useWidgets();
const dashboardsStore = useDashboards();

const currentExpansiveWidget = computed(() => {
  return widgetsStore.currentExpansiveWidget;
});

const currentDashboard = computed(() => {
  return dashboardsStore.currentDashboard;
});

const dashboardType = computed(() => {
  const config = currentDashboard?.value?.config;

  let type:
    | 'custom'
    | 'expansive'
    | 'metaTemplateMessage'
    | 'conversational'
    | 'human_support';

  if (config?.type === 'conversational') {
    type = 'conversational';
  } else if (config?.is_whatsapp_integration) {
    type = 'metaTemplateMessage';
  } else if (
    currentExpansiveWidget.value &&
    Object.keys(currentExpansiveWidget.value).length > 0
  ) {
    type = 'expansive';
  } else if (config?.type === 'human_support') {
    type = 'human_support';
  } else {
    type = 'custom';
  }

  const dashboardTypes = {
    custom: 'custom_dashboard',
    expansive: 'expansive_widget',
    metaTemplateMessage: 'meta_template_message',
    conversational: 'conversational',
    human_support: 'human_support',
  };

  return dashboardTypes[type];
});

const currentComponent = computed(() => {
  const componentMap = {
    custom_dashboard: defineAsyncComponent(
      () => import('@/components/insights/dashboards/DashboardCustom.vue'),
    ),
    expansive_widget: defineAsyncComponent(
      () => import('@/components/insights/widgets/ExpansiveWidget.vue'),
    ),
    meta_template_message: defineAsyncComponent(
      () => import('@/components/insights/dashboards/TemplateMessageMeta.vue'),
    ),
    conversational: defineAsyncComponent(
      () => import('@/components/insights/dashboards/Conversational.vue'),
    ),
    human_support: defineAsyncComponent(
      () => import('@/components/insights/dashboards/HumanSupport.vue'),
    ),
    template_dashboard: null,
  };

  return componentMap[dashboardType.value] || null;
});

const dashboardProps = computed(() => {
  const mappingProps = {
    expansive_widget: {
      widget: currentExpansiveWidget,
    },
  };

  return mappingProps[dashboardType.value] || {};
});

const dashboardEvents = computed(() => {
  return {};
});

const currentDashboardUuid = computed(
  () => dashboardsStore.currentDashboard.uuid,
);

const getCurrentDashboardWidgets = () => {
  widgetsStore.getCurrentDashboardWidgets();
};

const resetCurrentDashboardWidgets = () => {
  widgetsStore.resetCurrentDashboardWidgets();
};

const resetAppliedFilters = () => {
  dashboardsStore.resetAppliedFilters();
};

watch(
  currentDashboardUuid,
  async (newCurrentDashboardUuid) => {
    if (newCurrentDashboardUuid) {
      resetCurrentDashboardWidgets();
      resetAppliedFilters();
      getCurrentDashboardWidgets();
    }
  },
  { immediate: true },
);
</script>
