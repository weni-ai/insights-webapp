<template>
  <div id="app">
    <InsightsLayout
      v-if="dashboards.length && enableSystem"
      ref="insights-layout"
    >
      <RouterView />
    </InsightsLayout>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';

import InsightsLayout from '@/layouts/InsightsLayout.vue';

export default {
  components: { InsightsLayout },

  computed: {
    ...mapState({
      dashboards: (state) => state.dashboards.dashboards,
      currentDashboard: (state) => state.dashboards.currentDashboard,
    }),
    ...mapGetters({
      enableSystem: 'config/enableSystem',
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
      getDashboards: 'dashboards/getDashboards',
      getCurrentDashboardFilters: 'dashboards/getCurrentDashboardFilters',
    }),
  },
};
</script>
