<template>
  <UnnnicModalDialog
    data-testid="modal"
    :modelValue="showModal"
    class="modal-filters"
    :title="$t('insights_header.filters')"
    showActionsDivider
    showCloseIcon
    :primaryButtonProps="primaryButtonProps"
    :secondaryButtonProps="secondaryButtonProps"
    @primary-button-click="setFilters"
    @secondary-button-click="clearFilters"
    @update:model-value="!$event ? close() : {}"
  >
    <form
      class="modal-filters__form"
      @submit.prevent
    >
      <template
        v-for="filter of currentDashboardFilters"
        :key="filter.name"
      >
        <DynamicFilter
          data-testid="dynamic-filter"
          :modelValue="filtersInternal[filter.name]"
          :filter="filter"
          :disabled="handleDisabledFilter(filter)"
          :dependsOnValue="getDynamicFiltersDependsOnValues(filter)"
          @update:model-value="updateFilter(filter.name, $event)"
        />
      </template>
    </form>
    <template #options>
      <UnnnicButton
        :text="$t('insights_header.clear_filters')"
        type="tertiary"
        :disabled="!hasFiltersInternal"
        @click="clearFilters"
      />
      <UnnnicButton
        :text="$t('insights_header.filtrate')"
        type="primary"
        @click="setFilters"
      />
    </template>
  </UnnnicModalDialog>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import DynamicFilter from './DynamicFilter.vue';

export default {
  name: 'ModalFilters',

  components: {
    DynamicFilter,
  },

  props: {
    showModal: {
      type: Boolean,
      required: true,
    },
  },

  emits: ['close'],

  data() {
    return {
      filtersInternal: {},
    };
  },

  computed: {
    ...mapState({
      currentDashboardFilters: (state) =>
        state.dashboards.currentDashboardFilters,
      appliedFilters: (state) => state.dashboards.appliedFilters,
      sectors: (state) => state.sectors.sectors,
    }),
    ...mapGetters({
      getSectorById: 'sectors/getSectorById',
    }),

    hasFiltersInternal() {
      return Object.keys(this.filtersInternal).length;
    },

    areStoreFiltersAndInternalEqual() {
      return (
        JSON.stringify(this.appliedFilters) ===
        JSON.stringify(this.filtersInternal)
      );
    },
    primaryButtonProps() {
      return {
        text: this.$t('insights_header.filtrate'),
      };
    },
    secondaryButtonProps() {
      return {
        text: this.$t('insights_header.clear_filters'),
        disabled: !this.hasFiltersInternal,
      };
    },
  },

  watch: {
    appliedFilters() {
      this.syncFiltersInternal();
    },
    sectors() {
      this.handleSyncFilters();
    },
  },

  created() {
    this.syncFiltersInternal();
  },

  methods: {
    ...mapActions({
      setAppliedFilters: 'dashboards/setAppliedFilters',
      resetAppliedFilters: 'dashboards/resetAppliedFilters',
    }),
    getDynamicFiltersDependsOnValues(filter) {
      if (!filter.depends_on?.search_param) return null;

      const { search_param, filter: filterName } = filter.depends_on;

      if (search_param === 'sector_id') {
        return {
          [search_param]: this.filtersInternal[filterName]?.[0]?.value,
        };
      } else {
        return {
          [search_param]: this.filtersInternal[filterName],
        };
      }
    },
    handleDisabledFilter(filter) {
      if (['tags', 'queue'].includes(filter.name)) {
        const disableTagsAndQueueFilter =
          this.filtersInternal[filter.depends_on?.filter]?.length !== 1;

        if (disableTagsAndQueueFilter) {
          this.filtersInternal[filter.name] = undefined;
        }

        return disableTagsAndQueueFilter;
      }

      return (
        filter.depends_on && !this.filtersInternal[filter.depends_on?.filter]
      );
    },
    clearFilters() {
      this.filtersInternal = {};
    },
    updateFilter(filterName, value) {
      const hasNonNullValues =
        typeof value === 'object' && value
          ? Object.values(value).some((val) => val)
          : value;

      if (hasNonNullValues) {
        this.filtersInternal[filterName] = value;
      } else {
        delete this.filtersInternal[filterName];
      }
    },
    setFilters() {
      const processedFilters = { ...this.filtersInternal };

      if (processedFilters.sector && Array.isArray(processedFilters.sector)) {
        processedFilters.sector = processedFilters.sector.map(
          (item) => item.value,
        );
      }
      if (Object.keys(processedFilters).length) {
        this.setAppliedFilters(processedFilters);
      } else {
        this.resetAppliedFilters();
      }
      this.close();
    },
    syncFiltersInternal() {
      if (!this.areStoreFiltersAndInternalEqual) {
        this.handleSyncFilters();
      }
    },
    handleSyncFilters() {
      const processedFilters = { ...this.appliedFilters };

      if (processedFilters.sector) {
        const sectorValues = Array.isArray(processedFilters.sector)
          ? processedFilters.sector
          : [];

        processedFilters.sector = sectorValues.map((value) => {
          const trimmedValue = typeof value === 'string' ? value.trim() : value;
          const sector = this.getSectorById(trimmedValue);
          return {
            value: trimmedValue,
            label: sector ? sector.name : null,
          };
        });
      }

      this.filtersInternal = processedFilters;
    },
    close() {
      this.$emit('close');
    },
  },
};
</script>

<style lang="scss" scoped>
.modal-filters {
  &__form {
    display: grid;
    gap: $unnnic-spacing-xs $unnnic-spacing-sm;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(4, 1fr);

    text-align: left;

    > :nth-child(1),
    > :nth-child(2) {
      grid-column-start: 1;
      grid-column-end: 3;
    }

    // Temporary adjustments to allow dropdowns to not be limited to the modal space and may overflow

    :deep(.dropdown-data) {
      left: 0;
      .unnnic-date-picker {
        position: fixed;
      }
    }

    :deep(.unnnic-select-smart__options.active) {
      position: fixed;
      left: auto;
      right: auto;
    }
  }
}
</style>
