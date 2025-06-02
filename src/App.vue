<template>
  <div
    id="app"
    :class="`app-insights-${!sharedStore ? 'dev' : 'prod'}`"
  >
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
import { mapState, mapActions } from 'pinia';

import { useDashboards } from './store/modules/dashboards';
import { useConfig } from './store/modules/config';
import { useOnboarding } from './store/modules/onboarding';
import { useProject } from './store/modules/project';
import { useUser } from './store/modules/user';

import InsightsLayout from '@/layouts/InsightsLayout.vue';
import IconLoading from './components/IconLoading.vue';
import WelcomeOnboardingModal from './components/WelcomeOnboardingModal.vue';
import CompleteOnboardingModal from './components/CompleteOnboardingModal.vue';
import DashboardOnboarding from './components/insights/onboardings/DashboardOnboarding.vue';

import initHotjar from '@/utils/plugins/Hotjar';
import { parseJwt } from '@/utils/jwt';
import moment from 'moment';

import { safeImport } from './utils/moduleFederation';

const { useSharedStore } = await safeImport(
  () => import('connect/sharedStore'),
  'connect/sharedStore',
);

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
    ...mapState(useDashboards, [
      'dashboards',
      'isLoadingDashboards',
      'isLoadingCurrentDashboardFilters',
      'currentDashboard',
    ]),
    ...mapState(useConfig, ['token']),
    ...mapState(useOnboarding, {
      showCreateDashboardTour: 'showCreateDashboardOnboarding',
      showCompleteOnboardingModal: 'showCompleteOnboardingModal',
    }),
    sharedStore: () => useSharedStore?.(),
  },

  watch: {
    async 'currentDashboard.uuid'(newCurrentDashboardUuid) {
      if (newCurrentDashboardUuid) {
        this.setCurrentDashboardFilters([]);
        await this.getCurrentDashboardFilters();
      }
    },
    'sharedStore.user.language': {
      immediate: true,
      handler(newLanguage) {
        if (!newLanguage) return;

        this.handlerSetLanguage(newLanguage);
      },
    },
    'sharedStore.current.project.type': {
      immediate: true,
      handler(newProjectType) {
        this.setIsCommerce(newProjectType === 2);
      },
    },
  },

  created() {
    this.listenConnect();
  },

  async mounted() {
    try {
      this.handlerTokenAndProjectUuid();
      this.getDashboards().then(() => {
        this.handlerShowOnboardingModal();
      });
    } catch (error) {
      console.error(error);
    }
  },

  methods: {
    ...mapActions(useDashboards, [
      'getDashboards',
      'getCurrentDashboardFilters',
      'setCurrentDashboardFilters',
    ]),
    ...mapActions(useConfig, [
      'setToken',
      'setProject',
      'checkEnableCreateCustomDashboards',
    ]),
    ...mapActions(useProject, ['setIsCommerce']),
    ...mapActions(useUser, ['setEmail']),
    ...mapActions(useOnboarding, [
      'setOnboardingRef',
      'setShowCreateDashboardOnboarding',
      'setShowCompleteOnboardingModal',
    ]),

    async handlerTokenAndProjectUuid() {
      const queryString = new URLSearchParams(window.location.search);

      const projectUuid = queryString.get('projectUuid');

      const authToken = localStorage.getItem('token');

      const newProjectUuid = projectUuid || localStorage.getItem('projectUuid');

      this.setToken(authToken);
      this.setProject({
        uuid: newProjectUuid,
      });

      const sessionUserEmail = parseJwt(authToken)?.email || null;

      if (sessionUserEmail) {
        this.setEmail(sessionUserEmail);
      }

      initHotjar(sessionUserEmail);

      await this.checkEnableCreateCustomDashboards();
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
      window.addEventListener('message', (ev) => {
        const message = ev.data;
        const { handler, dataKey } = this.getEventHandler(message?.event);
        if (handler) handler(message?.[dataKey]);
      });
    },

    getEventHandler(eventName) {
      const handlerFunctionMapper = {
        setProject: this.handlerSetProject,
      };

      const handlerParamsMapper = {
        setProject: 'projectUuid',
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
  height: 100%;
}

.app-insights-prod {
  height: 100%;
  width: 100%;
}

.app-insights-dev {
  height: 100vh;
  width: 100vw;
}
</style>

<style>
/* This is necessary to prevent the alert from being behind some screen items such as svgs */
.alert-container {
  z-index: 99999999;
}
</style>
