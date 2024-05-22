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
    }),
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
