<template>
  <UnnnicDropdown
    class="header-select-dashboard"
    position="bottom-right"
    data-onboarding-id="select-dashboard"
  >
    <template #trigger>
      <UnnnicAvatarIcon
        v-if="$route.name === 'dashboard'"
        data-testid="dashboard-icon"
        icon="monitoring"
        scheme="aux-purple-500"
      />
      <UnnnicIcon
        v-else
        data-testid="back-icon"
        class="header-select-dashboard__arrow-back"
        icon="arrow_back"
        scheme="neutral-darkest"
        clickable
        @click.stop="$router.back"
      />
      <section
        data-testid="dropdown-trigger"
        class="dropdown__trigger"
        @mouseup="callTourNextStep('dashboard-onboarding-tour')"
      >
        <h1
          data-testid="dashboard-title"
          class="trigger__title"
          :title="dashboardTitle"
        >
          {{ dashboardTitle }}
        </h1>
        <BetaText />
      </section>
      <UnnnicIcon
        class="dropdown__trigger"
        data-testid="expand-icon"
        icon="expand_more"
      />
    </template>

    <OptionSelectDashboard
      v-for="dashboard of dashboards"
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

<script>
import { mapActions, mapState } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';
import { useConfig } from '@/store/modules/config';
import { useOnboarding } from '@/store/modules/onboarding';

import OptionSelectDashboard from './OptionSelectDashboard.vue';
import OptionCreateNewDashboard from './OptionCreateNewDashboard.vue';
import DrawerDashboardConfig from '@/components/insights/dashboards/DrawerDashboardConfig.vue';
import BetaText from './BetaText.vue';

export default {
  name: 'HeaderSelectDashboard',

  components: {
    OptionSelectDashboard,
    OptionCreateNewDashboard,
    DrawerDashboardConfig,
    BetaText,
  },

  computed: {
    ...mapState(useDashboards, [
      'dashboards',
      'currentDashboard',
      'showDashboardConfig',
      'dashboardDefault',
    ]),
    ...mapState(useConfig, ['enableCreateCustomDashboards']),
    ...mapState(useOnboarding, {
      showCreateDashboardTour: 'showCreateDashboardOnboarding',
      onboardingRefs: 'onboardingRefs',
    }),

    dashboardTitle() {
      const title =
        this.currentDashboard.name ||
        this.dashboardDefault.name ||
        this.dashboards[0].name ||
        '';
      return this.$t(title);
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.setOnboardingRef({
        key: 'select-dashboard',
        ref: document.querySelector('[data-onboarding-id="select-dashboard"]'),
      });
    });
  },
  methods: {
    ...mapActions(useOnboarding, [
      'setOnboardingRef',
      'beforeOpenDashboardList',
      'callTourNextStep',
    ]),
    ...mapActions(useDashboards, ['setShowDashboardConfig']),

    handlerCreateDashboardClick() {
      this.setShowDashboardConfig(true);
      this.callTourNextStep('dashboard-onboarding-tour');
    },
  },
};
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

  .dropdown__trigger {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-nano;

    cursor: pointer;

    .trigger__title {
      margin: $unnnic-spacing-nano 0;

      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-primary;
      font-size: $unnnic-font-size-title-sm;
      font-weight: $unnnic-font-weight-bold;
      line-height: $unnnic-line-height-large * 2;
      text-wrap: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 621px;
    }
  }

  &__arrow-back {
    margin: $unnnic-spacing-xs;
  }

  :deep(.unnnic-dropdown__trigger) {
    display: flex;
    gap: $unnnic-spacing-ant;
    align-items: center;

    .unnnic-dropdown__content {
      margin-top: $unnnic-spacing-nano;

      left: 0;

      min-width: $dropdownFixedWidth;
      width: 100%;

      padding: $unnnic-spacing-xs;
      gap: $unnnic-spacing-nano;
    }
  }
}
</style>
