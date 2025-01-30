<template>
  <section
    class="dashboard"
    :style="dashboardGridStyle"
  >
    <WidgetOnboarding
      v-if="showConfigWidgetOnboarding"
      :showCardTour="showOnboarding.card"
      :showWidgetTour="showOnboarding.empty_widget"
    />
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
        @click-data="openFlowResultContactList"
      />
    </template>

    <DrawerConfigGallery
      v-if="!!currentWidgetEditing"
      :modelValue="!!currentWidgetEditing"
      @close="updateCurrentWidgetEditing(null)"
    />

    <FlowResultContactListModal
      v-if="showFlowResultsContactListModal"
      :flowResultLabel="flowResultsContactListParams?.label"
      :flow="flowResultsContactListParams?.flow"
      @close="closeFlowResultContactList()"
    />
  </section>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex';

import DynamicWidget from '@/components/insights/widgets/DynamicWidget.vue';
import DrawerConfigGallery from '@/components/insights/drawers/DrawerConfigGallery/index.vue';
import IconLoading from '@/components/IconLoading.vue';
import WidgetOnboarding from '@/components/insights/onboardings/WidgetOnboarding.vue';
import FlowResultContactListModal from '@/components/FlowResultContactListModal.vue';

export default {
  name: 'DashboardView',

  components: {
    DynamicWidget,
    DrawerConfigGallery,
    IconLoading,
    WidgetOnboarding,
    FlowResultContactListModal,
  },

  data() {
    return {
      showDrawerConfigWidget: false,
      widgetConfigurating: null,
      showOnboarding: {
        card: false,
        empty_widget: false,
      },
      showFlowResultsContactListModal: false,
      flowResultsContactListParams: null,
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
        state.onboarding.showConfigWidgetOnboarding,
    }),

    isCustomDashboard() {
      return this.currentDashboard.is_deletable;
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
      updateCurrentWidgetEditing: 'widgets/updateCurrentWidgetEditing',
      callTourNextStep: 'onboarding/callTourNextStep',
    }),
    ...mapMutations({
      resetCurrentDashboardWidgets: 'widgets/RESET_CURRENT_DASHBOARD_WIDGETS',
      setShowConfigWidgetsOnboarding:
        'onboarding/SET_SHOW_CONFIG_WIDGETS_ONBOARDING',
    }),

    openFlowResultContactList(data) {
      this.flowResultsContactListParams = data;
      this.showFlowResultsContactListModal = true;
    },

    closeFlowResultContactList() {
      this.flowResultsContactListParams = {};
      this.showFlowResultsContactListModal = false;
    },

    handleWidgetFilledData() {
      const hasCard = this.currentDashboardWidgets.filter(
        (e) => e.type === 'card',
      );

      const existFunnel = this.currentDashboardWidgets.some(
        (e) => e.type === 'graph_funnel',
      );
      const existVtex = this.currentDashboardWidgets.some(
        (e) => e.type === 'vtex_order',
      );

      this.showOnboarding = {
        card:
          hasCard.length > 0
            ? !!hasCard.every((widget) => widget.name === '')
            : false,
        empty_widget:
          !!this.currentDashboardWidgets.some(
            (widget) => widget.type === 'empty_column',
          ) &&
          !existFunnel &&
          !existVtex,
      };
    },

    handlerWidgetsOnboarding() {
      const hasWidgetsOnboardingComplete =
        localStorage.getItem('hasWidgetsOnboardingComplete') === 'true';

      if (!hasWidgetsOnboardingComplete) {
        this.handleWidgetFilledData();

        if (!this.showOnboarding.card && !this.showOnboarding.empty_widget) {
          localStorage.setItem('hasWidgetsOnboardingComplete', 'true');
        }

        if (this.showOnboarding.card || this.showOnboarding.empty_widget) {
          this.setShowConfigWidgetsOnboarding(true);
        }
      }
    },

    handlerWidgetOpenConfig(widget) {
      const isNewWidget = this.currentWidgetEditing?.uuid !== widget.uuid;
      if (isNewWidget) {
        this.updateCurrentWidgetEditing(widget).then(() => {
          this.callTourNextStep('widgets-onboarding-tour');
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
      return widget.type === 'card'
        ? 'widget-card-metric'
        : 'widget-graph-empty';
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
