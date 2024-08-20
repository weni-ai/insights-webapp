<template>
  <section
    class="dashboard"
    :style="dashboardGridStyle"
  >
    <section
      v-if="isLoadingCurrentDashboardWidgets"
      class="dashboard__loading"
    >
      <IconLoading />
    </section>
    <template
      v-for="widget of currentDashboardWidgets"
      v-else
      :key="widget.uuid"
    >
      <DynamicWidget
        :style="getWidgetStyle(widget.grid_position)"
        :widget="widget"
        :data-onboarding-id="getWidgetOnboardingId(widget)"
        @open-config="handlerWidgetOpenConfig(widget)"
      />
    </template>

    <DrawerConfigGallery
      v-if="!!currentWidgetEditing"
      :modelValue="!!currentWidgetEditing"
      @close="handlerDrawerConfigGaleryClose($event)"
    />
    <UnnnicTour
      v-if="showConfigWidgetOnboarding"
      ref="widgetsOnboardingTour"
      :steps="widgetsOnboardingSteps"
      @end-tour="setShowConfigWidgetsOnboarding(false)"
      @close="setShowConfigWidgetsOnboarding(false)"
    />
  </section>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex';

import DynamicWidget from '@/components/insights/widgets/DynamicWidget.vue';
import DrawerConfigGallery from '@/components/insights/drawers/DrawerConfigGallery/index.vue';
import IconLoading from '@/components/IconLoading.vue';

export default {
  name: 'DashboardView',

  components: {
    DynamicWidget,
    DrawerConfigGallery,
    IconLoading,
  },

  data() {
    return {
      showDrawerConfigWidget: false,
      widgetConfigurating: null,
      initialOnboardingWidgetCompleteState: '',
      hasWidgetFilledData: {
        card: false,
        funnel: false,
      },
    };
  },

  computed: {
    ...mapState({
      currentDashboard: (state) => state.dashboards.currentDashboard,
      currentDashboardWidgets: (state) => state.widgets.currentDashboardWidgets,
      currentWidgetEditing: (state) => state.widgets.currentWidgetEditing,
      isLoadingCurrentDashboardWidgets: (state) =>
        state.widgets.isLoadingCurrentDashboardWidgets,
      showConfigWidgetOnboarding: (state) =>
        state.refs.showConfigWidgetOnboarding,
      onboardingRefs: (state) => state.refs.onboardingRefs,
    }),

    isCustomDashboard() {
      return this.currentDashboard.is_deletable;
    },

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
      if (this.hasCardWidget && !this.hasWidgetFilledData.card) {
        steps.push(...cardSteps);
      }
      if (this.hasFunnelWidget && !this.hasWidgetFilledData.funnel) {
        steps.push(...funnelSteps);
      }

      return steps;
    },

    dashboardGridStyle() {
      const { grid } = this.currentDashboard || {};
      if (grid) {
        return {
          gridTemplateColumns: `repeat(${grid.columns}, 1fr)`,
          gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
        };
      }
      return {};
    },
  },

  watch: {
    'currentDashboard.uuid': {
      immediate: true,
      handler(newCurrentDashboardUuid) {
        if (newCurrentDashboardUuid) {
          this.resetCurrentDashboardWidgets();
          this.getCurrentDashboardWidgets().then(() => {
            if (this.isCustomDashboard) this.handlerWidgetsOnboarding();
          });
        }
      },
    },
  },

  methods: {
    ...mapActions({
      getCurrentDashboardWidgets: 'widgets/getCurrentDashboardWidgets',
      fetchWidgetData: 'dashboards/fetchWidgetData',
      updateCurrentWidgetEditing: 'widgets/updateCurrentWidgetEditing',
      beforeOpenWidgetConfig: 'refs/beforeOpenWidgetConfig',
      beforeOpenFunnelConfig: 'refs/beforeOpenFunnelConfig',
      beforeOpenWidgetMetricConfig: 'refs/beforeOpenWidgetMetricConfig',
      callTourNextStep: 'refs/callTourNextStep',
      callTourPreviousStep: 'refs/callTourPreviousStep',
    }),
    ...mapMutations({
      resetCurrentDashboardWidgets: 'widgets/RESET_CURRENT_DASHBOARD_WIDGETS',
      setShowConfigWidgetsOnboarding: 'refs/SET_SHOW_CONFIG_WIDGETS_ONBOARDING',
      setOnboardingRef: 'refs/SET_ONBOARDING_REF',
    }),

    handleWidgetFilledData() {
      this.hasWidgetFilledData = {
        card: !!this.currentDashboardWidgets.some(
          (widget) => !!widget.name && widget.name !== 'Funil',
        ),
        funnel: !!this.currentDashboardWidgets.some(
          (widget) => widget.name === 'Funil' && !!widget.config.metric_1,
        ),
      };
    },

    handlerWidgetsOnboarding() {
      const hasWidgetsOnboardingComplete =
        localStorage.getItem('hasWidgetsOnboardingComplete') === 'true';

      if (hasWidgetsOnboardingComplete) return;

      this.handleWidgetFilledData();

      if (this.hasWidgetFilledData.card && this.hasWidgetFilledData.funnel) {
        localStorage.setItem('hasWidgetsOnboardingComplete', 'true');
        return;
      }

      this.setShowConfigWidgetsOnboarding(true);

      setTimeout(() => {
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
      }, 300);
    },

    handlerWidgetOpenConfig(widget) {
      // TODO... Ajustar para não chamar ao disparar back da galeria
      this.updateCurrentWidgetEditing(widget).then(() => {
        this.callTourNextStep('widgets-onboarding-tour');
      });
    },

    handlerDrawerConfigGaleryClose({ ignoreTourStep }) {
      if (!ignoreTourStep) {
        this.callTourPreviousStep('widgets-onboarding-tour');
      }
      this.updateCurrentWidgetEditing(null);
    },

    getWidgetStyle(gridPosition) {
      return {
        gridColumn: `${gridPosition.column_start} / ${gridPosition.column_end + 1}`,
        gridRow: `${gridPosition.row_start} / ${gridPosition.row_end + 1}`,
      };
    },

    getWidgetOnboardingId(widget) {
      return widget.type === 'card'
        ? 'widget-card-metric'
        : 'widget-graph-funnel';
    },
  },
};
</script>

<style lang="scss" scoped>
.dashboard {
  overflow: hidden;

  height: 100%;

  display: grid;
  gap: $unnnic-spacing-sm;
  &__loading {
    width: 100vw;
    height: 85vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
