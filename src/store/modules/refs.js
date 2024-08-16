const mutations = {
  SET_ONBOARDING_REF: 'SET_ONBOARDING_REF',
  SET_SHOW_CREATE_DASHBOARD_ONBOARDING: 'SET_SHOW_CREATE_DASHBOARD_ONBOARDING',
  SET_SHOW_CONFIG_WIDGETS_ONBOARDING: 'SET_SHOW_CONFIG_WIDGETS_ONBOARDING',
  SET_SHOW_COMPLETE_ONBOARDING_MODAL: 'SET_SHOW_COMPLETE_ONBOARDING_MODAL',
};
export default {
  namespaced: true,
  state: {
    onboardingRefs: {
      'select-dashboard': null,
      'create-dashboard-button': null,
      'widget-card-metric': null,
      'widget-gallery': null,
      'drawer-card-metric-config': null,
      'widget-graph-funnel': null,
      'drawer-graph-funnel': null,
      'dashboard-onboarding-tour': null,
      'widgets-onboarding-tour': null,
    },
    showCreateDashboardOnboarding: false,
    showConfigWidgetOnboarding: false,
    showCompleteOnboardingModal: false,
  },
  mutations: {
    [mutations.SET_ONBOARDING_REF](state, { key, ref }) {
      state.onboardingRefs[key] = ref;
    },
    [mutations.SET_SHOW_CREATE_DASHBOARD_ONBOARDING](state, show) {
      state.showCreateDashboardOnboarding = show;
    },
    [mutations.SET_SHOW_CONFIG_WIDGETS_ONBOARDING](state, show) {
      state.showConfigWidgetOnboarding = show;
    },
    [mutations.SET_SHOW_COMPLETE_ONBOARDING_MODAL](state, show) {
      state.showCompleteOnboardingModal = show;
    },
  },
};
