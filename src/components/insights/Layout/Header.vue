<template>
  <header
    class="insights-layout-header"
    v-if="currentDashboard"
  >
    <UnnnicBreadcrumb
      :crumbs="breadcrumbs"
      @crumbClick="$router.push($event.path)"
    />
    <section class="insights-layout-header__content">
      <HeaderSelectDashboard />

      <section class="content__actions">
        <HeaderTagLive v-if="showTagLive" />
        <InsightsLayoutHeaderFilters />
        <UnnnicButton
          class="clickable"
          iconCenter="ios_share"
          type="secondary"
        />
      </section>
    </section>
  </header>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

import HeaderSelectDashboard from './HeaderSelectDashboard.vue';
import HeaderTagLive from './HeaderTagLive.vue';
import InsightsLayoutHeaderFilters from './HeaderFilters/index.vue';

export default {
  name: 'InsightsLayoutHeader',

  components: {
    HeaderSelectDashboard,
    HeaderTagLive,
    InsightsLayoutHeaderFilters,
  },

  created() {
    this.routeUpdateCurrentDashboard();
  },

  computed: {
    ...mapState({
      dashboards: (state) => state.dashboards.dashboards,
      currentDashboard: (state) => state.dashboards.currentDashboard,
    }),
    ...mapGetters({
      dashboardDefault: 'dashboards/dashboardDefault',
    }),

    breadcrumbs() {
      const { currentDashboard, dashboardDefault } = this;
      const { dashboardUuid } = this.$route.params;

      const crumbBase = [
        { path: dashboardDefault.uuid, name: dashboardDefault.name },
      ];

      const routeCrumbs = [
        {
          path: currentDashboard.uuid,
          name: currentDashboard.name,
        },
      ];

      return dashboardUuid === dashboardDefault.uuid
        ? crumbBase
        : crumbBase.concat(routeCrumbs);
    },

    showTagLive() {
      const { query } = this.$route;
      return !query.dateStart && !query.dateStart;
    },
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
