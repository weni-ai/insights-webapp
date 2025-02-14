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
import DashboardCustom from '../../components/insights/dashboards/DashboardCustom.vue';
import ExpansiveWidget from '@/components/insights/widgets/ExpansiveWidget.vue';

const store = useStore();

const currentExpansiveWidget = computed(() => {
  return store.state.widgets?.currentExpansiveWidget;
});

const dashboardType = computed(() => {
  const type = currentExpansiveWidget.value ? 'expansive' : 'custom';

  const dashboardTypes = {
    custom: 'custom_dashboard',
    expansive: 'expansive_widget',
  };

  return dashboardTypes[type] || dashboardTypes['custom'];
});

const currentComponent = computed(() => {
  const componentMap = {
    custom_dashboard: DashboardCustom,
    expansive_widget: ExpansiveWidget,
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

  return mappingProps[dashboardType.value] || null;
});

const dashboardEvents = computed(() => {
  return null;
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
