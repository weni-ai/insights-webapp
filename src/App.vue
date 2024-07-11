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
      token: (state) => state.config.token,
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
    this.listenConnect();
  },

  async mounted() {
    try {
      const hasTokenInUrl = window.location.pathname.startsWith(
        '/loginexternal/Bearer+',
      );

      let token = '';

      if (hasTokenInUrl) {
        token = window.location.pathname
          .replace('/loginexternal/Bearer+', '')
          .slice(0, -1);
      }

      const queryString = new URLSearchParams(window.location.search);

      const projectUuid = queryString.get('projectUuid');

      this.setToken(token || localStorage.getItem('token'));
      this.setProject({
        uuid: projectUuid || localStorage.getItem('projectUuid'),
      });

      await this.getDashboards();
    } catch (error) {
      console.log(error);
    }
  },

  methods: {
    ...mapActions({
      getDashboards: 'dashboards/getDashboards',
      getCurrentDashboardFilters: 'dashboards/getCurrentDashboardFilters',
      setToken: 'config/setToken',
      setProject: 'config/setProject',
    }),

    handlingSetLanguage(language) {
      this.$i18n.locale = language; // 'en', 'pt-br', 'es'
    },

    handlingSetProject(projectUuid) {
      localStorage.setItem('projectUuid', projectUuid);
      this.setProject({ uuid: projectUuid });
    },

    listenConnect() {
      window.parent.postMessage({ event: 'getLanguage' }, '*');

      window.addEventListener('message', (ev) => {
        const message = ev.data;
        const { handling, dataKey } = this.getEventHandling(message?.event);
        if (handling) handling(message?.[dataKey]);
      });
    },

    getEventHandling(eventName) {
      const handlingFunctionMapper = {
        setLanguage: this.handlingSetLanguage,
        setProject: this.handlingSetProject,
      };

      const handlingParamsMapper = {
        setLanguage: 'language',
        setProject: 'projectUuid',
      };

      return {
        handling: handlingFunctionMapper[eventName],
        dataKey: handlingParamsMapper[eventName],
      };
    },
  },
};
</script>
