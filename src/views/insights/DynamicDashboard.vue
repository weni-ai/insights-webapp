<template>
  <component
    :is="currentComponent"
    v-bind="dashboardProps"
    v-on="dashboardEvents"
  />
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import { useDashboards } from '@/store/modules/dashboards';
import { useWidgets } from '@/store/modules/widgets';

import DashboardCustom from '@/components/insights/dashboards/DashboardCustom.vue';
import ExpansiveWidget from '@/components/insights/widgets/ExpansiveWidget.vue';
import MetaTemplateMessage from '@/components/insights/dashboards/TemplateMessageMeta.vue';

const widgetsStore = useWidgets();
const dashboardsStore = useDashboards();

const currentExpansiveWidget = computed(() => {
  return widgetsStore.currentExpansiveWidget;
});

const currentDashboard = computed(() => {
  return dashboardsStore.currentDashboard;
});

const dashboardType = computed(() => {
  let type;

  type =
    currentExpansiveWidget.value &&
    Object.keys(currentExpansiveWidget.value).length > 0
      ? 'expansive'
      : 'custom';

  if (currentDashboard?.value?.config?.is_whatsapp_integration) {
    type = 'metaTemplateMessage';
  }

  const dashboardTypes = {
    custom: 'custom_dashboard',
    expansive: 'expansive_widget',
    metaTemplateMessage: 'meta_template_message',
  };

  return dashboardTypes[type] || dashboardTypes['custom'];
});

const currentComponent = computed(() => {
  const componentMap = {
    custom_dashboard: DashboardCustom,
    expansive_widget: ExpansiveWidget,
    meta_template_message: MetaTemplateMessage,
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
