import { asyncTimeout } from '@/utils/time';

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
  actions: {
    async beforeOpenDashboardList({ state, commit }) {
      if (state.showCreateDashboardOnboarding) {
        const dashboardName = document.querySelector(
          '[data-testid="dropdown-trigger"]',
        );
        await dashboardName.click();
        commit(mutations.SET_ONBOARDING_REF, {
          key: 'create-dashboard-button',
          ref: document.querySelector(
            '[data-onboarding-id="create-dashboard-button"]',
          ),
        });
      }
    },
    // WIDGETS
    async beforeOpenWidgetConfig({ commit, state }, widget) {
      // using setTimeout because of the drawer opening/closing animation
      const delay = widget?.type === 'card' ? 300 : 500;
      await asyncTimeout(delay).then(() => {
        if (state.showConfigWidgetOnboarding) {
          commit(mutations.SET_ONBOARDING_REF, {
            key: 'widget-gallery',
            ref: document.querySelector(
              '[data-onboarding-id="widget-gallery"]',
            ),
          });
          commit(mutations.SET_ONBOARDING_REF, {
            key: 'drawer-graph-funnel',
            ref: document.querySelector(
              '[data-onboarding-id="drawer-graph-funnel"]',
            )?.children[1],
          });
        }
      });
    },
    callTourNextStep({ state }, tour) {
      const {
        showCreateDashboardOnboarding,
        showConfigWidgetOnboarding,
        onboardingRefs,
      } = state;

      if (showCreateDashboardOnboarding || showConfigWidgetOnboarding) {
        onboardingRefs[tour]?.nextStep();
      }
    },
  },
};
