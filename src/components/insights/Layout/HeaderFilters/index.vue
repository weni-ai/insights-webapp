<template>
  <section class="insights-layout-header-filters">
    <!-- <FilterFavoriteTemplateMessage /> -->
    <LastUpdatedText v-if="isHumanServiceDashboard" />
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
        v-if="!isMetaTemplateDashboard || !emptyTemplates"
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
      v-if="showSearchTemplateMetaModal"
      :modelValue="showSearchTemplateMetaModal"
      @close="handlerShowSearchTemplateModal(false)"
    />
    <template v-if="isMetaTemplateDashboard">
      <UnnnicButton
        type="secondary"
        iconLeft="search"
        :text="$t('template_messages_dashboard.templates_modal.title')"
        :disabled="emptyTemplates"
        @click.stop="handlerShowSearchTemplateModal(true)"
      />
    </template>
  </section>
</template>

<script>
import { mapActions, mapState } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';
import { useMetaTemplateMessage } from '@/store/modules/templates/metaTemplateMessage';

import DynamicFilter from './DynamicFilter.vue';
import ModalFilters from './ModalFilters.vue';
import FilterFavoriteTemplateMessage from './FilterFavoriteTemplateMessage.vue';
import SearchTemplateMessagesModal from '../../templateMessages/SearchTemplateMessagesModal.vue';
import LastUpdatedText from './LastUpdatedText.vue';

import { getLastNDays } from '@/utils/time';

export default {
  name: 'InsightsLayoutHeaderFilters',

  components: {
    DynamicFilter,
    ModalFilters,
    SearchTemplateMessagesModal,
    FilterFavoriteTemplateMessage,
    LastUpdatedText,
  },

  data() {
    return {
      filterModalOpened: false,
      searchTemplateMetaModal: false,
    };
  },

  computed: {
    ...mapState(useDashboards, [
      'currentDashboard',
      'currentDashboardFilters',
      'appliedFilters',
    ]),
    ...mapState(useMetaTemplateMessage, [
      'emptyTemplates',
      'showSearchTemplateMetaModal',
    ]),

    isHumanServiceDashboard() {
      return this.currentDashboard?.name === 'human_service_dashboard.title';
    },

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
      if (!this.currentDashboardFilters.length) return null;

      const filter = this.currentDashboardFilters[0];

      if (filter.type === 'date_range') {
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
          {
            name: this.$t(
              'template_messages_dashboard.filter.shortcut.current_month',
            ),
            id: 'current-month',
          },
          {
            name: this.$t(
              'template_messages_dashboard.filter.shortcut.previous_month',
            ),
            id: 'previous-month',
          },
        ];
        return {
          ...filter,
          next: true,
          shortCutOptions,
          disableClear: true,
        };
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
    currentDashboardFilters: {
      immediate: true,
      handler(filters) {
        if (filters.length === 1) {
          const { date, ended_at } = this.$route.query;
          const { start, end } = getLastNDays(7);

          const defaultFilterValue = this.isMetaTemplateDashboard
            ? { _start: start, _end: end }
            : { __gte: start, __lte: end };

          const currentFilters = {};

          if (date) {
            currentFilters.date = this.$route.query.date;
          }
          if (ended_at) {
            currentFilters.ended_at = this.$route.query.ended_at;
          }

          const filterKey = this.isMetaTemplateDashboard ? 'date' : 'ended_at';

          this.setAppliedFilters({
            [filterKey]: currentFilters[filterKey] || defaultFilterValue,
          });
        } else {
          this.setAppliedFilters(this.$route.query);
        }
      },
    },
  },

  methods: {
    ...mapActions(useDashboards, ['setAppliedFilters', 'resetAppliedFilters']),
    ...mapActions(useMetaTemplateMessage, ['handlerShowSearchTemplateModal']),

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
