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
      'widget-graph-empty': null,
      'drawer-graph-empty': null,
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

    async callTourPreviousStep({ state }, { tour, qtdSteps, timeout }) {
      const {
        showCreateDashboardOnboarding,
        showConfigWidgetOnboarding,
        onboardingRefs,
      } = state;

      if (showCreateDashboardOnboarding || showConfigWidgetOnboarding) {
        await asyncTimeout(timeout || 0).then(() => {
          onboardingRefs[tour]?.handleStep(
            onboardingRefs[tour].currentStep - (qtdSteps || 1),
          );
        });
      }
    },

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

    async beforeOpenWidgetConfig({ commit, state }) {
      if (!state.showConfigWidgetOnboarding) return;

      const widgetGallery = document.querySelector(
        '[data-onboarding-id="widget-gallery"]',
      );

      if (!widgetGallery) {
        await state.onboardingRefs['widget-card-metric']
          .querySelector('.card-dashboard__button-config')
          .click();
      }

      await asyncTimeout(300).then(() => {
        commit(mutations.SET_ONBOARDING_REF, {
          key: 'widget-gallery',
          ref: document.querySelector('[data-onboarding-id="widget-gallery"]'),
        });
      });
    },

    async beforeOpenGaleryEmptyConfig({ commit, state }) {
      const galeryDrawer = document.querySelector(
        '[data-onboarding-id="drawer-graph-empty"]',
      );
      if (!galeryDrawer) {
        await state.onboardingRefs['widget-graph-empty']
          .querySelector('.unnnic-button')
          .click();
      }

      await asyncTimeout(300).then(() => {
        commit(mutations.SET_ONBOARDING_REF, {
          key: 'widget-gallery',
          ref: document.querySelector('[data-onboarding-id="widget-gallery"]'),
        });
      });
    },

    async beforeOpenEmptyWidgetConfig({ commit, state }) {
      const galeryDrawer = document.querySelector(
        '[data-onboarding-id="drawer-graph-empty"]',
      );
      if (!galeryDrawer) {
        await state.onboardingRefs['widget-graph-empty']
          .querySelector('.unnnic-button')
          .click();
      }
      await asyncTimeout(600).then(() => {
        commit(mutations.SET_ONBOARDING_REF, {
          key: 'drawer-graph-empty',
          ref: document.querySelector(
            '[data-onboarding-id="drawer-graph-empty"]',
          )?.children[1],
        });
      });
    },

    async beforeOpenWidgetMetricConfig({ commit }) {
      await asyncTimeout(600).then(() => {
        commit(mutations.SET_ONBOARDING_REF, {
          key: 'drawer-card-metric-config',
          ref: document.querySelector(
            '[data-onboarding-id="drawer-card-metric-config"]',
          ).children[1],
        });
      });
    },
  },
};
