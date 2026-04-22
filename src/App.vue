<template>
  <div
    id="app"
    :class="`app-insights-${!sharedStore ? 'dev' : 'prod'}`"
  >
    <CompleteOnboardingModal
      data-testid="complete-onboarding-modal"
      :showModal="showCompleteOnboardingModal"
      @finish-onboarding="setShowCompleteOnboardingModal(false)"
    />
    <McpNewsModal
      v-if="showMcpNewsModal"
      :modelValue="showMcpNewsModal"
      data-testid="mcp-news-modal"
      @not-now="handleMcpNotNow"
      @view-guide="handleMcpViewGuide"
      @update:model-value="showMcpNewsModal = $event"
    />
    <section
      v-if="isLoadingDashboards"
      class="loading-container"
      data-testid="loading-container-dashboards"
    >
      <UnnnicIconLoading size="xl" />
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
import CompleteOnboardingModal from './components/CompleteOnboardingModal.vue';
import McpNewsModal from './components/McpNewsModal.vue';

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
    CompleteOnboardingModal,
    McpNewsModal,
  },
  data() {
    return {
      showMcpNewsModal: !moduleStorage.getItem('mcp_news_modal_seen'),
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
    'sharedStore.activeFederatedModules.insights': {
      immediate: true,
      deep: true,
      handler(isActive) {
        if (isActive === undefined) return;

        this.setIsActiveRoute(isActive);
      },
    },
    '$route.name': {
      deep: true,
      handler() {
        this.handleRedirectToHumanServiceDashboard();
      },
    },
  },

  created() {
    this.listenConnect();
  },

  async mounted() {
    try {
      await this.handlerTokenAndProjectUuid();
      this.checkHasSectorsConfigured();
      this.getDashboards().then(() => {
        this.handleRedirectToHumanServiceDashboard();
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
    ...mapActions(useFeatureFlag, ['getFeatureFlags']),
    ...mapActions(useProject, [
      'setIsCommerce',
      'checkHasSectorsConfigured',
      'checkHasTagsConfigured',
    ]),
    ...mapActions(useUser, ['setEmail']),
    ...mapActions(useOnboarding, [
      'setOnboardingRef',
      'setShowCreateDashboardOnboarding',
      'setShowCompleteOnboardingModal',
    ]),

    handleMcpNotNow() {
      moduleStorage.setItem('mcp_news_modal_seen', true);
      moduleStorage.setItem('mcp_news_show_disclaimer', true);
      this.showMcpNewsModal = false;

      const layout = this.$refs['insights-layout'];
      if (layout) {
        layout.showMcpDisclaimer = true;
      }
    },

    handleMcpViewGuide() {
      moduleStorage.setItem('mcp_news_modal_seen', true);
      moduleStorage.setItem('mcp_news_show_disclaimer', false);
      this.showMcpNewsModal = false;

      const layout = this.$refs['insights-layout'];
      if (layout) {
        layout.showMcpDisclaimer = false;
      }
    },

    handleRedirectToHumanServiceDashboard() {
      const isHumanServiceDashboardRouter =
        this.$route.name === 'humanServiceDashboard';

      if (isHumanServiceDashboardRouter) {
        const humanSeriveDashboard = this.dashboards.find(
          (dash) => dash.config?.type === 'human_support',
        );

        if (humanSeriveDashboard) {
          this.$router.push(`/${humanSeriveDashboard.uuid}`);
        }
      }
    },

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
/* This is necessary to prevent being behind some screen items such as svgs, tour popover and alerts */
.alert-container,
.unnnic-tour__mask,
.unnnic-tour__popover {
  z-index: 99999999 !important;
}
</style>
