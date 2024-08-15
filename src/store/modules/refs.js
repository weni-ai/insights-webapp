const mutations = {
  SET_ONBOARDING_REF: 'SET_ONBOARDING_REF',
  SET_SHOW_CREATE_DASHBOARD_ONBOARDING: 'SET_SHOW_CREATE_DASHBOARD_ONBOARDING',
  // SET_ONBOARDING_REF: 'SET_ONBOARDING_REF',
};
export default {
  namespaced: true,
  state: {
    onboardingRefs: {
      'select-dashboard': null,
      'create-dashboard-button': null,
      'widget-card-metric': null,
      'widget-galery': null,
      'drawer-card-metric-config': null,
      'widget-graph-funnel': null,
      'drawer-graph-funnel': null,
      'dashboard-onboarding-tour': null,
    },
    showCreateDashboardOnboarding: false,
  },
  mutations: {
    [mutations.SET_ONBOARDING_REF](state, { key, ref }) {
      state.onboardingRefs[key] = ref;
    },
    [mutations.SET_SHOW_CREATE_DASHBOARD_ONBOARDING](state, show) {
      state.showCreateDashboardOnboarding = show;
    },
  },
};
