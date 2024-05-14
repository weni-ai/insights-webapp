<template>
  <section class="insights-layout-header-filters">
    <UnnnicButton
      v-if="hasManyFilters"
      type="secondary"
      iconLeft="filter_list"
      text="Filtros"
      @click.stop="openFiltersModal"
    />
    <UnnnicInputDatePicker
      v-else
      class="filters__date-picker"
      v-model="filters.date"
      size="sm"
      inputFormat="DD/MM/YYYY"
    />

    <FiltersModalHumanService
      :showModal="filterModalOpened === 'human-service'"
      v-model:filters="filters"
      @close="filterModalOpened = ''"
    />
  </section>
</template>

<script>
import moment from 'moment';

import FiltersModalHumanService from './FiltersModalHumanService.vue';

export default {
  name: 'InsightsLayoutHeaderFilters',

  components: { FiltersModalHumanService },

  data() {
    return {
      filters: {
        date: {
          start: moment().subtract(1, 'day').format('YYYY-MM-DD'),
          end: moment().format('YYYY-MM-DD'),
        },
      },
      filterModalOpened: '',
    };
  },

  computed: {
    humanServiceFilters() {
      if (this.$route.name === 'human-service') {
        return ['contact', 'sector', 'queue', 'agent', 'tags'];
      }
      return undefined;
    },
    hasManyFilters() {
      return !!this.humanServiceFilters;
    },
  },

  methods: {
    routeUpdateFilters() {
      const { query } = this.$route;

      this.filters = { ...this.filters, ...query };

      if (query.dateStart && query.dateEnd) {
        this.filters.date = {
          start: query.dateStart,
          end: query.dateEnd,
        };
      }
    },

    retainRouteQueries(newRoute, oldRoute) {
      const oldQueryKeys = Object.keys(oldRoute?.query);

      if (oldQueryKeys.length) {
        this.$router.replace({ name: newRoute.name, query: oldRoute.query });
      }
    },

    openFiltersModal() {
      this.filterModalOpened = this.$route.name;
    },

    updateRouterByFilters(filters) {
      const queryParams = {
        name: this.$route.name,
        query: {
          dateStart: filters.date?.start,
          dateEnd: filters.date?.end,
        },
      };

      this.humanServiceFilters?.forEach((filter) => {
        const filterValue = Array.isArray(filters[filter])
          ? filters[filter][0]?.value
          : filters[filter];
        if (filterValue) {
          queryParams.query[filter] = filterValue;
        }
      });

      this.$router.replace(queryParams);
    },
  },

  watch: {
    $route(newRoute, oldRoute) {
      if (newRoute.name !== oldRoute.name) {
        this.retainRouteQueries(newRoute, oldRoute);
        this.routeUpdateFilters();
      }
    },
    filters: {
      deep: true,
      handler(newFilters) {
        this.updateRouterByFilters(newFilters);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.insights-layout-header-filters {
  display: flex;
  flex-direction: row;
  gap: $unnnic-spacing-xs;

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
</style>
