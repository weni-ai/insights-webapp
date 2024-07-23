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
        @open-config="openDrawerConfigWidget(widget)"
      />
    </template>
    <DrawerConfigWidgetDynamic
      v-if="!!widgetConfigurating"
      :modelValue="showDrawerConfigWidget"
      :widget="widgetConfigurating"
      @close="closeDrawerConfigWidget"
    />
  </section>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex';

import DynamicWidget from '@/components/insights/widgets/DynamicWidget.vue';
import DrawerConfigWidgetDynamic from '@/components/insights/drawers/DrawerConfigWidgetDynamic.vue';
import IconLoading from '@/components/IconLoading.vue';

export default {
  name: 'DashboardView',

  components: {
    DynamicWidget,
    DrawerConfigWidgetDynamic,
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
      currentDashboardWidgets: (state) =>
        state.dashboards.currentDashboardWidgets,
      isLoadingCurrentDashboardWidgets: (state) =>
        state.dashboards.isLoadingCurrentDashboardWidgets,
    }),

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
          this.getCurrentDashboardWidgets();
        }
      },
    },
  },

  methods: {
    ...mapActions({
      getCurrentDashboardWidgets: 'dashboards/getCurrentDashboardWidgets',
      fetchWidgetData: 'dashboards/fetchWidgetData',
    }),
    ...mapMutations({
      resetCurrentDashboardWidgets:
        'dashboards/RESET_CURRENT_DASHBOARD_WIDGETS',
    }),

    getWidgetStyle(gridPosition) {
      return {
        gridColumn: `${gridPosition.column_start} / ${gridPosition.column_end + 1}`,
        gridRow: `${gridPosition.row_start} / ${gridPosition.row_end + 1}`,
      };
    },

    openDrawerConfigWidget(widget) {
      this.widgetConfigurating = widget;
      this.showDrawerConfigWidget = true;
    },

    closeDrawerConfigWidget() {
      this.widgetConfigurating = null;
      this.showDrawerConfigWidget = false;
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
