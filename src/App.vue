<template>
  <div id="app">
    <InsightsLayout
      ref="insights-layout"
      v-if="dashboards.length"
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

  async created() {
    await this.getDashboards();
  },

  computed: {
    ...mapState({
      dashboards: (state) => state.dashboards.dashboards,
      currentDashboard: (state) => state.dashboards.currentDashboard,
    }),
  },

  methods: {
    ...mapActions({
      setDashboards: 'dashboards/setDashboards',
      setCurrentDashboardWidgets: 'dashboards/setCurrentDashboardWidgets',
    }),

    async getDashboards() {
      const response = await Dashboards.getAll();
      this.setDashboards(response);
    },

    async getCurrentDashboardWidgets() {
      const response = await Dashboards.getDashboardWidgets(
        this.currentDashboard.uuid,
      );
      this.setCurrentDashboardWidgets(response);
    },
  },

  watch: {
    'currentDashboard.uuid'() {
      this.getCurrentDashboardWidgets();
    },
  },
};
</script>
