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
      @close="updateCurrentWidgetEditing(null)"
    />
    <UnnnicTour
      v-if="showConfigWidgetOnboarding"
      ref="widgetsOnboardingTour"
      :steps="widgetsOnboardingSteps"
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

    hasWidgetFilledData() {
      return !!this.currentDashboardWidgets.some(
        (widget) => !!widget.name && widget.name !== 'Funil',
      );
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
          title: 'Definir métrica',
          description:
            'Clique aqui para definir a métrica que deseja visualizar',
          attachedElement:
            this.onboardingRefs['widget-card-metric'] ||
            this.onboardingRefs['insights-layout'],
          popoverPosition: 'right',
        },
        {
          title: 'Selecionar widget',
          description:
            'Selecione o tipo de métrica que deseja configurar, caso tenha dúvidas comece testando o Execuções',
          attachedElement:
            this.onboardingRefs['widget-gallery'] ||
            this.onboardingRefs['insights-layout'],
          popoverPosition: 'left',
        },
        {
          title: 'Definindo métrica',
          description:
            'Após selecionar o tipo de métrica, selecione um fluxo que traga valores relevantes para sua operação, preencha o restante e salve!',
          attachedElement:
            this.onboardingRefs['drawer-card-metric-config'] ||
            this.onboardingRefs['insights-layout'],
          popoverPosition: 'right',
        },
      ];
      const funnelSteps = [
        {
          title: 'Definindo métricas para gráfico',
          description:
            'Selecione os principais fluxos da sua operação para gerar uma visualização em funil e acompanhar a jornada dos seus contatos',
          attachedElement:
            this.onboardingRefs['widget-graph-funnel'] ||
            this.onboardingRefs['insights-layout'],
          popoverPosition: 'right',
        },
        {
          title: 'Preencher métricas',
          description:
            'Informe um nome fácil para sua métrica e selecione o fluxo de onde deseja contabilizar as execuções',
          attachedElement:
            this.onboardingRefs['drawer-graph-funnel'] ||
            this.onboardingRefs['insights-layout'],
          popoverPosition: 'right',
        },
      ];
      if (this.hasCardWidget) steps.push(...cardSteps);
      if (this.hasFunnelWidget) steps.push(...funnelSteps);
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
    }),
    ...mapMutations({
      resetCurrentDashboardWidgets: 'widgets/RESET_CURRENT_DASHBOARD_WIDGETS',
      setShowConfigWidgetsOnboarding: 'refs/SET_SHOW_CONFIG_WIDGETS_ONBOARDING',
      setOnboardingRef: 'refs/SET_ONBOARDING_REF',
    }),

    handlerWidgetsOnboarding() {
      if (this.hasWidgetFilledData) {
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
          key: 'widgets-onboarding-tour',
          ref: this.$refs.widgetsOnboardingTour,
        });

        this.onboardingRefs['widgets-onboarding-tour'].start();
      }, 0);
    },

    handlerWidgetOpenConfig(widget) {
      this.updateCurrentWidgetEditing(widget);
      if (this.showConfigWidgetOnboarding) {
        this.$nextTick(() => {
          this.setOnboardingRef({
            key: 'widget-gallery',
            ref: document.querySelector(
              '[data-onboarding-id="widget-gallery"]',
            ),
          });
          this.onboardingRefs['widgets-onboarding-tour'].nextStep();
        });
      }
    },

    getWidgetStyle(gridPosition) {
      return {
        gridColumn: `${gridPosition.column_start} / ${gridPosition.column_end + 1}`,
        gridRow: `${gridPosition.row_start} / ${gridPosition.row_end + 1}`,
      };
    },

    getWidgetOnboardingId(widget) {
      if (this.hasWidgetFilledData) return '';
      return widget.type === 'card'
        ? 'widget-card-metric'
        : 'drawer-graph-funnel';
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
