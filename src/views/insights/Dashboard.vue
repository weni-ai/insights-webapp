<template>
  <section
    class="dashboard"
    :style="dashboardGridStyle"
  >
    <template
      v-for="widget of currentDashboardWidgets"
      :key="widget.uuid"
    >
      <DynamicWidget
        :style="getWidgetStyle(widget.grid_position)"
        :widget="widget"
        :isLoading="getWidgetLoadingStatus(widget)"
        @open-config="openDrawerConfigWidget(widget)"
      />
    </template>
    <DrawerConfigWidgetDynamic
      v-show="!!widgetConfigurating"
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

export default {
  name: 'DashboardView',

  components: {
    DynamicWidget,
    DrawerConfigWidgetDynamic,
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
          this.resetCurrentDashboardWidgets([]);
          this.handlingGetCurrentDashboardWidgets();
        }
      },
    },
  },

  methods: {
    ...mapActions({
      getCurrentDashboardWidgets: 'dashboards/getCurrentDashboardWidgets',
      fetchWidgetData: 'dashboards/fetchWidgetData',
      getCurrentDashboardWidgetsDatas:
        'dashboards/getCurrentDashboardWidgetsDatas',
    }),
    ...mapMutations({
      resetCurrentDashboardWidgets: 'dashboards/SET_CURRENT_DASHBOARD_WIDGETS',
    }),

    async handlingGetCurrentDashboardWidgets() {
      await this.getCurrentDashboardWidgets();
      await this.getCurrentDashboardWidgetsDatas();
    },

    getWidgetStyle(gridPosition) {
      return {
        gridColumn: `${gridPosition.column_start} / ${gridPosition.column_end + 1}`,
        gridRow: `${gridPosition.row_start} / ${gridPosition.row_end + 1}`,
      };
    },

    getWidgetLoadingStatus(widget) {
      const config = widget.config;
      const isConfigured = config && Object.keys(config).length !== 0;
      return isConfigured ? !Object.keys(widget).includes('data') : false;
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
}
</style>
