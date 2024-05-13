<template>
  <header class="insights-layout-header">
    <UnnnicBreadcrumb
      v-if="!isInHome"
      :crumbs="breadcrumbs"
      @crumbClick="$router.push($event.path)"
    />
    <h1 class="header__title">
      {{ isInHome ? 'Insights' : selectedDashboardLabel }}
    </h1>
    <section class="header__filters">
      <UnnnicSelectSmart
        v-model="selectedDashboard"
        :options="dashboards"
        orderedByIndex
      />
      <UnnnicInputDatePicker
        class="filters__date-picker"
        v-model="filterDate"
        size="sm"
        inputFormat="DD/MM/YYYY"
      />
    </section>
  </header>
</template>

<script>
import moment from 'moment';

export default {
  name: 'InsightsLayoutHeader',

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
      filterDate: {
        start: moment().subtract(1, 'day').format('YYYY-MM-DD'),
        end: moment().format('YYYY-MM-DD'),
      },
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

    routeUpdateFilterDate() {
      const { query } = this.$route;

      if (query.startDate && query.endDate) {
        this.filterDate = {
          start: query.startDate,
          end: query.endDate,
        };
      }
    },

    retainRouteQueries(newRoute, oldRoute) {
      const oldQueryKeys = Object.keys(oldRoute?.query);

      if (oldQueryKeys.length) {
        this.$router.replace({ name: newRoute.name, query: oldRoute.query });
      }
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
        this.retainRouteQueries(newRoute, oldRoute);
        this.routeUpdateSelectedDashboard();
        this.routeUpdateFilterDate();
      }
    },
    filterDate(newDate) {
      this.$router.replace({
        name: this.$route.name,
        query: { startDate: newDate.start, endDate: newDate.end },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.insights-layout-header {
  display: grid;
  gap: $unnnic-spacing-sm;

  .header__title {
    color: $unnnic-color-neutral-darkest;
    font-size: $unnnic-font-size-title-md;
    font-weight: $unnnic-font-weight-bold;
    font-family: $unnnic-font-family-primary;
    line-height: $unnnic-line-height-large * 2;
  }
  .header__filters {
    display: flex;
    flex-direction: row;
    gap: $unnnic-spacing-xs;

    :deep(.unnnic-select-smart) {
      .dropdown-data {
        z-index: 2;
      }
    }

    .filters__date-picker {
      display: grid;

      :deep(.unnnic-form-input) {
        height: 100%;

        .unnnic-icon {
          // It was necessary to follow bad practices here (px) because
          // of how the component was initially implemented.
          top: $unnnic-spacing-sm - 1px;
        }

        .input {
          font-size: $unnnic-font-size-body-gt;
        }
      }
    }
  }
}
</style>
