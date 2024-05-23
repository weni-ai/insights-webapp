<template>
  <section
    class="dashboard"
    ref="refDashboard"
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

  methods: {
    setDashboardStyleGrid() {
      const { grid } = this.currentDashboard || {};
      const { refDashboard } = this.$refs;

      if (grid) {
        refDashboard.style.grid = `${grid.rows}fr / ${grid.columns}fr`;
      }
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
