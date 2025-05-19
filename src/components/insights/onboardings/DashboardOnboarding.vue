<template>
  <UnnnicTour
    ref="dashboardOnboardingTour"
    :steps="dashboardTourSteps"
    @end-tour="setShowDashboardConfig(true)"
    @close="setShowCreateDashboardOnboarding(false)"
  />
</template>

<script>
import { mapActions, mapState } from 'pinia';

import { useOnboarding } from '@/store/modules/onboarding';
import { useDashboards } from '@/store/modules/dashboards';

export default {
  name: 'DashboardOnboarding',

  computed: {
    ...mapState(useOnboarding, ['onboardingRefs']),
    dashboardTourSteps() {
      return [
        {
          title: this.$t('dashboard_onboarding.step.create_dashboard.title'),
          description: this.$t(
            'dashboard_onboarding.step.create_dashboard.description',
          ),
          attachedElement:
            this.onboardingRefs['select-dashboard'] ||
            this.onboardingRefs['insights-layout'],
          popoverPosition: 'right',
        },
        {
          title: this.$t('dashboard_onboarding.step.create_dashboard.title'),
          description: this.$t(
            'dashboard_onboarding.step.create_dashboard.description',
          ),
          attachedElement:
            this.onboardingRefs['create-dashboard-button'] ||
            this.onboardingRefs['insights-layout'],
          popoverPosition: 'right',
          beforeRender: this.beforeOpenDashboardList,
        },
      ];
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.setOnboardingRef({
        key: 'dashboard-onboarding-tour',
        ref: this.$refs.dashboardOnboardingTour,
      });
      this.onboardingRefs['dashboard-onboarding-tour'].start();
    });
  },
  methods: {
    ...mapActions(useOnboarding, [
      'beforeOpenDashboardList',
      'setOnboardingRef',
      'setShowCreateDashboardOnboarding',
    ]),
    ...mapActions(useDashboards, ['setShowDashboardConfig']),
  },
};
</script>
