<template>
  <UnnnicTour
    ref="dashboardOnboardingTour"
    :steps="dashboardTourSteps"
    @end-tour="setShowDashboardConfig(true)"
    @close="setShowCreateDashboardOnboarding(false)"
  />
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';

export default {
  name: 'DashboardOnboarding',

  computed: {
    ...mapState({
      onboardingRefs: (state) => state.onboarding.onboardingRefs,
    }),
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
    this.setShowCreateDashboardOnboarding(true);

    this.$nextTick(async () => {
      this.setOnboardingRef({
        key: 'dashboard-onboarding-tour',
        ref: this.$refs.dashboardOnboardingTour,
      });
      this.onboardingRefs['dashboard-onboarding-tour'].start();
    });
  },
  methods: {
    ...mapActions({
      beforeOpenDashboardList: 'onboarding/beforeOpenDashboardList',
    }),
    ...mapMutations({
      setShowDashboardConfig: 'dashboards/SET_SHOW_DASHBOARD_CONFIG',
      setOnboardingRef: 'onboarding/SET_ONBOARDING_REF',
      setShowCreateDashboardOnboarding:
        'onboarding/SET_SHOW_CREATE_DASHBOARD_ONBOARDING',
    }),
  },
};
</script>
