<template>
  <header
    class="insights-layout-header"
    v-if="selectedDashboard"
  >
    <UnnnicBreadcrumb
      :crumbs="breadcrumbs"
      @crumbClick="$router.push($event.path)"
    />
    <section class="header__content">
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
      const { dashboards, dashboardDefault } = this;

      if (dashboards.length) {
        const crumbBase = [
          { path: dashboardDefault.value, name: dashboardDefault.name },
        ];

        const routeCrumbs = this.$route.matched.map((crumb) => {
          const dashboardLabel = dashboards.find(
            (dash) => dash.value === crumb.name,
          )?.label;

          return {
            name: dashboardLabel,
            path: crumb.path,
          };
        });

        return this.$route.name === 'home'
          ? crumbBase
          : crumbBase.concat(routeCrumbs);
      }
      return null;
    },

    showTagLive() {
      const { query } = this.$route;
      return !query.dateStart && !query.dateStart;
    },
  },

  methods: {
    routeUpdateSelectedDashboard() {
      const { path } = this.$route;

      const dashboardRelativeToPath = this.dashboards.find(
        ({ value, is_default }) => {
          const isHomePath = path === '/' && is_default;
          const isValidPath = [value].includes(path.replace('/', ''));

          return isHomePath || isValidPath;
        },
      );

      if (dashboardRelativeToPath) {
        this.selectedDashboard = dashboardRelativeToPath;
      }
    },
  },

  watch: {
    selectedDashboard(newSelectedDashboard, oldSelectedDashboard) {
      if (oldSelectedDashboard?.value) {
        this.$router.push(`/${this.selectedDashboard.value}`);
      }
    },
    $route(newRoute, oldRoute) {
      if (newRoute.name !== oldRoute.name) {
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

  .header__content {
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
