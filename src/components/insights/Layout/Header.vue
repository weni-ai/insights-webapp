<template>
  <header class="insights-layout-header">
    <UnnnicBreadcrumb
      :crumbs="breadcrumbs"
      @crumbClick="$router.push($event.path)"
    />
    <section class="insights-layout-header__content">
      <HeaderSelectDashboard
        v-if="selectedDashboard"
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
      dashboards: [
        {
          value: 'dashboards',
          label: 'Insights',
          crumbPath: '/',
          crumbName: 'Insights',
        },
        {
          value: 'human-service',
          label: 'Atendimento humano',
          crumbChildrens: [{ value: 'peak-chats', label: 'Picos de chats' }],
        },
        { value: 'flow-results', label: 'Resultado de fluxos' },
      ],
      selectedDashboard: null,
    };
  },

  computed: {
    breadcrumbs() {
      const { dashboards } = this;

      const crumbBase = [
        { path: dashboards[0].crumbPath, name: dashboards[0].crumbName },
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
        ({ value, crumbPath }) => {
          const isHomePath = path === '/' && [value, crumbPath].includes('/');
          const isValidPath = [value, crumbPath].includes(
            path.replace('/', ''),
          );

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
