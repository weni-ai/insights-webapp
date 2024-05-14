<template>
  <header class="insights-layout-header">
    <UnnnicBreadcrumb
      :crumbs="breadcrumbs"
      @crumbClick="$router.push($event.path)"
    />
    <section class="header__content">
      <UnnnicSelectSmart
        v-model="selectedDashboard"
        :options="dashboards"
        orderedByIndex
      />

      <InsightsLayoutHeaderFilters />
    </section>
  </header>
</template>

<script>
import InsightsLayoutHeaderFilters from './HeaderFilters/index.vue';

export default {
  name: 'InsightsLayoutHeader',

  components: { InsightsLayoutHeaderFilters },

  data() {
    return {
      dashboards: [
        {
          value: 'dashboards',
          label: 'Insights',
          crumbPath: '/',
          crumbName: 'Insights',
        },
        { value: 'human-service', label: 'Atendimento Humano' },
      ],
      selectedDashboard: [],
    };
  },

  computed: {
    selectedDashboardValue() {
      return this.selectedDashboard[0]?.value;
    },
    selectedDashboardLabel() {
      return this.selectedDashboard[0]?.label;
    },

    breadcrumbs() {
      const { dashboards } = this;
      if (this.$route.name === 'home') {
        return [
          { path: dashboards[0].crumbPath, name: dashboards[0].crumbName },
        ];
      }

      return dashboards.map(({ value, label, crumbPath, crumbName }) => ({
        path: crumbPath || `/${value}`,
        name: crumbName || label,
      }));
    },
  },

  methods: {
    routeUpdateSelectedDashboard() {
      const { path } = this.$route;

      const dashboardRelativeToPath = this.dashboards.find(
        ({ value, crumbPath }) => {
          const isHomePath = path === '/' && [value, crumbPath].includes('/');
          const isValidPath = [value, crumbPath].includes(
            path.replace('/', ''),
          );

          return isHomePath || isValidPath;
        },
      );

      this.selectedDashboard[0] = dashboardRelativeToPath;
    },
  },

  watch: {
    selectedDashboard(newSelectedDashboard, oldSelectedDashboard) {
      if (oldSelectedDashboard[0]?.value) {
        this.$router.push(`/${this.selectedDashboardValue}`);
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
    gap: $unnnic-spacing-xs;

    :deep(.unnnic-select-smart) {
      .dropdown-data {
        z-index: 2;
      }
    }
  }
}
</style>
