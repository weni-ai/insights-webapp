<template>
  <UnnnicDialog
    :open="showModal"
    @update:open="handleOpenChange"
  >
    <UnnnicDialogContent
      size="medium"
      class="modal-filters"
    >
      <UnnnicDialogHeader>
        <UnnnicDialogTitle>
          {{ $t('insights_header.filters') }}
        </UnnnicDialogTitle>
      </UnnnicDialogHeader>

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

      <UnnnicDialogFooter>
        <UnnnicButton
          type="tertiary"
          :text="$t('insights_header.clear_filters')"
          :disabled="!hasFiltersInternal"
          @click="clearFilters"
        />
        <UnnnicButton
          type="primary"
          :text="$t('insights_header.filtrate')"
          @click="setFilters"
        />
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script>
import { mapActions, mapState } from 'pinia';

import {
  UnnnicButton,
  UnnnicDialog,
  UnnnicDialogContent,
  UnnnicDialogFooter,
  UnnnicDialogHeader,
  UnnnicDialogTitle,
} from '@weni/unnnic-system';

import { useDashboards } from '@/store/modules/dashboards';
import { useSectors } from '@/store/modules/sectors';

import DynamicFilter from './DynamicFilter.vue';

export default {
  name: 'ModalFilters',

  components: {
    DynamicFilter,
    UnnnicButton,
    UnnnicDialog,
    UnnnicDialogContent,
    UnnnicDialogFooter,
    UnnnicDialogHeader,
    UnnnicDialogTitle,
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
    ...mapState(useDashboards, ['currentDashboardFilters', 'appliedFilters']),
    ...mapState(useSectors, ['sectors', 'getSectorByUuid']),

    hasFiltersInternal() {
      return Object.keys(this.filtersInternal).length;
    },

    areStoreFiltersAndInternalEqual() {
      return (
        JSON.stringify(this.appliedFilters) ===
        JSON.stringify(this.filtersInternal)
      );
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
    ...mapActions(useDashboards, ['setAppliedFilters', 'resetAppliedFilters']),

    handleOpenChange(isOpen) {
      if (!isOpen) {
        this.close();
      }
    },

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
          const sector = this.getSectorByUuid(trimmedValue);
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
    gap: $unnnic-space-2 $unnnic-space-4;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(4, 1fr);

    padding: $unnnic-space-6;
    text-align: left;

    > :nth-child(1),
    > :nth-child(2) {
      grid-column-start: 1;
      grid-column-end: 3;
    }
  }
}
</style>
