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

  created() {
    this.listenConnectLocale();
  },

  methods: {
    ...mapActions({
      getDashboards: 'dashboards/getDashboards',
      getCurrentDashboardFilters: 'dashboards/getCurrentDashboardFilters',
    }),

    listenConnectLocale() {
      window.parent.postMessage({ event: 'getLanguage' }, '*');

      window.addEventListener('message', (ev) => {
        const message = ev.data;
        const isLocaleChangeMessage = message?.event === 'setLanguage';
        if (!isLocaleChangeMessage) return;

        const locale = message?.language; // 'en', 'pt-br', 'es'

        this.$i18n.locale = locale;
      });
    },
  },
};
</script>
