<template>
  <header class="insights-layout-header">
    <UnnnicPageHeader
      v-if="currentDashboard && !isExpansiveMode"
      :hideDivider="!showDivider"
      :class="[
        'insights-page-header',
        { 'insights-page-header--show-divider': showDivider },
      ]"
      data-testid="insights-layout-header"
    >
      <template #infos>
        <HeaderSelectDashboard v-if="!isExpansiveMode" />
      </template>
      <template #actions>
        <section class="insights-layout-header__actions">
          <DynamicHeader :dashboardType="dashboardHeaderType" />
        </section>
      </template>
    </UnnnicPageHeader>
    <section
      v-else-if="isExpansiveMode"
      data-testid="insights-layout-header"
    >
      <section
        class="insights-layout-header__expansive"
        data-testid="insights-layout-header-expansive"
      >
        <p
          class="insights-layout-header__expansive-title"
          data-testid="insights-layout-header-expansive-title"
        >
          {{ $t('human_service_dashboard.all_agents') }}
        </p>
        <UnnnicButton
          iconCenter="close"
          size="small"
          type="tertiary"
          class="insights-layout-header__expansive-close"
          @click="setCurrentExpansiveWidget({})"
        />
      </section>
    </section>
  </header>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';
import { useWidgets } from '@/store/modules/widgets';

import HeaderSelectDashboard from './HeaderSelectDashboard/index.vue';
import DynamicHeader from './DynamicHeader.vue';

defineOptions({ name: 'InsightsLayoutHeader' });

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const dashboardsStore = useDashboards();
const widgetsStore = useWidgets();

const { dashboards, currentDashboard, dashboardDefault } =
  storeToRefs(dashboardsStore);
const { currentExpansiveWidget } = storeToRefs(widgetsStore);

const isExpansiveMode = computed(() => {
  const widget = currentExpansiveWidget.value;
  return !!(widget && Object.keys(widget).length > 0);
});

const isCTWADashboard = computed(
  () => currentDashboard.value?.name === 'ctwa_dashboard.title',
);

const isHumanServiceDashboard = computed(
  () => currentDashboard.value?.name === 'human_service_dashboard.title',
);

const isHumanSupportDashboard = computed(
  () => currentDashboard.value?.name === 'human_support_dashboard.title',
);

const showDivider = computed(() => isCTWADashboard.value);

const isConversationalDashboard = computed(
  () => currentDashboard.value?.name === 'conversations_dashboard.title',
);

const isMetaTemplateDashboard = computed(
  () => currentDashboard.value?.config?.is_whatsapp_integration,
);

const dashboardHeaderType = computed(() => {
  if (isCTWADashboard.value) {
    return 'ctwa';
  }

  if (isConversationalDashboard.value) {
    return 'conversational';
  }

  if (isHumanSupportDashboard.value) {
    return 'human_support';
  }

  if (isMetaTemplateDashboard.value) {
    return 'metaTemplateMessage';
  }

  if (isHumanServiceDashboard.value) {
    return 'human_service';
  }

  return 'custom';
});

const breadcrumbs = computed(() => {
  const dashboard = currentDashboard.value;
  const { dashboardUuid } = route.params;

  const crumbs: Record<string, any>[] = [
    {
      path: dashboard.uuid,
      routeName: 'dashboard',
      name: `Analytics ${t(dashboard.name || '')}`,
    },
  ];

  if (route.name === 'report') {
    crumbs[1] = {
      path: route.path,
      routePath: 'report',
      name: `${t('report')} ${t(dashboard.name || '')}`,
    };
  }

  return dashboardUuid === dashboard.uuid ? crumbs : [];
});

const navigateToDashboard = (uuid: string) => {
  if (!uuid) return;
  router.replace({
    name: 'dashboard',
    params: { dashboardUuid: uuid },
  });
};

const goToDefaultDashboard = () => {
  const { uuid } = dashboardDefault.value;
  navigateToDashboard(uuid);
};

const routeUpdateCurrentDashboard = () => {
  const { dashboardUuid } = route.params;

  const dashboardRelativeToPath = dashboards.value.find(
    ({ uuid }) => dashboardUuid === uuid,
  );

  if (!dashboardRelativeToPath) {
    goToDefaultDashboard();
  }

  dashboardsStore.setCurrentDashboard(
    dashboardRelativeToPath || dashboardDefault.value,
  );
};

const setCurrentExpansiveWidget = (...args: any[]) =>
  widgetsStore.setCurrentExpansiveWidgetData(...args);

watch(currentDashboard, (_newCurrentDashboard, oldCurrentDashboard) => {
  if (oldCurrentDashboard?.uuid) {
    navigateToDashboard(currentDashboard.value.uuid);
  }
});

watch(
  () => route.params.dashboardUuid,
  (newUuid, oldUuid) => {
    if (newUuid !== oldUuid) {
      routeUpdateCurrentDashboard();
    }
  },
);

onMounted(() => {
  routeUpdateCurrentDashboard();
});

defineExpose({
  isExpansiveMode,
  isCTWADashboard,
  isHumanServiceDashboard,
  isHumanSupportDashboard,
  showDivider,
  isConversationalDashboard,
  isMetaTemplateDashboard,
  dashboardHeaderType,
  breadcrumbs,
  navigateToDashboard,
  goToDefaultDashboard,
  routeUpdateCurrentDashboard,
  setCurrentExpansiveWidget,
  setCurrentDashboard: (...args: any[]) =>
    dashboardsStore.setCurrentDashboard(...args),
});
</script>

<style lang="scss" scoped>
$dropdownFixedWidth: 314px;
.insights-layout-header {
  :deep(.insights-page-header) {
    grid-template-columns: $dropdownFixedWidth 1fr;
    padding-bottom: 0;
  }

  :deep(.insights-page-header--show-divider) {
    padding-bottom: $unnnic-space-6;
  }
  &__actions {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: $unnnic-space-3;
  }
  &__expansive {
    border-radius: 0.5rem 0.5rem 0rem 0rem;
    background: $unnnic-color-gray-0;
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    padding: $unnnic-space-2 $unnnic-space-6;

    &-title {
      font: $unnnic-font-display-2;
      font-weight: 900;
      color: $unnnic-color-gray-12;
    }

    &-close {
      background-color: $unnnic-color-gray-0;
    }
  }
}
</style>
