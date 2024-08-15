<template>
  <div id="app">
    <section
      v-if="isLoadingDashboards"
      class="loading-container"
    >
      <img
        src="./assets/images/weni-loading.svg"
        width="64"
      />
    </section>
    <InsightsLayout
      v-else-if="dashboards.length"
      ref="insights-layout"
    >
      <section
        v-if="isLoadingCurrentDashboardFilters"
        class="loading-container"
      >
        <IconLoading />
      </section>
      <RouterView v-else />
    </InsightsLayout>
  </div>
  <WelcomeOnboardingModal
    :showModal="showOnboardingModal"
    @close="showOnboardingModal = false"
    @start-onboarding="handlingStartOnboarding"
  />
  <UnnnicTour
    v-if="showTour"
    ref="tour"
    :steps="[
      {
        title: '1',
        description: 'desc',
        attachedElement: onboardingRefs['select-dashboard'],
        popoverPosition: 'right',
      },
      {
        title: '2',
        description: 'desc',
        attachedElement: onboardingRefs['select-dashboard'],
        popoverPosition: 'right',
      },
    ]"
  />
</template>

<script>
import { mapActions, mapState } from 'vuex';
import InsightsLayout from '@/layouts/InsightsLayout.vue';
import IconLoading from './components/IconLoading.vue';
import WelcomeOnboardingModal from './components/WelcomeOnboardingModal.vue';

export default {
  components: { InsightsLayout, IconLoading, WelcomeOnboardingModal },
  data() {
    return {
      showOnboardingModal: false,
      showTour: false,
    };
  },
  computed: {
    ...mapState({
      dashboards: (state) => state.dashboards.dashboards,
      isLoadingDashboards: (state) => state.dashboards.isLoadingDashboards,
      isLoadingCurrentDashboardFilters: (state) =>
        state.dashboards.isLoadingCurrentDashboardFilters,
      currentDashboard: (state) => state.dashboards.currentDashboard,
      token: (state) => state.config.token,
      onboardingRefs: (state) => state.refs.onboardingRefs,
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
      this.handlingTokenAndProjectUuid();
      await this.getDashboards();
      this.handlingShowOnboarding();
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
      checkEnableCreateCustomDashboards:
        'config/checkEnableCreateCustomDashboards',
    }),

    async handlingTokenAndProjectUuid() {
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
      await this.checkEnableCreateCustomDashboards();
    },

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

    handlingShowOnboarding() {
      this.$nextTick().then(() => {
        const hasOnboardingComplete =
          JSON.parse(localStorage.getItem('hasOnboardingComplete')) || false;
        this.showOnboardingModal = !hasOnboardingComplete;
      });
    },

    handlingStartOnboarding() {
      this.showTour = true;
      this.showOnboardingModal = false;
      this.onboardingRefs['select-dashboard'].click();
      this.$nextTick().then(() => {
        this.$refs.tour.start();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
}
</style>
