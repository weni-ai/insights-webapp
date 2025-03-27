<template>
  <div id="app">
    <WelcomeOnboardingModal
      :showModal="showOnboardingModal"
      @close="showOnboardingModal = false"
      @start-onboarding="handlerStartOnboarding"
    />
    <CompleteOnboardingModal
      :showModal="showCompleteOnboardingModal"
      @finish-onboarding="setShowCompleteOnboardingModal(false)"
    />
    <DashboardOnboarding v-if="showCreateDashboardTour" />
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
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import InsightsLayout from '@/layouts/InsightsLayout.vue';
import IconLoading from './components/IconLoading.vue';
import WelcomeOnboardingModal from './components/WelcomeOnboardingModal.vue';
import CompleteOnboardingModal from './components/CompleteOnboardingModal.vue';
import DashboardOnboarding from './components/insights/onboardings/DashboardOnboarding.vue';

import initHotjar from '@/utils/plugins/Hotjar';
import { parseJwt } from '@/utils/jwt';
import moment from 'moment';

export default {
  components: {
    InsightsLayout,
    IconLoading,
    WelcomeOnboardingModal,
    CompleteOnboardingModal,
    DashboardOnboarding,
  },
  data() {
    return {
      showOnboardingModal: false,
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
      showCreateDashboardTour: (state) =>
        state.onboarding.showCreateDashboardOnboarding,
      showCompleteOnboardingModal: (state) =>
        state.onboarding.showCompleteOnboardingModal,
    }),
  },

  watch: {
    'currentDashboard.uuid'(newCurrentDashboardUuid) {
      if (newCurrentDashboardUuid) {
        this.getCurrentDashboardFilters();
      }
    },
    token: {
      once: true,
      async handler() {
        try {
          await this.checkEnableCreateCustomDashboards();
          this.getDashboards().then(() => {
            this.handlerShowOnboardingModal();
          });
        } catch (error) {
          console.error(error);
        }
      },
    },
  },

  created() {
    this.listenConnect();
  },

  mounted() {
    this.handlerProjectUuid();
    const isInIframe = window.self !== window.top;
    if (!isInIframe) this.setToken(localStorage.getItem('token'));
  },

  methods: {
    ...mapActions({
      getDashboards: 'dashboards/getDashboards',
      getCurrentDashboardFilters: 'dashboards/getCurrentDashboardFilters',
      setToken: 'config/setToken',
      setProject: 'config/setProject',
      checkEnableCreateCustomDashboards:
        'config/checkEnableCreateCustomDashboards',
      setEmail: 'user/setEmail',
    }),

    ...mapMutations({
      setOnboardingRef: 'onboarding/SET_ONBOARDING_REF',
      setShowCreateDashboardOnboarding:
        'onboarding/SET_SHOW_CREATE_DASHBOARD_ONBOARDING',
      setShowCompleteOnboardingModal:
        'onboarding/SET_SHOW_COMPLETE_ONBOARDING_MODAL',
    }),

    handlerProjectUuid() {
      const queryString = new URLSearchParams(window.location.search);

      const projectUuid =
        queryString.get('projectUuid') || localStorage.getItem('projectUuid');

      this.setProject({
        uuid: projectUuid,
      });
    },

    async handlerUpdateToken(token) {
      if (!token) return;

      await this.setToken(token);

      const sessionUserEmail = parseJwt(token)?.email || null;

      if (sessionUserEmail) {
        this.setEmail(sessionUserEmail);
      }

      initHotjar(sessionUserEmail);
    },

    handlerSetLanguage(language) {
      this.$i18n.locale = language; // 'en', 'pt-br', 'es'
      moment.locale(language);
    },

    handlerSetProject(projectUuid) {
      localStorage.setItem('projectUuid', projectUuid);
      this.setProject({ uuid: projectUuid });
    },

    listenConnect() {
      window.parent.postMessage({ event: 'getLanguage' }, '*');
      window.parent.postMessage({ event: 'getToken' }, '*');

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
        updateToken: this.handlerUpdateToken,
      };

      const handlerParamsMapper = {
        setLanguage: 'language',
        setProject: 'projectUuid',
        updateToken: 'token',
      };

      return {
        handler: handlerFunctionMapper[eventName],
        dataKey: handlerParamsMapper[eventName],
      };
    },

    handlerShowOnboardingModal() {
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

    handlerStartOnboarding() {
      this.showOnboardingModal = false;
      this.setShowCreateDashboardOnboarding(true);
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

<style>
/* This is necessary to prevent the alert from being behind some screen items such as svgs */
.alert-container {
  z-index: 99999999;
}
</style>
