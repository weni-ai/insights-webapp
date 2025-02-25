<template>
  <component
    :is="currentComponent"
    v-bind="dashboardProps"
    v-on="dashboardEvents"
  />
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import { useStore } from 'vuex';

import DashboardCustom from '@/components/insights/dashboards/DashboardCustom.vue';
import ExpansiveWidget from '@/components/insights/widgets/ExpansiveWidget.vue';
import MetaTemplateMessage from '@/components/insights/dashboards/TemplateMessageMeta.vue';

const store = useStore();

const currentExpansiveWidget = computed(() => {
  return store.state.widgets?.currentExpansiveWidget;
});

const currentDashboard = computed(() => {
  return store.state.dashboards?.currentDashboard;
});

const dashboardType = computed(() => {
  let type;

  type =
    currentExpansiveWidget.value &&
    Object.keys(currentExpansiveWidget.value).length > 0
      ? 'expansive'
      : 'custom';

  if (currentDashboard?.value?.name === 'test-meta-templates-message') {
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
  () => store.state.dashboards.currentDashboard?.uuid,
);

const getCurrentDashboardWidgets = () => {
  return store.dispatch('widgets/getCurrentDashboardWidgets');
};

const resetCurrentDashboardWidgets = () => {
  return store.commit('widgets/RESET_CURRENT_DASHBOARD_WIDGETS');
};

watch(
  currentDashboardUuid,
  async (newCurrentDashboardUuid) => {
    if (newCurrentDashboardUuid) {
      resetCurrentDashboardWidgets();
      getCurrentDashboardWidgets();
    }
  },
  { immediate: true },
);
</script>
