import { asyncTimeout } from '@/utils/time';
import { defineStore } from 'pinia';

interface OnboardingRefs {
  [key: string]: null | HTMLElement;
}

export const useOnboarding = defineStore('onboarding', {
  state: () => ({
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
    } as OnboardingRefs,
    showCreateDashboardOnboarding: false,
    showConfigWidgetOnboarding: false,
    showCompleteOnboardingModal: false,
  }),
  actions: {
    setShowCreateDashboardOnboarding(payload: Boolean) {
      this.showCreateDashboardOnboarding = payload;
    },
    setShowConfigWidgetsOnboarding(payload: Boolean) {
      this.showConfigWidgetOnboarding = payload;
    },
    setShowCompleteOnboardingModal(payload: Boolean) {
      this.showCompleteOnboardingModal = payload;
    },
    setOnboardingRef({ key, ref }) {
      this.onboardingRefs[key] = ref;
    },
    callTourNextStep(tour) {
      const {
        showCreateDashboardOnboarding,
        showConfigWidgetOnboarding,
        onboardingRefs,
      } = this;

      if (showCreateDashboardOnboarding || showConfigWidgetOnboarding) {
        onboardingRefs[tour]?.nextStep();
      }
    },
    async callTourPreviousStep({ tour, qtdSteps, timeout }) {
      const {
        showCreateDashboardOnboarding,
        showConfigWidgetOnboarding,
        onboardingRefs,
      } = this;

      if (showCreateDashboardOnboarding || showConfigWidgetOnboarding) {
        await asyncTimeout(timeout || 0).then(() => {
          onboardingRefs[tour]?.handleStep(
            onboardingRefs[tour].currentStep - (qtdSteps || 1),
          );
        });
      }
    },
    async beforeOpenDashboardList() {
      if (this.showCreateDashboardOnboarding) {
        const dashboardName = document.querySelector(
          '[data-testid="dropdown-trigger"]',
        ) as HTMLElement;
        await dashboardName.click();
        this.setOnboardingRef({
          key: 'create-dashboard-button',
          ref: document.querySelector(
            '[data-onboarding-id="create-dashboard-button"]',
          ),
        });
      }
    },

    async beforeOpenWidgetConfig() {
      if (!this.showConfigWidgetOnboarding) return;

      const widgetGallery = document.querySelector(
        '[data-onboarding-id="widget-gallery"]',
      ) as HTMLElement;

      if (!widgetGallery) {
        await this.onboardingRefs['widget-card-metric']
          .querySelector('.card-dashboard__button-config')
          .click();
      }

      await asyncTimeout(500).then(() => {
        this.setOnboardingRef({
          key: 'widget-gallery',
          ref: document.querySelector('[data-onboarding-id="widget-gallery"]'),
        });
      });
    },

    async beforeOpenGaleryEmptyConfig() {
      const galeryDrawer = document.querySelector(
        '[data-onboarding-id="drawer-graph-empty"]',
      );
      if (!galeryDrawer) {
        await this.onboardingRefs['widget-graph-empty']
          .querySelector('.unnnic-button')
          .click();
      }

      await asyncTimeout(500).then(() => {
        this.setOnboardingRef({
          key: 'widget-gallery',
          ref: document.querySelector('[data-onboarding-id="widget-gallery"]'),
        });
      });
    },
    async beforeOpenEmptyWidgetConfig() {
      const galeryDrawer = document.querySelector(
        '[data-onboarding-id="drawer-graph-empty"]',
      );
      if (!galeryDrawer) {
        await this.onboardingRefs['widget-graph-empty']
          .querySelector('.unnnic-button')
          .click();
      }

      await asyncTimeout(600).then(() => {
        this.setOnboardingRef({
          key: 'drawer-graph-empty',
          ref: document.querySelector('.unnnic-drawer__container'),
        });
      });
    },
    async beforeOpenWidgetMetricConfig() {
      await asyncTimeout(600).then(() => {
        this.setOnboardingRef({
          key: 'drawer-card-metric-config',
          ref: document.querySelector('.unnnic-drawer__container'),
        });
      });
    },
  },
});
