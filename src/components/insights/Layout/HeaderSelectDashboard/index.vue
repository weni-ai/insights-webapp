<template>
  <UnnnicDropdown
    class="header-select-dashboard"
    position="bottom-right"
    data-onboarding-id="select-dashboard"
    :open="openDropdown"
    useOpenProp
    @update:open="handlerOpenDropdown"
  >
    <template #trigger>
      <section class="header-select-dashboard__trigger">
        <UnnnicIcon
          v-if="!($route.name === 'dashboard')"
          data-testid="back-icon"
          class="header-select-dashboard__arrow-back"
          icon="arrow_back"
          scheme="neutral-darkest"
          clickable
          @click.stop="$router.back"
        />
        <section
          data-testid="dropdown-trigger"
          class="header-select-dashboard__title"
        >
          <h1
            data-testid="dashboard-title"
            class="trigger__title"
            :title="dashboardTitle"
          >
            {{ dashboardTitle }}
          </h1>
          <BetaText v-if="isRenderBetaText" />
        </section>
        <UnnnicIcon
          data-testid="expand-icon"
          icon="expand_more"
        />
      </section>
    </template>

    <OptionSelectDashboard
      v-for="dashboard of enabledShowDashboards"
      :key="dashboard"
      data-testid="select-dashboard-item"
      :dashboard="dashboard"
    />

    <OptionCreateNewDashboard
      v-if="enableCreateCustomDashboards"
      data-testid="add-new-dashboard-button"
      data-onboarding-id="create-dashboard-button"
      @click="handlerCreateDashboardClick()"
    />
  </UnnnicDropdown>
  <DrawerDashboardConfig
    v-if="showDashboardConfig"
    v-model="showDashboardConfig"
    data-testid="drawer-dashboard-config"
    @close="setShowDashboardConfig(false)"
  />
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';
import { useConfig } from '@/store/modules/config';
import { useOnboarding } from '@/store/modules/onboarding';

import OptionSelectDashboard from './OptionSelectDashboard.vue';
import OptionCreateNewDashboard from './OptionCreateNewDashboard.vue';
import DrawerDashboardConfig from '@/components/insights/dashboards/DrawerDashboardConfig.vue';
import BetaText from './BetaText.vue';

defineOptions({ name: 'HeaderSelectDashboard' });

const { t } = useI18n();
const dashboardsStore = useDashboards();
const configStore = useConfig();
const onboardingStore = useOnboarding();

const { dashboards, currentDashboard, showDashboardConfig, dashboardDefault } =
  storeToRefs(dashboardsStore);
const { enableCreateCustomDashboards } = storeToRefs(configStore);

const openDropdown = ref(false);

const dashboardTitle = computed(() => {
  const title =
    currentDashboard.value.name ||
    dashboardDefault.value.name ||
    dashboards.value[0].name ||
    '';
  return t(title);
});

const isRenderBetaText = computed(
  () => currentDashboard.value.config?.type === 'ctwa',
);

const enabledShowDashboards = computed(() => dashboards.value);

const handlerCreateDashboardClick = () => {
  dashboardsStore.setShowDashboardConfig(true);
  onboardingStore.callTourNextStep('dashboard-onboarding-tour');
};

const handlerOpenDropdown = (open?: boolean) => {
  openDropdown.value = open !== undefined ? open : !openDropdown.value;
  if (openDropdown.value) {
    onboardingStore.callTourNextStep('dashboard-onboarding-tour');
  }
};

const setShowDashboardConfig = (...args: any[]) =>
  dashboardsStore.setShowDashboardConfig(...args);

onMounted(() => {
  nextTick(() => {
    onboardingStore.setOnboardingRef({
      key: 'select-dashboard',
      ref: document.querySelector('[data-onboarding-id="select-dashboard"]'),
    });
  });
});

defineExpose({
  openDropdown,
  dashboardTitle,
  isRenderBetaText,
  enabledShowDashboards,
  handlerCreateDashboardClick,
  handlerOpenDropdown,
  setShowDashboardConfig,
  setOnboardingRef: (...args: any[]) =>
    onboardingStore.setOnboardingRef(...args),
  callTourNextStep: (...args: any[]) =>
    onboardingStore.callTourNextStep(...args),
});
</script>

<style lang="scss" scoped>
$dropdownFixedWidth: 314px;

:deep(.unnnic-dropdown__content) {
  overflow-y: auto;
  max-height: 80vh;
  &.unnnic-dropdown__content__position-bottom-right {
    z-index: 5;
  }
}

.header-select-dashboard {
  display: flex;
  width: fit-content;

  &__title {
    display: flex;
    align-items: center;
    gap: $unnnic-space-1;
    cursor: pointer;
  }

  &__trigger {
    display: flex;
    align-items: center;
    gap: $unnnic-space-1;
    cursor: pointer;

    .trigger__title {
      margin: $unnnic-space-1 0;

      color: $unnnic-color-gray-12;
      font: $unnnic-font-display-2;
      text-wrap: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 621px;
    }
  }

  &__arrow-back {
    margin: $unnnic-space-2;
  }

  :deep(.unnnic-dropdown__trigger) {
    display: flex;
    gap: $unnnic-space-3;
    align-items: center;

    .unnnic-dropdown__content {
      z-index: 9999;
      margin-top: $unnnic-space-1;

      left: 0;

      min-width: $dropdownFixedWidth;
      width: 100%;

      padding: $unnnic-space-2;
      gap: $unnnic-space-1;
    }
  }
}
</style>
