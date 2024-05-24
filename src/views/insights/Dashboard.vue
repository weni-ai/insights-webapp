<template>
  <section
    class="dashboard"
    :style="dashboardGridStyle"
  >
    oi
  </section>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'DashboardView',

  mounted() {
    this.setDashboardStyleGrid();
  },

  computed: {
    ...mapState({
      currentDashboard: (state) => state.dashboards.currentDashboard,
    }),
  },

    dashboardGridStyle() {
      const { grid } = this.currentDashboard || {};
      const { refDashboard } = this.$refs;

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
