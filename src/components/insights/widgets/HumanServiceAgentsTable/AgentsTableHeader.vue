<template>
  <div
    class="agents-table-header"
    data-testid="agents-table-header"
  >
    <section
      class="dynamic-columns-filter"
      data-testid="dynamic-columns-filter"
    >
      <UnnnicLabel :label="$t('insights_header.dynamic_columns')" />
      <UnnnicSelectSmart
        data-testid="columns-select"
        :modelValue="selectedColumns"
        :options="headerOptions"
        multiple
        autocomplete
        autocompleteIconLeft
        autocompleteClearOnFocus
        :placeholder="$t('insights_header.placeholder_dynamic_columns')"
        @update:model-value="handleVisibleColumnsUpdate"
      />
    </section>
    <template
      v-for="filter in currentDashboardFilters"
      :key="filter.name"
    >
      <DynamicFilter
        data-testid="dynamic-filter"
        :modelValue="filtersInternal[filter.name]"
        :filter="filter"
        :disabled="
          filter.depends_on && !filtersInternal[filter.depends_on?.filter]
        "
        :dependsOnValue="getDynamicFiltersDependsOnValues(filter)"
        @update:model-value="updateFilter(filter.name, $event)"
      />
    </template>
    <UnnnicButton
      data-testid="refresh-button"
      :text="$t('insights_header.refresh')"
      type="secondary"
      iconLeft="refresh"
      :disabled="isLoading"
      @click="updateTableData"
    />
    <UnnnicButton
      data-testid="clear-filters-button"
      :text="$t('insights_header.clear_filters')"
      type="tertiary"
      :disabled="!hasFiltersInternal || isLoading"
      @click="clearFilters"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import DynamicFilter from '@/components/insights/Layout/HeaderFilters/DynamicFilter.vue';

const props = defineProps({
  headers: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const store = useStore();
const filtersInternal = ref({});
const selectedColumns = ref([]);

onMounted(() => {
  const currentFilters = store.state?.dashboards?.currentDashboardFilters || [];
  const sectorFilter = currentFilters.find(
    (filter) => filter.name === 'sector',
  );

  store.dispatch('dashboards/setCurrentDashboardFilters', [
    ...currentFilters,
    ...(sectorFilter
      ? [
          {
            ...sectorFilter,
            name: 'sector_id',
            source: 'sector_id',
          },
        ]
      : []),
  ]);
  syncFiltersInternal();
  store.dispatch('agentsColumnsFilter/initializeFromStorage');
  const storedColumns = store.state?.agentsColumnsFilter?.visibleColumns || [];
  const availableColumns = headerOptions.value;
  if (storedColumns.length === 0 && availableColumns.length > 0) {
    handleVisibleColumnsUpdate(availableColumns);
  } else if (storedColumns.length > 0 && availableColumns.length > 0) {
    const filteredColumns = availableColumns.filter((opt) =>
      storedColumns.includes(opt.value),
    );
    handleVisibleColumnsUpdate(filteredColumns);
  } else if (storedColumns.length > 0) {
    handleVisibleColumnsUpdate(
      storedColumns.map((opt) => ({ value: opt, label: opt })),
    );
  }
});

const headerOptions = computed(() => {
  if (!Array.isArray(props.headers)) return [];

  return props.headers
    .filter(
      (header) =>
        header?.display &&
        !header?.hidden_name &&
        header?.name &&
        !['status', 'agent', 'in_progress', 'closeds'].includes(header.name),
    )
    .map((header) => ({
      value: header.name,
      label: header.name,
    }));
});

const handleVisibleColumnsUpdate = (value) => {
  if (
    !store.state?.agentsColumnsFilter?.hasInitialized ||
    !Array.isArray(value)
  )
    return;

  const columnNames = value.map((option) => option.value);

  selectedColumns.value = value;
  store.dispatch('agentsColumnsFilter/setVisibleColumns', columnNames);
};

const currentDashboardFilters = computed(() => {
  const filters = ['sectors', 'queues'];
  return (
    store.state?.dashboards?.currentDashboardFilters?.filter((filter) =>
      filters.includes(filter.source),
    ) || []
  );
});

const appliedFilters = computed(
  () => store.state?.dashboards?.appliedFilters || {},
);
const hasFiltersInternal = computed(
  () => Object.keys(filtersInternal.value).length > 0,
);

const getDynamicFiltersDependsOnValues = (filter) => {
  if (!filter?.depends_on?.search_param) return null;
  const { search_param, filter: filterName } = filter.depends_on;
  return { [search_param]: filtersInternal.value[filterName] };
};

const clearFilters = () => {
  filtersInternal.value = {};
  updateTableData();
};

const updateTableData = () => {
  store.dispatch('dashboards/resetAppliedFilters');
};

const updateFilter = (filterName, value) => {
  const hasNonNullValues =
    typeof value === 'object' && value
      ? Object.values(value).some((val) => val)
      : value;

  if (hasNonNullValues) {
    filtersInternal.value[filterName] = value;
    if (Object.keys(filtersInternal.value).length) {
      const processedFilters = { ...filtersInternal.value };
      if (filtersInternal.value.sector) {
        processedFilters.sector_id = filtersInternal.value.sector;
        delete processedFilters.sector;
      }
      store.dispatch('dashboards/setAppliedFilters', processedFilters);
    }
  }
};

const syncFiltersInternal = () => {
  const processedFilters = { ...appliedFilters.value };

  if (appliedFilters.value.sector_id) {
    processedFilters.sector = appliedFilters.value.sector_id;
    delete processedFilters.sector_id;
  }
  filtersInternal.value = processedFilters;
};

watch(appliedFilters, syncFiltersInternal);
watch(
  headerOptions,
  () => {
    const storedColumns =
      store.state?.agentsColumnsFilter?.visibleColumns || [];
    if (storedColumns.length === 0 && headerOptions.value.length > 0) {
      handleVisibleColumnsUpdate(headerOptions.value);
    }
  },
  { once: true },
);
</script>

<style scoped lang="scss">
.agents-table-header {
  display: flex;
  flex-direction: row;
  align-items: end;
  width: 100%;
  gap: 1rem;
}
</style>
