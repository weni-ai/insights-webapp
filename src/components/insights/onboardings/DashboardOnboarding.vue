<template>
  <UnnnicTour
    ref="dashboardOnboardingTour"
    :steps="dashboardTourSteps"
    @end-tour="setShowDashboardConfig(true)"
    @close="setShowCreateDashboardOnboarding(false)"
  />
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import { useOnboarding } from '@/store/modules/onboarding';
import { useDashboards } from '@/store/modules/dashboards';

defineOptions({ name: 'DashboardOnboarding' });

const { t } = useI18n();
const onboardingStore = useOnboarding();
const dashboardsStore = useDashboards();
const { onboardingRefs } = storeToRefs(onboardingStore);
const {
  beforeOpenDashboardList,
  setOnboardingRef,
  setShowCreateDashboardOnboarding,
} = onboardingStore;
const { setShowDashboardConfig } = dashboardsStore;

const dashboardOnboardingTour = ref(null);

const dashboardTourSteps = computed(() => [
  {
    title: t('dashboard_onboarding.step.create_dashboard.title'),
    description: t('dashboard_onboarding.step.create_dashboard.description'),
    attachedElement:
      onboardingRefs.value['select-dashboard'] ||
      onboardingRefs.value['insights-layout'],
    popoverPosition: 'right',
  },
  {
    title: t('dashboard_onboarding.step.create_dashboard.title'),
    description: t('dashboard_onboarding.step.create_dashboard.description'),
    attachedElement:
      onboardingRefs.value['create-dashboard-button'] ||
      onboardingRefs.value['insights-layout'],
    popoverPosition: 'right',
    beforeRender: beforeOpenDashboardList,
  },
]);

onMounted(() => {
  nextTick(() => {
    setOnboardingRef({
      key: 'dashboard-onboarding-tour',
      ref: dashboardOnboardingTour.value,
    });
    onboardingRefs.value['dashboard-onboarding-tour'].start();
  });
});
</script>
