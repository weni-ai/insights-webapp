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
        >
          {{ dashboardTitle }}
        </h1>
        <UnnnicIcon
          data-testid="expand-icon"
          icon="expand_more"
        />
      </section>
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
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';

import OptionSelectDashboard from './OptionSelectDashboard.vue';
import OptionCreateNewDashboard from './OptionCreateNewDashboard.vue';
import DrawerDashboardConfig from '@/components/insights/dashboards/DrawerDashboardConfig.vue';

export default {
  name: 'HeaderSelectDashboard',

  components: {
    OptionSelectDashboard,
    OptionCreateNewDashboard,
    DrawerDashboardConfig,
  },

  computed: {
    ...mapState({
      dashboards: (state) => state.dashboards.dashboards,
      currentDashboard: (state) => state.dashboards.currentDashboard,
      enableCreateCustomDashboards: (state) =>
        state.config.enableCreateCustomDashboards,
      showCreateDashboardTour: (state) =>
        state.onboarding.showCreateDashboardOnboarding,
      onboardingRefs: (state) => state.onboarding.onboardingRefs,
      showDashboardConfig: (state) => state.dashboards.showDashboardConfig,
    }),
    ...mapGetters({
      dashboardDefault: 'dashboards/dashboardDefault',
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
    ...mapMutations({
      setOnboardingRef: 'onboarding/SET_ONBOARDING_REF',
      setShowDashboardConfig: 'dashboards/SET_SHOW_DASHBOARD_CONFIG',
    }),

    ...mapActions({
      beforeOpenDashboardList: 'onboarding/beforeOpenDashboardList',
      callTourNextStep: 'onboarding/callTourNextStep',
    }),

    handlerCreateDashboardClick() {
      this.setShowDashboardConfig(true);
      this.callTourNextStep('dashboard-onboarding-tour');
    },
  },
};
</script>

<style lang="scss" scoped>
$dropdownFixedWidth: 314px;

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

      width: $dropdownFixedWidth;

      padding: $unnnic-spacing-xs;
      gap: $unnnic-spacing-nano;
    }
  }
}
</style>
