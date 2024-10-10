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
        v-if="appliedFiltersLength > 0"
        type="tertiary"
        iconLeft="close"
        :text="$t('insights_header.clear_filters')"
        @click.stop="clearFilters"
      />
    </template>
    <section
      v-else-if="currentDashboardFilters[0]"
      class="insights-layout-header-filters_dynamic_container"
    >
      <DynamicFilter
        :filter="filter"
        :modelValue="appliedFilters[currentDashboardFilters[0].name]"
        @update:model-value="updateFilter"
      />
    </section>

    <ModalFilters
      :showModal="filterModalOpened"
      @close="filterModalOpened = false"
    />
  </section>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { getLastNDays } from '@/utils/time';
import DynamicFilter from './DynamicFilter.vue';
import ModalFilters from './ModalFilters.vue';

export default {
  name: 'InsightsLayoutHeaderFilters',

  components: { DynamicFilter, ModalFilters },

  data() {
    return {
      filterModalOpened: false,
    };
  },

  computed: {
    ...mapState({
      currentDashboardFilters: (state) =>
        state.dashboards.currentDashboardFilters,
      appliedFilters: (state) => state.dashboards.appliedFilters,
    }),

    hasManyFilters() {
      return this.currentDashboardFilters?.length > 1;
    },
    appliedFiltersLength() {
      const { appliedFilters } = this;
      return appliedFilters ? Object.keys(appliedFilters).length : 0;
    },
    titleButtonManyFilters() {
      const { appliedFiltersLength } = this;
      return appliedFiltersLength
        ? `${this.$t('insights_header.filters')} (${appliedFiltersLength})`
        : this.$t('insights_header.filters');
    },
    filter() {
      const filter = this.currentDashboardFilters[0];

      if (filter.type === 'date_range')
        return {
          ...filter,
          type: 'select_date_range',
        };

      return filter;
    },
  },

  watch: {
    $route: {
      immediate: true,
      deep: true,
      handler(newRoute, oldRoute) {
        if (oldRoute && newRoute.path !== oldRoute.path) {
          this.retainRouteQueries(newRoute, oldRoute);
          return;
        }
        // comment to prevent override default filters
        // this.setAppliedFilters(newRoute.query);
      },
    },
    currentDashboardFilters() {
      const isQueryEmpty = Object.keys(this.$route.query).length === 0;
      if (isQueryEmpty) {
        const { start, end } = getLastNDays(7);

        this.setAppliedFilters({
          ended_at: { __gte: start, __lte: end },
        });
      } else this.setAppliedFilters(this.$route.query);
    },
  },

  methods: {
    ...mapActions({
      setAppliedFilters: 'dashboards/setAppliedFilters',
      resetAppliedFilters: 'dashboards/resetAppliedFilters',
    }),

    updateFilter(value) {
      const hasNonNullValues =
        typeof value === 'object' && value
          ? Object.values(value).some((val) => val)
          : value;
      this.setAppliedFilters({
        [this.currentDashboardFilters[0].name]: hasNonNullValues
          ? value
          : undefined,
      });
    },

    clearFilters() {
      this.resetAppliedFilters();
    },

    retainRouteQueries(newRoute, oldRoute) {
      const oldQueryKeys = Object.keys(oldRoute?.query);

      if (oldQueryKeys.length) {
        this.$router.replace({
          name: newRoute.name,
          query: oldRoute.query,
        });
      }
    },

    openFiltersModal() {
      this.filterModalOpened = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.insights-layout-header-filters {
  display: flex;
  flex-direction: row;
  gap: $unnnic-spacing-xs;

  &_dynamic_container {
    width: 19.75rem;
  }
}
</style>
