<template>
  <div id="app">
    <InsightsLayout
      v-if="dashboards.length"
      ref="insights-layout"
    >
      <RouterView />
    </InsightsLayout>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import InsightsLayout from '@/layouts/InsightsLayout.vue';
import { Dashboards } from '@/services/api';

export default {
  components: { InsightsLayout },

  computed: {
    ...mapState({
      dashboards: (state) => state.dashboards.dashboards,
      currentDashboard: (state) => state.dashboards.currentDashboard,
    }),
  },

  watch: {
    'currentDashboard.uuid'(newCurrentDashboardUuid) {
      if (newCurrentDashboardUuid) {
        this.getCurrentDashboardFilters();
      }
    },
  },

  async created() {
    await this.getDashboards();
  },

  methods: {
    ...mapActions({
      setDashboards: 'dashboards/setDashboards',
      setCurrentDashboardFilters: 'dashboards/setCurrentDashboardFilters',
    }),

    async getDashboards() {
      const response = await Dashboards.getAll();
      this.setDashboards(response);
    },

    async getCurrentDashboardFilters() {
      const filters = await Dashboards.getDashboardFilters(
        this.currentDashboard.uuid,
      );
      this.setCurrentDashboardFilters(filters);
    },
  },
};
</script>
