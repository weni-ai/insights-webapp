<template>
  <header
    v-if="currentDashboard"
    class="insights-layout-header"
  >
    <UnnnicBreadcrumb
      :crumbs="breadcrumbs"
      @crumb-click="
        $router.push({ name: $event.routeName, path: $event.routePath })
      "
    />
    <section class="insights-layout-header__content">
      <HeaderSelectDashboard />

      <section class="content__actions">
        <HeaderTagLive v-if="showTagLive" />
        <InsightsLayoutHeaderFilters />
        <HeaderDashboardSettings />
        <!-- <UnnnicButton
        class="clickable"
        iconCenter="ios_share"
        type="secondary"
        /> -->
        <HeaderGenerateInsightButton v-if="isRenderInsightButton" />
      </section>
    </section>
  </header>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

import HeaderSelectDashboard from './HeaderSelectDashboard/index.vue';
import HeaderTagLive from './HeaderTagLive.vue';
import InsightsLayoutHeaderFilters from './HeaderFilters/index.vue';
import HeaderDashboardSettings from './HeaderDashboardSettings.vue';
import HeaderGenerateInsightButton from './HeaderGenerateInsights/HeaderGenerateInsightButton.vue';

import moment from 'moment';

export default {
  name: 'InsightsLayoutHeader',

  components: {
    HeaderSelectDashboard,
    HeaderTagLive,
    InsightsLayoutHeaderFilters,
    HeaderDashboardSettings,
    HeaderGenerateInsightButton,
  },
  computed: {
    ...mapState({
      dashboards: (state) => state.dashboards.dashboards,
      currentDashboard: (state) => state.dashboards.currentDashboard,
      currentDashboardFilters: (state) =>
        state.dashboards.currentDashboardFilters,
      appliedFilters: (state) => state.dashboards.appliedFilters,
    }),
    ...mapGetters({
      dashboardDefault: 'dashboards/dashboardDefault',
    }),

    isRenderInsightButton() {
      return this.currentDashboard?.name === 'human_service_dashboard.title';
    },

    breadcrumbs() {
      const { currentDashboard } = this;
      const { dashboardUuid } = this.$route.params;

      const crumbs = [
        {
          path: currentDashboard.uuid,
          routeName: 'dashboard',
          name: `Insights ${this.$t(currentDashboard.name || '')}`,
        },
      ];

      if (this.$route.name === 'report') {
        crumbs[1] = {
          path: this.$route.path,
          routePath: 'report',
          name: `${this.$t('report')} ${this.$t(currentDashboard.name || '')}`,
        };
      }

      return dashboardUuid === currentDashboard.uuid ? crumbs : [];
    },

    showTagLive() {
      const dateFilter = this.currentDashboardFilters.find(
        (filter) => filter.type === 'date_range',
      );

      const { query } = this.$route;
      const today = moment().format('YYYY-MM-DD');

      const filteringDateValues = Object.values(
        this.appliedFilters[dateFilter?.name] || {},
      );

      const isFilteringToday = filteringDateValues.every(
        (filterDate) => filterDate === today,
      );

      return !query[dateFilter?.name] || isFilteringToday;
    },
  },

  watch: {
    currentDashboard(newCurrentDashboard, oldCurrentDashboard) {
      if (oldCurrentDashboard?.uuid) {
        this.navigateToDashboard(this.currentDashboard.uuid);
      }
    },
    $route(newRoute, oldRoute) {
      const { dashboardUuid: newUuid } = newRoute.params;
      const { dashboardUuid: oldUuid } = oldRoute.params;

      if (newUuid !== oldUuid) {
        this.routeUpdateCurrentDashboard();
      }
    },
  },

  mounted() {
    this.routeUpdateCurrentDashboard();
  },

  methods: {
    ...mapActions({
      setCurrentDashboard: 'dashboards/setCurrentDashboard',
    }),

    navigateToDashboard(uuid) {
      this.$router.replace({
        name: 'dashboard',
        params: { dashboardUuid: uuid },
      });
    },

    goToDefaultDashboard() {
      const { uuid } = this.dashboardDefault;
      this.navigateToDashboard(uuid);
    },

    routeUpdateCurrentDashboard() {
      const { dashboardUuid } = this.$route.params;

      const dashboardRelativeToPath = this.dashboards.find(
        ({ uuid }) => dashboardUuid === uuid,
      );

      if (!dashboardRelativeToPath) {
        this.goToDefaultDashboard();
      }

      this.setCurrentDashboard(
        dashboardRelativeToPath || this.dashboardDefault,
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.insights-layout-header {
  display: grid;
  gap: $unnnic-spacing-sm;

  &__content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: $unnnic-spacing-xs;

    .content__actions {
      display: flex;
      gap: $unnnic-spacing-ant;
    }
  }
}
</style>
