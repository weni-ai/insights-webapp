<template>
  <section class="insights-layout-header-filters">
    <template v-if="hasManyFilters">
      <UnnnicButton
        type="secondary"
        iconLeft="filter_list"
        :text="titleButtonManyFilters"
        @click.stop="openFiltersModal"
      />
      <UnnnicButton
        v-if="filtersLength > 0"
        type="tertiary"
        iconLeft="close"
        text="Limpar"
        @click.stop="clearFilters"
      />
    </template>
    <UnnnicInputDatePicker
      v-else
      class="insights-layout-header-filters__date-picker"
      v-model="filters.date"
      size="sm"
      inputFormat="DD/MM/YYYY"
      position="right"
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
    filtersLength() {
      const { query } = this.$route;

      const queryValues = Object.values(query).filter((value) => value);
      let filtersLength = queryValues.length;

      if (query.dateStart && query.dateEnd) {
        filtersLength--;
      }
      return filtersLength;
    },
    titleButtonManyFilters() {
      const { filtersLength } = this;
      return filtersLength ? `Filtros (${filtersLength})` : 'Filtros';
    },
  },

  methods: {
    clearFilters() {
      this.filters = {
        date: {
          start: '',
          end: '',
        },
      };
    },

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

  &__date-picker {
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
