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
    <FilterSelect
      :modelValue="selectedSector"
      :placeholder="$t('filter.sector.placeholder')"
      keyValueField="uuid"
      source="sectors"
      data-testid="filter-sector"
      @update:model-value="updateSector($event)"
    />
    <FilterSelect
      :modelValue="selectedQueue"
      :placeholder="$t('filter.queue.placeholder')"
      keyValueField="uuid"
      source="queue"
      data-testid="filter-queue"
      :dependsOnValue="getDynamicFiltersDependsOnValues(dependsOnQueue)"
      :dependsOn="{ search_param: 'sector_id', filter: 'sector' }"
      :disabled="!selectedSector"
      @update:model-value="updateQueue($event)"
    />
    <UnnnicButton
      data-testid="refresh-button"
      :text="$t('insights_header.refresh')"
      type="secondary"
      iconLeft="refresh"
      :disabled="isLoading"
      @click="refreshData"
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
import FilterSelect from '@/components/insights/Layout/HeaderFilters/FilterSelect.vue';

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
const selectedColumns = ref([]);
const dependsOnQueue = ref({
  search_param: 'sector_id',
  filter: 'sector',
});
const selectedSector = ref('');
const selectedQueue = ref('');

onMounted(() => {
  store.dispatch('agentsColumnsFilter/initializeFromStorage');

  const storedColumns = store.state?.agentsColumnsFilter?.visibleColumns || [];

  const currentFilters = store.state.widgets.currentExpansiveWidgetFilters;
  selectedSector.value = currentFilters.sector;
  selectedQueue.value = currentFilters.queue;

  const availableColumns = headerOptions.value;
  if (storedColumns.length > 0 && availableColumns.length > 2) {
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
  return props.headers
    .filter(
      (header) =>
        header?.display &&
        !header?.hidden_name &&
        header?.name &&
        !['status', 'agent'].includes(header.name),
    )
    .map((header) => ({
      value: header.name,
      label: header.name,
    }));
});

const hasFiltersInternal = computed(() => {
  return !!selectedSector.value || !!selectedQueue.value;
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

const updateSector = (value) => {
  if (value !== selectedSector.value && selectedQueue.value) {
    selectedQueue.value = '';
  }

  selectedSector.value = value;

  if (!value) {
    selectedQueue.value = '';
    store.dispatch('widgets/updateCurrentExpansiveWidgetFilters', {
      queue: '',
    });
  }
};

const updateQueue = (value) => {
  selectedQueue.value = value;
};

const getDynamicFiltersDependsOnValues = (filter) => {
  if (!filter?.search_param) return null;
  const { search_param } = filter;
  return { [search_param]: selectedSector.value };
};

const clearFilters = () => {
  selectedSector.value = '';
  selectedQueue.value = '';

  store.dispatch('widgets/resetCurrentExpansiveWidgetFilters');
};

const refreshData = () => {
  store.dispatch('widgets/updateCurrentExpansiveWidgetData', {
    ...store.state.widgets.currentExpansiveWidget,
  });
};

watch(headerOptions, () => {
  const storedColumns = store.state?.agentsColumnsFilter?.visibleColumns || [];
  if (storedColumns.length === 0 && headerOptions.value.length > 2) {
    handleVisibleColumnsUpdate(headerOptions.value);
  }
});

watch(selectedSector, () => {
  store.dispatch('widgets/updateCurrentExpansiveWidgetFilters', {
    sector: selectedSector.value,
  });
});

watch(selectedQueue, () => {
  store.dispatch('widgets/updateCurrentExpansiveWidgetFilters', {
    queue: selectedQueue.value,
  });
});
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
