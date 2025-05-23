<template>
  <UnnnicTour
    ref="widgetsOnboardingTour"
    :steps="widgetsOnboardingSteps"
    @end-tour="setShowConfigWidgetsOnboarding(false)"
    @close="setShowConfigWidgetsOnboarding(false)"
  />
</template>

<script>
import { mapActions, mapState } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';
import { useOnboarding } from '@/store/modules/onboarding';
import { useWidgets } from '@/store/modules/widgets';

export default {
  name: 'WidgetOnboarding',
  props: {
    showCardTour: {
      type: Boolean,
      required: true,
    },
    showWidgetTour: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    ...mapState(useDashboards, ['currentDashboard']),
    ...mapState(useWidgets, ['currentDashboardWidgets']),
    ...mapState(useOnboarding, [
      'onboardingRefs',
      'showConfigWidgetOnboarding',
    ]),

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

      const emptyWidgetSteps = [
        {
          title: this.$t(
            'widgets_onboarding.empty_widget.step.define_metric.title',
          ),
          description: this.$t(
            'widgets_onboarding.empty_widget.step.define_metric.description',
          ),
          attachedElement:
            this.onboardingRefs['widget-graph-empty'] ||
            this.onboardingRefs['insights-layout'],
          popoverPosition: this.hasCardWidget ? 'left' : 'right',
          padding: {
            vertical: -400,
          },
        },
        {
          title: this.$t(
            'widgets_onboarding.empty_widget.step.select_widget_type.title',
          ),
          description: this.$t(
            'widgets_onboarding.empty_widget.step.select_widget_type.description',
          ),
          attachedElement:
            this.onboardingRefs['widget-gallery'] ||
            this.onboardingRefs['insights-layout'],
          popoverPosition: 'left',
          beforeRender: this.beforeOpenGaleryEmptyConfig,
          hiddenNextStepButton: true,
        },
        {
          title: this.$t(
            'widgets_onboarding.empty_widget.step.fill_metric.title',
          ),
          description: this.$t(
            'widgets_onboarding.empty_widget.step.fill_metric.description',
          ),
          attachedElement:
            this.onboardingRefs['drawer-graph-empty'] ||
            this.onboardingRefs['insights-layout'],
          popoverPosition: 'left',
          beforeRender: this.beforeOpenEmptyWidgetConfig,
          hiddenNextStepButton: true,
        },
      ];

      if (this.showCardTour) {
        steps.push(...cardSteps);
      }
      if (this.showWidgetTour) {
        steps.push(...emptyWidgetSteps);
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
        key: 'widget-graph-empty',
        ref: document.querySelector(
          '[data-onboarding-id="widget-graph-empty"]',
        ),
      });

      this.setOnboardingRef({
        key: 'widgets-onboarding-tour',
        ref: this.$refs.widgetsOnboardingTour,
      });
      this.onboardingRefs['widgets-onboarding-tour']?.start();
    });
  },

  methods: {
    ...mapActions(useOnboarding, [
      'beforeOpenWidgetConfig',
      'beforeOpenEmptyWidgetConfig',
      'beforeOpenGaleryEmptyConfig',
      'beforeOpenWidgetMetricConfig',
      'setOnboardingRef',
      'setShowConfigWidgetsOnboarding',
    ]),
  },
};
</script>
