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
    <WelcomeOnboardingModal
      :showModal="showOnboardingModal"
      @close="showOnboardingModal = false"
      @start-onboarding="handlingStartOnboarding"
    />
    <UnnnicTour
      v-if="showCreateDashboardTour"
      ref="dashboardOnboardingTour"
      :steps="[
        {
          title: 'Crie um Dashboard personalizado',
          description:
            'Além de poder acompanhar sua operação através do Dashboard de Atendimento humano, você pode ter quantos Dashboards quiser, clique no local indicado para criar um novo Dashboard.',
          attachedElement:
            onboardingRefs['select-dashboard'] ||
            onboardingRefs['insights-layout'],
          popoverPosition: 'right',
        },
        {
          title: 'Crie um Dashboard personalizado',
          description:
            'Além de poder acompanhar sua operação através do Dashboard de Atendimento humano, você pode ter quantos Dashboards quiser, clique no local indicado para criar um novo Dashboard.',
          attachedElement:
            onboardingRefs['create-dashboard-button'] ||
            onboardingRefs['insights-layout'],
          popoverPosition: 'right',
        },
      ]"
    />
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
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
      showCreateDashboardTour: (state) =>
        state.refs.showCreateDashboardOnboarding,
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
      this.setOnboardingRef({
        key: 'insights-layout',
        ref: this.$refs['insights-layout'].$el,
      });
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

    ...mapMutations({
      setOnboardingRef: 'refs/SET_ONBOARDING_REF',
      setShowCreateDashboardOnboarding:
        'refs/SET_SHOW_CREATE_DASHBOARD_ONBOARDING',
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
      const hasCustomDashboard = this.dashboards.find(
        (dashboard) => dashboard.is_deletable,
      );

      if (hasCustomDashboard) {
        localStorage.setItem('hasDashboardOnboardingComplete', 'true');
        this.showOnboardingModal = false;
        return;
      }

      const hasOnboardingComplete =
        JSON.parse(localStorage.getItem('hasDashboardOnboardingComplete')) ||
        false;
      this.showOnboardingModal = !hasOnboardingComplete;
    },

    handlingStartOnboarding() {
      this.showOnboardingModal = false;
      this.setShowCreateDashboardOnboarding(true);
      this.$nextTick(() => {
        this.setOnboardingRef({
          key: 'dashboard-onboarding-tour',
          ref: this.$refs.dashboardOnboardingTour,
        });
        this.onboardingRefs['dashboard-onboarding-tour'].start();
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
