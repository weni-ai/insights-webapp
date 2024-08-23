<template>
  <UnnnicTour
    ref="widgetsOnboardingTour"
    :steps="widgetsOnboardingSteps"
    @end-tour="setShowConfigWidgetsOnboarding(false)"
    @close="setShowConfigWidgetsOnboarding(false)"
  />
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';

export default {
  name: 'WidgetOnboarding',
  props: {
    showCardTour: {
      type: Boolean,
      required: true,
    },
    showFunnelTour: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    ...mapState({
      currentDashboard: (state) => state.dashboards.currentDashboard,
      currentDashboardWidgets: (state) => state.widgets.currentDashboardWidgets,
      showConfigWidgetOnboarding: (state) =>
        state.onboarding.showConfigWidgetOnboarding,
      onboardingRefs: (state) => state.onboarding.onboardingRefs,
    }),

    hasFunnelWidget() {
      return !!this.currentDashboardWidgets.some(
        (widget) => widget.type === 'graph_funnel',
      );
    },

    hasCardWidget() {
      return !!this.currentDashboardWidgets.some(
        (widget) => widget.type === 'card',
      );
    },

    widgetsOnboardingSteps() {
      const steps = [];
      const cardSteps = [
        {
          title: this.$t('widgets_onboarding.card.step.define_metric.title'),
          description: this.$t(
            'widgets_onboarding.card.step.define_metric.description',
          ),
          attachedElement:
            this.onboardingRefs['widget-card-metric'] ||
            this.onboardingRefs['insights-layout'],
          popoverPosition: 'right',
        },
        {
          title: this.$t(
            'widgets_onboarding.card.step.select_widget_type.title',
          ),
          description: this.$t(
            'widgets_onboarding.card.step.select_widget_type.description',
          ),
          attachedElement:
            this.onboardingRefs['widget-gallery'] ||
            this.onboardingRefs['insights-layout'],
          popoverPosition: 'left',
          beforeRender: this.beforeOpenWidgetConfig,
          hiddenNextStepButton: true,
        },
        {
          title: this.$t('widgets_onboarding.card.step.set_metric.title'),
          description: this.$t(
            'widgets_onboarding.card.step.set_metric.description',
          ),
          attachedElement:
            this.onboardingRefs['drawer-card-metric-config'] ||
            this.onboardingRefs['insights-layout'],
          beforeRender: this.beforeOpenWidgetMetricConfig,
          popoverPosition: 'left',
          hiddenNextStepButton: true,
        },
      ];
      const funnelSteps = [
        {
          title: this.$t('widgets_onboarding.funnel.step.define_metric.title'),
          description: this.$t(
            'widgets_onboarding.funnel.step.define_metric.description',
          ),
          attachedElement:
            this.onboardingRefs['widget-graph-funnel'] ||
            this.onboardingRefs['insights-layout'],
          popoverPosition: this.hasCardWidget ? 'left' : 'right',
          padding: {
            vertical: -400,
          },
        },
        {
          title: this.$t('widgets_onboarding.funnel.step.fill_metric.title'),
          description: this.$t(
            'widgets_onboarding.funnel.step.fill_metric.description',
          ),
          attachedElement:
            this.onboardingRefs['drawer-graph-funnel'] ||
            this.onboardingRefs['insights-layout'],
          popoverPosition: 'left',
          beforeRender: this.beforeOpenFunnelConfig,
          hiddenNextStepButton: true,
        },
      ];
      if (this.hasCardWidget && this.showCardTour) {
        steps.push(...cardSteps);
      }
      if (this.hasFunnelWidget && this.showFunnelTour) {
        steps.push(...funnelSteps);
      }

      return steps;
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.setOnboardingRef({
        key: 'widget-card-metric',
        ref: document.querySelector(
          '[data-onboarding-id="widget-card-metric"]',
        ),
      });
      this.setOnboardingRef({
        key: 'widget-graph-funnel',
        ref: document.querySelector(
          '[data-onboarding-id="widget-graph-funnel"]',
        ),
      });

      this.setOnboardingRef({
        key: 'widgets-onboarding-tour',
        ref: this.$refs.widgetsOnboardingTour,
      });
      this.onboardingRefs['widgets-onboarding-tour'].start();
    });
  },

  methods: {
    ...mapActions({
      beforeOpenWidgetConfig: 'onboarding/beforeOpenWidgetConfig',
      beforeOpenFunnelConfig: 'onboarding/beforeOpenFunnelConfig',
      beforeOpenWidgetMetricConfig: 'onboarding/beforeOpenWidgetMetricConfig',
    }),
    ...mapMutations({
      setOnboardingRef: 'onboarding/SET_ONBOARDING_REF',
      setShowConfigWidgetsOnboarding:
        'onboarding/SET_SHOW_CONFIG_WIDGETS_ONBOARDING',
    }),
  },
};
</script>
