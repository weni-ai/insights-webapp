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
        text="Limpar"
        @click.stop="clearFilters"
      />
    </template>
    <DynamicFilter
      v-else-if="appliedFilters?.[0]"
      :filter="appliedFilters[0]"
      :modelValue="appliedFilters[0].name"
      @update:modelValue="
        setAppliedFilters({ [appliedFilters[0].name]: $event })
      "
    />

    <ModalFilters
      :showModal="filterModalOpened"
      @close="filterModalOpened = false"
    />
  </section>
</template>

<script>
import { mapActions, mapState } from 'vuex';

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
        ? `Filtros (${appliedFiltersLength})`
        : 'Filtros';
    },
  },

  methods: {
    ...mapActions({
      setAppliedFilters: 'dashboards/setAppliedFilters',
    }),

    clearFilters() {
      this.setAppliedFilters({});
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
  },

  watch: {
    $route: {
      deep: true,
      handler(newRoute, oldRoute) {
        if (newRoute.path !== oldRoute.path) {
          this.retainRouteQueries(newRoute, oldRoute);
        }
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
