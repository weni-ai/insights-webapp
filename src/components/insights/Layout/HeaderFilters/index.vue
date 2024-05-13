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
      v-model="filterDate"
      size="sm"
      inputFormat="DD/MM/YYYY"
    />

    <FiltersModalHumanService
      :showModal="filterModalOpened === 'human-service'"
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
      filterDate: {
        start: moment().subtract(1, 'day').format('YYYY-MM-DD'),
        end: moment().format('YYYY-MM-DD'),
      },
      filterModalOpened: '',
    };
  },

  computed: {
    hasManyFilters() {
      return this.$route.name === 'human-service';
    },
  },

  methods: {
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

    openFiltersModal() {
      this.filterModalOpened = this.$route.name;
    },
  },

  watch: {
    $route(newRoute, oldRoute) {
      if (newRoute.name !== oldRoute.name) {
        this.retainRouteQueries(newRoute, oldRoute);
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
