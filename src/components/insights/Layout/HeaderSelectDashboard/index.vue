<template>
  <UnnnicDropdown
    class="header-select-dashboard"
    position="bottom-right"
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
      >
        <h1
          data-testid="dashboard-title"
          class="trigger__title"
        >
          {{
            currentDashboard.name || dashboardDefault.name || dashboards[0].name
          }}
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
      @click="showNewDashboardModal = true"
    />
  </UnnnicDropdown>
  <DrawerDashboardConfig
    v-if="showNewDashboardModal"
    v-model="showNewDashboardModal"
    data-testid="drawer-dashboard-config"
    @close="showNewDashboardModal = false"
  />
</template>

<script>
import { mapGetters, mapState } from 'vuex';

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

  data() {
    return {
      showNewDashboardModal: false,
    };
  },

  computed: {
    ...mapState({
      dashboards: (state) => state.dashboards.dashboards,
      currentDashboard: (state) => state.dashboards.currentDashboard,
      enableCreateCustomDashboards: (state) =>
        state.config.enableCreateCustomDashboards,
    }),
    ...mapGetters({
      dashboardDefault: 'dashboards/dashboardDefault',
    }),
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
