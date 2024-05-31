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
    <DynamicFilter
      v-else-if="filters[0]"
      :filter="filters[0]"
      :modelValue="filters[0].name"
      @update:modelValue="updateFilter(filters[0].name, $event)"
    />

    <ModalFilters
      :showModal="filterModalOpened"
      @close="filterModalOpened = false"
    />
  </section>
</template>

<script>
import { mapState } from 'vuex';

import DynamicFilter from './DynamicFilter.vue';
import ModalFilters from './ModalFilters.vue';

export default {
  name: 'InsightsLayoutHeaderFilters',

  components: { DynamicFilter, ModalFilters },

  data() {
    return {
      filters: {},
      filterModalOpened: false,
    };
  },

  computed: {
    ...mapState({
      currentDashboardFilters: (state) =>
        state.dashboards.currentDashboardFilters,
    }),
    hasManyFilters() {
      return this.currentDashboardFilters?.length > 1;
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

    updateFilter(filterName, value) {
      this.filters[filterName] = value;
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
      this.filterModalOpened = true;
    },

    updateRouterByFilters(filters) {
      const queryParams = {
        name: this.$route.name,
        query: {
          dateStart: filters.date?.start,
          dateEnd: filters.date?.end,
        },
      };

      Object.keys(filters)?.forEach((key) => {
        const filter = filters[key];
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
}
</style>
