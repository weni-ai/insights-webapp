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
import DashboardCustom from './DashboardCustom.vue';

const store = useStore();

const dashboardType = computed(() => {
  console.log('dashboards', store.state.dashboards.currentDashboard);
  const dashboardTypes = {};

  return 'custom_dashboard';
});

const currentComponent = computed(() => {
  const componentMap = {
    custom_dashboard: DashboardCustom,
  };

  return componentMap[dashboardType.value] || null;
});

const getCurrentDashboardWidgets = () => {
  return store.dispatch('widgets/getCurrentDashboardWidgets');
};

const resetCurrentDashboardWidgets = () => {
  return store.dispatch('widgets/RESET_CURRENT_DASHBOARD_WIDGETS');
};

watch(
  () => store.state.dashboards.currentDashboard.uuid,
  (newCurrentDashboardUuid) => {
    if (newCurrentDashboardUuid) {
      resetCurrentDashboardWidgets();
      getCurrentDashboardWidgets();
    }
  },
);
</script>
