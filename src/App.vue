<template>
  <div id="app">
    <InsightsLayout ref="insights-layout">
      <RouterView />
    </InsightsLayout>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

import InsightsLayout from '@/layouts/InsightsLayout.vue';
import { Dashboards } from '@/services/api';

export default {
  components: { InsightsLayout },

  async created() {
    await this.getDashboards();
  },

  methods: {
    ...mapActions({
      setDashboards: 'dashboards/setDashboards',
    }),

    async getDashboards() {
      const response = await Dashboards.getAll();
      this.setDashboards(response);
    },
  },
};
</script>
