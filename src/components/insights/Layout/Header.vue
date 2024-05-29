<template>
  <header
    class="insights-layout-header"
    v-if="selectedDashboard"
  >
    <UnnnicBreadcrumb
      :crumbs="breadcrumbs"
      @crumbClick="$router.push($event.path)"
    />
    <section class="insights-layout-header__content">
      <HeaderSelectDashboard
        v-model="selectedDashboard"
        :options="dashboards"
      />

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
import { mapGetters, mapState } from 'vuex';

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

  data() {
    return {
      selectedDashboard: null,
    };
  },

  created() {
    this.routeUpdateSelectedDashboard();
  },

  computed: {
    ...mapState({
      dashboards: (state) => state.dashboards.dashboards,
    }),
    ...mapGetters({
      dashboardDefault: 'dashboards/dashboardDefault',
    }),

    breadcrumbs() {
      const { selectedDashboard, dashboardDefault } = this;
      const { dashboardUuid } = this.$route.params;

      const crumbBase = [
        { path: dashboardDefault.uuid, name: dashboardDefault.name },
      ];

      const routeCrumbs = [
        {
          path: selectedDashboard.uuid,
          name: selectedDashboard.name,
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

    routeUpdateSelectedDashboard() {
      const { dashboardUuid } = this.$route.params;

      const dashboardRelativeToPath = this.dashboards.find(
        ({ uuid }) => dashboardUuid === uuid,
      );

      if (!dashboardRelativeToPath) {
        this.goToDefaultDashboard();
      }

      this.selectedDashboard = dashboardRelativeToPath || this.dashboardDefault;
    },
  },

  watch: {
    selectedDashboard(newSelectedDashboard, oldSelectedDashboard) {
      if (oldSelectedDashboard?.uuid) {
        this.navigateToDashboard(this.selectedDashboard.uuid);
      }
    },
    $route(newRoute, oldRoute) {
      const { dashboardUuid: newUuid } = newRoute.params;
      const { dashboardUuid: oldUuid } = oldRoute.params;

      if (newUuid !== oldUuid) {
        this.routeUpdateSelectedDashboard();
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
