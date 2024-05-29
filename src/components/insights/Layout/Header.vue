<template>
  <header class="insights-layout-header">
    <UnnnicBreadcrumb
      v-if="!isInHome"
      :crumbs="breadcrumbs"
      @crumbClick="$router.push($event.path)"
    />
    <h1 class="insights-layout-header__title">
      {{ isInHome ? 'Insights' : selectedDashboardLabel }}
    </h1>
    <section class="insights-layout-header__content">
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
          label: 'Dashboards',
          crumbPath: '/',
          crumbName: 'Início',
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

    isInHome() {
      return this.selectedDashboardValue === 'dashboards';
    },

    breadcrumbs() {
      return this.dashboards.map(({ value, label, crumbPath, crumbName }) => ({
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

  &__title {
    color: $unnnic-color-neutral-darkest;
    font-size: $unnnic-font-size-title-md;
    font-weight: $unnnic-font-weight-bold;
    font-family: $unnnic-font-family-primary;
    line-height: $unnnic-line-height-large * 2;
  }
  &__content {
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
