<template>
  <section class="insights-layout-header-filters">
    <FilterFavoriteTemplateMessage />
    <template v-if="hasManyFilters">
      <UnnnicButton
        data-testid="many-filters-button"
        type="secondary"
        iconLeft="filter_list"
        :text="titleButtonManyFilters"
        @click.stop="openFiltersModal"
      />
      <UnnnicButton
        v-if="appliedFiltersLength > 0"
        data-testid="clear-many-filters-button"
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
        v-show="!isMetaTemplateDashboard || !emptyTemplates"
        data-testid="dynamic-filter"
        :filter="filter"
        :modelValue="appliedFilters[currentDashboardFilters[0].name]"
        @update:model-value="updateFilter"
      />
    </section>
    <ModalFilters
      data-testid="modal-filters"
      :showModal="filterModalOpened"
      @close="filterModalOpened = false"
    />
    <SearchTemplateMessagesModal
      :modelValue="searchTemplateMetaModal"
      @close="searchTemplateMetaModal = false"
    />
    <template v-if="isMetaTemplateDashboard">
      <UnnnicButton
        type="secondary"
        iconLeft="search"
        :text="$t('template_messages_dashboard.templates_modal.title')"
        :disabled="emptyTemplates"
        @click.stop="searchTemplateMetaModal = true"
      />
    </template>
  </section>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { getLastNDays } from '@/utils/time';

import DynamicFilter from './DynamicFilter.vue';
import ModalFilters from './ModalFilters.vue';
import FilterFavoriteTemplateMessage from './FilterFavoriteTemplateMessage.vue';
import SearchTemplateMessagesModal from '../../templateMessages/SearchTemplateMessagesModal.vue';
import moment from 'moment';

export default {
  name: 'InsightsLayoutHeaderFilters',

  components: {
    DynamicFilter,
    ModalFilters,
    SearchTemplateMessagesModal,
    FilterFavoriteTemplateMessage,
  },

  data() {
    return {
      filterModalOpened: false,
      searchTemplateMetaModal: false,
    };
  },

  computed: {
    ...mapState({
      currentDashboard: (state) => state.dashboards.currentDashboard,
      currentDashboardFilters: (state) =>
        state.dashboards.currentDashboardFilters,
      appliedFilters: (state) => state.dashboards.appliedFilters,
      emptyTemplates: (state) => state.metaTemplateMessage.emptyTemplates,
    }),

    isMetaTemplateDashboard() {
      return this.currentDashboard?.config?.is_whatsapp_integration;
    },

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

      if (filter.type === 'date_range' && !this.isMetaTemplateDashboard) {
        return {
          ...filter,
          type: 'select_date_range',
        };
      }

      if (this.isMetaTemplateDashboard) {
        const minDate = moment().subtract(89, 'days').format('YYYY-MM-DD');
        const shortCutOptions = [
          {
            name: this.$t(
              'template_messages_dashboard.filter.shortcut.last_7_days',
            ),
            id: 'last-7-days',
          },
          {
            name: this.$t(
              'template_messages_dashboard.filter.shortcut.last_14_days',
            ),
            id: 'last-14-days',
          },
          {
            name: this.$t(
              'template_messages_dashboard.filter.shortcut.last_30_days',
            ),
            id: 'last-30-days',
          },
          {
            name: this.$t(
              'template_messages_dashboard.filter.shortcut.last_60_days',
            ),
            id: 'last-60-days',
          },
          {
            name: this.$t(
              'template_messages_dashboard.filter.shortcut.last_90_days',
            ),
            id: 'last-90-days',
          },
        ];

        return { ...filter, next: true, minDate, shortCutOptions };
      }

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

        const currentFilter = this.isMetaTemplateDashboard
          ? { date: { _start: start, _end: end } }
          : { ended_at: { __gte: start, __lte: end } };

        this.setAppliedFilters(currentFilter);
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
