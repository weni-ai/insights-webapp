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
      @start-onboarding="handlerStartOnboarding"
    />
    <CompleteOnboardingModal
      :showModal="showCompleteOnboardingModal"
      @finish-onboarding="handlerFinishOnboarding"
    />
    <UnnnicTour
      v-if="showCreateDashboardTour"
      ref="dashboardOnboardingTour"
      :steps="dashboardTourSteps"
      @end-tour="setShowDashboardConfig(true)"
      @close="setShowCreateDashboardOnboarding(false)"
    />
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import InsightsLayout from '@/layouts/InsightsLayout.vue';
import IconLoading from './components/IconLoading.vue';
import WelcomeOnboardingModal from './components/WelcomeOnboardingModal.vue';
import CompleteOnboardingModal from './components/CompleteOnboardingModal.vue';

export default {
  components: {
    InsightsLayout,
    IconLoading,
    WelcomeOnboardingModal,
    CompleteOnboardingModal,
  },
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
      onboardingRefs: (state) => state.onboarding.onboardingRefs,
      showCreateDashboardTour: (state) =>
        state.onboarding.showCreateDashboardOnboarding,
      showCompleteOnboardingModal: (state) =>
        state.onboarding.showCompleteOnboardingModal,
    }),

    dashboardTourSteps() {
      return [
        {
          title: this.$t('dashboard_onboarding.step.create_dashboard.title'),
          description: this.$t(
            'dashboard_onboarding.step.create_dashboard.description',
          ),
          attachedElement:
            this.onboardingRefs['select-dashboard'] ||
            this.onboardingRefs['insights-layout'],
          popoverPosition: 'right',
        },
        {
          title: this.$t('dashboard_onboarding.step.create_dashboard.title'),
          description: this.$t(
            'dashboard_onboarding.step.create_dashboard.description',
          ),
          attachedElement:
            this.onboardingRefs['create-dashboard-button'] ||
            this.onboardingRefs['insights-layout'],
          popoverPosition: 'right',
          beforeRender: this.beforeOpenDashboardList,
        },
      ];
    },
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
      this.handlerTokenAndProjectUuid();
      await this.getDashboards();
      this.setOnboardingRef({
        key: 'insights-layout',
        ref: this.$refs['insights-layout'].$el,
      });
      this.handlerShowOnboarding();
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
      beforeOpenDashboardList: 'onboarding/beforeOpenDashboardList',
    }),

    ...mapMutations({
      setOnboardingRef: 'onboarding/SET_ONBOARDING_REF',
      setShowCreateDashboardOnboarding:
        'onboarding/SET_SHOW_CREATE_DASHBOARD_ONBOARDING',
      setShowCompleteOnboardingModal:
        'onboarding/SET_SHOW_COMPLETE_ONBOARDING_MODAL',
      setShowDashboardConfig: 'dashboards/SET_SHOW_DASHBOARD_CONFIG',
    }),

    async handlerTokenAndProjectUuid() {
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

    handlerSetLanguage(language) {
      this.$i18n.locale = language; // 'en', 'pt-br', 'es'
    },

    handlerSetProject(projectUuid) {
      localStorage.setItem('projectUuid', projectUuid);
      this.setProject({ uuid: projectUuid });
    },

    listenConnect() {
      window.parent.postMessage({ event: 'getLanguage' }, '*');

      window.addEventListener('message', (ev) => {
        const message = ev.data;
        const { handler, dataKey } = this.getEventHandler(message?.event);
        if (handler) handler(message?.[dataKey]);
      });
    },

    getEventHandler(eventName) {
      const handlerFunctionMapper = {
        setLanguage: this.handlerSetLanguage,
        setProject: this.handlerSetProject,
      };

      const handlerParamsMapper = {
        setLanguage: 'language',
        setProject: 'projectUuid',
      };

      return {
        handler: handlerFunctionMapper[eventName],
        dataKey: handlerParamsMapper[eventName],
      };
    },

    handlerShowOnboarding() {
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

    handlerFinishOnboarding() {
      this.setShowCompleteOnboardingModal(false);
    },

    handlerStartOnboarding() {
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
