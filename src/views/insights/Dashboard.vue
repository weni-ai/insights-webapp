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
      />
    </template>
  </section>
</template>

<script>
import { mapState } from 'vuex';

import DynamicWidget from '@/components/insights/widgets/DynamicWidget.vue';

export default {
  name: 'DashboardView',

  components: {
    DynamicWidget,
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

  methods: {
    getWidgetStyle(gridPosition) {
      return {
        gridColumn: `${gridPosition.column_start} / ${gridPosition.column_end + 1}`,
        gridRow: `${gridPosition.row_start} / ${gridPosition.row_end + 1}`,
      };
    },

    getWidgetLoadingStatus(widget) {
      return widget.config ? !Object.keys(widget).includes('data') : false;
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
