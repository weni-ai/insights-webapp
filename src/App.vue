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
      ref="insightsLayout"
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

<script lang="ts">
import { safeImport } from './utils/moduleFederation';

const { useSharedStore } = await safeImport(
  () => import('connect/sharedStore'),
  'connect/sharedStore',
);
</script>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useDashboards } from './store/modules/dashboards';
import { useConfig } from './store/modules/config';
import { useOnboarding } from './store/modules/onboarding';
import { useProject } from './store/modules/project';
import { useUser } from './store/modules/user';
import { useFeatureFlag } from './store/modules/featureFlag';
import { useCTWA } from './store/modules/ctwa';

import InsightsLayout from '@/layouts/InsightsLayout.vue';
import IconLoading from './components/IconLoading.vue';
import CompleteOnboardingModal from './components/CompleteOnboardingModal.vue';
import McpNewsModal from './components/McpNewsModal.vue';

import initHotjar from '@/utils/plugins/Hotjar';
import { parseJwt } from '@/utils/jwt';
import moment from 'moment';
import { moduleStorage } from '@/utils/storage';

defineOptions({ name: 'App' });

const { locale } = useI18n();
const route = useRoute();
const router = useRouter();

const dashboardsStore = useDashboards();
const configStore = useConfig();
const onboardingStore = useOnboarding();
const projectStore = useProject();
const userStore = useUser();
const featureFlagStore = useFeatureFlag();
const ctwaStore = useCTWA();

const {
  dashboards,
  isLoadingDashboards,
  isLoadingCurrentDashboardFilters,
  currentDashboard,
} = storeToRefs(dashboardsStore);
const { showCompleteOnboardingModal } = storeToRefs(onboardingStore);

const insightsLayout = ref<any>(null);
const showMcpNewsModal = ref(!moduleStorage.getItem('mcp_news_modal_seen'));

const sharedStore = computed(() => useSharedStore?.());

const handleCurrentDashboardUuidChange = async (
  newCurrentDashboardUuid?: string | null,
) => {
  if (newCurrentDashboardUuid) {
    dashboardsStore.setCurrentDashboardFilters([]);
    await dashboardsStore.getCurrentDashboardFilters();
    await featureFlagStore.getFeatureFlags();
  }
};

const handlerSetLanguage = (language: string) => {
  locale.value = language;
  moment.locale(language);
};

const handlerSetProject = (projectUuid: string) => {
  moduleStorage.setItem('projectUuid', projectUuid);
  configStore.setProject({ uuid: projectUuid });
  configStore.loadProjectInfo();
};

const handlerSetIsCommerce = (isCommerce: boolean) => {
  projectStore.setIsCommerce(isCommerce);
};

const handleRedirectToHumanServiceDashboard = () => {
  const isHumanServiceDashboardRouter = route.name === 'humanServiceDashboard';

  if (isHumanServiceDashboardRouter) {
    const humanSeriveDashboard = dashboards.value.find(
      (dash: any) => dash.config?.type === 'human_support',
    );

    if (humanSeriveDashboard) {
      router.push(`/${humanSeriveDashboard.uuid}`);
    }
  }
};

const handleMcpNotNow = () => {
  moduleStorage.setItem('mcp_news_modal_seen', true);
  moduleStorage.setItem('mcp_news_show_disclaimer', true);
  showMcpNewsModal.value = false;

  if (insightsLayout.value) {
    insightsLayout.value.showMcpDisclaimer = true;
  }
};

const handleMcpViewGuide = () => {
  moduleStorage.setItem('mcp_news_modal_seen', true);
  moduleStorage.setItem('mcp_news_show_disclaimer', false);
  showMcpNewsModal.value = false;

  if (insightsLayout.value) {
    insightsLayout.value.showMcpDisclaimer = false;
  }
};

const handlerTokenAndProjectUuid = async () => {
  const queryString = new URLSearchParams(window.location.search);

  const projectUuid = queryString.get('projectUuid');

  const authToken = moduleStorage.getItem('token');

  const newProjectUuid = projectUuid || moduleStorage.getItem('projectUuid');

  configStore.setToken(authToken);
  configStore.setProject({
    uuid: newProjectUuid,
  });

  const sessionUserEmail = parseJwt(authToken)?.email || null;

  if (sessionUserEmail) {
    userStore.setEmail(sessionUserEmail);
  }

  initHotjar(sessionUserEmail);
};

const setShowCompleteOnboardingModal = (show: boolean) =>
  onboardingStore.setShowCompleteOnboardingModal(show);

watch(() => currentDashboard.value?.uuid, handleCurrentDashboardUuidChange);

watch(
  () => sharedStore.value?.user?.language,
  (newLanguage) => {
    if (!newLanguage) return;
    handlerSetLanguage(newLanguage);
  },
  { immediate: true },
);

watch(
  () => sharedStore.value?.current?.project,
  (newProject) => {
    if (!newProject) return;
    handlerSetProject(newProject?.uuid);
    handlerSetIsCommerce(newProject?.type === 2);
  },
  { immediate: true, deep: true },
);

watch(
  () => sharedStore.value?.activeFederatedModules?.insights,
  (isActive) => {
    if (isActive === undefined) return;
    configStore.setIsActiveRoute(isActive);
  },
  { immediate: true, deep: true },
);

watch(
  () => route.name,
  () => {
    handleRedirectToHumanServiceDashboard();
  },
);

onMounted(async () => {
  try {
    await handlerTokenAndProjectUuid();
    await configStore.loadProjectInfo();

    ctwaStore.verifyCTWA();

    projectStore.checkHasAbandonedCartRecoveryConfigured().then(() => {
      projectStore.getAbandonedCartRecoveryCost();
    });

    projectStore.checkHasSectorsConfigured();
    dashboardsStore.getDashboards().then(() => {
      handleRedirectToHumanServiceDashboard();
    });
    userStore.verifyIsViewerPermission();
  } catch (error) {
    console.error(error);
  }
});
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

<style lang="scss">
/* This is necessary to prevent being behind some screen items such as svgs, tour popover and alerts */
.alert-container,
.unnnic-tour__mask,
.unnnic-tour__popover {
  z-index: 99999999 !important;
}

[unnnic-toast-container] .unnnic-toast--attention {
  top: $unnnic-space-4;
  right: $unnnic-space-4;
  bottom: auto !important;
}
</style>
