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
      setCurrentDashboardWidgetData: 'dashboards/setCurrentDashboardWidgetData',
    }),

    async getDashboards() {
      const response = await Dashboards.getAll();
      this.setDashboards(response);
    },

    async getCurrentDashboardWidgets() {
      const widgets = await Dashboards.getDashboardWidgets(
        this.currentDashboard.uuid,
      );
      this.setCurrentDashboardWidgets(widgets);
      this.getCurrentDashboardWidgetsDatas(widgets);
    },

    async getCurrentDashboardWidgetsDatas(widgets) {
      Promise.all(
        widgets.map(async ({ uuid }) => {
          this.setCurrentDashboardWidgetData(await this.fetchWidgetData(uuid));
        }),
      );
    },

    async fetchWidgetData(uuid) {
      try {
        const responseData = await Dashboards.getDashboardWidgetData({
          dashboardUuid: this.currentDashboard.uuid,
          widgetUuid: uuid,
        });
        return { uuid, data: responseData };
      } catch (error) {
        console.error(error);
        return { uuid, data: null };
      }
    },
  },

  watch: {
    'currentDashboard.uuid'() {
      this.getCurrentDashboardWidgets();
    },
  },
};
</script>
