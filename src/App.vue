<template>
  <div
    id="app"
    :class="`app-insights-${!sharedStore ? 'dev' : 'prod'}`"
  >
    <WelcomeOnboardingModal
      data-testid="welcome-onboarding-modal"
      :showModal="showOnboardingModal"
      @close="showOnboardingModal = false"
      @start-onboarding="handlerStartOnboarding"
    />
    <CompleteOnboardingModal
      data-testid="complete-onboarding-modal"
      :showModal="showCompleteOnboardingModal"
      @finish-onboarding="setShowCompleteOnboardingModal(false)"
    />
    <DashboardOnboarding
      v-if="showCreateDashboardTour"
      data-testid="dashboard-onboarding"
    />
    <section
      v-if="isLoadingDashboards"
      class="loading-container"
      data-testid="loading-container-dashboards"
    >
      <img
        src="./assets/images/weni-loading.svg"
        width="64"
      />
    </section>
    <InsightsLayout
      v-else-if="dashboards.length"
      ref="insights-layout"
      data-testid="insights-layout"
    >
      <section
        v-if="isLoadingCurrentDashboardFilters"
        class="loading-container"
        data-testid="loading-container-current-dashboard-filters"
      >
        <IconLoading data-testid="icon-loading" />
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
import { moduleStorage } from '@/utils/storage';

import { safeImport } from './utils/moduleFederation';
import { useFeatureFlag } from './store/modules/featureFlag';

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
    ...mapState(useConfig, ['token', 'enableCreateCustomDashboards']),
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
        await this.getFeatureFlags();
      }
    },
    'sharedStore.user.language': {
      immediate: true,
      handler(newLanguage) {
        if (!newLanguage) return;

        this.handlerSetLanguage(newLanguage);
      },
    },
    'sharedStore.current.project': {
      immediate: true,
      deep: true,
      handler(newProject) {
        if (!newProject) return;

        this.handlerSetProject(newProject?.uuid);
        this.setIsCommerce(newProject?.type === 2);
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
      'checkEnableCsat',
    ]),
    ...mapActions(useFeatureFlag, ['getFeatureFlags']),
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

      const authToken = moduleStorage.getItem('token');

      const newProjectUuid =
        projectUuid || moduleStorage.getItem('projectUuid');

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
      await this.checkEnableCsat();
    },

    handlerSetLanguage(language) {
      this.$i18n.locale = language; // 'en', 'pt-br', 'es'
      moment.locale(language);
    },

    handlerSetProject(projectUuid) {
      moduleStorage.setItem('projectUuid', projectUuid);
      this.setProject({ uuid: projectUuid });
    },

    handlerSetIsCommerce(isCommerce) {
      this.setIsCommerce(isCommerce);
    },

    listenConnect() {
      window.parent.postMessage({ event: 'getLanguage' }, '*');
      window.parent.postMessage({ event: 'getIsCommerce' }, '*');

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
        setIsCommerce: this.handlerSetIsCommerce,
      };

      const handlerParamsMapper = {
        setLanguage: 'language',
        setProject: 'projectUuid',
        setIsCommerce: 'isCommerce',
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

      if (hasCustomDashboard || !this.enableCreateCustomDashboards) {
        moduleStorage.setItem('hasDashboardOnboardingComplete', true);
        this.showOnboardingModal = false;
        return;
      }

      const hasOnboardingComplete = moduleStorage.getItem(
        'hasDashboardOnboardingComplete',
        false,
      );

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
