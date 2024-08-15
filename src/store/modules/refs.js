const mutations = {
  SET_ONBOARDING_REF: 'SET_ONBOARDING_REF',
};
export default {
  namespaced: true,
  state: {
    onboardingRefs: {
      'select-dashboard': null,
      'widget-card-metric': null,
      'widget-galery': null,
      'drawer-card-metric-config': null,
      'widget-graph-funnel': null,
      'drawer-graph-funnel': null,
    },
  },
  mutations: {
    [mutations.SET_ONBOARDING_REF](state, { key, ref }) {
      state.onboardingRefs[key] = ref;
    },
  },
};
