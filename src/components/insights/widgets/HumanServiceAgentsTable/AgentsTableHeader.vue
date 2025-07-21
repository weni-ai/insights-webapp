<template>
  <div
    class="agents-table-header"
    data-testid="agents-table-header"
  >
    <UnnnicInputDatePicker
      v-model="selectedDate"
      next
      class="agents-table-header__date-picker"
    />
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
      source="queues"
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

import { useAgentsColumnsFilter } from '@/store/modules/agentsColumnsFilter';
import { useWidgets } from '@/store/modules/widgets';

import FilterSelect from '@/components/insights/Layout/HeaderFilters/FilterSelect.vue';
import i18n from '@/utils/plugins/i18n';

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

const agentsColumnsFilterStore = useAgentsColumnsFilter();
const widgetsStore = useWidgets();

const selectedColumns = ref([]);
const dependsOnQueue = ref({
  search_param: 'sector_id',
  filter: 'sector',
});
const selectedSector = ref('');
const selectedQueue = ref('');
const selectedDate = ref({
  start: '',
  end: '',
});

onMounted(() => {
  agentsColumnsFilterStore.initializeFromStorage();

  const storedColumns = agentsColumnsFilterStore.visibleColumns || [];
  const currentFilters = widgetsStore.currentExpansiveWidgetFilters;
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
      value: i18n.global.t(header.name?.toLowerCase()),
      label: i18n.global.t(header.name?.toLowerCase()),
      key: header.name,
    }));
});

const hasFiltersInternal = computed(() => {
  return !!selectedSector.value || !!selectedQueue.value;
});

const handleVisibleColumnsUpdate = (value) => {
  if (!agentsColumnsFilterStore.hasInitialized || !Array.isArray(value)) return;

  if (agentsColumnsFilterStore.visibleColumns.length / value.length < 3) {
    const columnNames = value.map((option) => option.key);
    selectedColumns.value = value;

    agentsColumnsFilterStore.setVisibleColumns(columnNames);
  }
};

const updateSector = (value) => {
  if (value !== selectedSector.value && selectedQueue.value) {
    selectedQueue.value = '';
  }

  selectedSector.value = value;

  if (!value) {
    selectedQueue.value = '';
    widgetsStore.updateCurrentExpansiveWidgetFilters({ queue: '' });
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
  widgetsStore.resetCurrentExpansiveWidgetFilters();
};

const refreshData = () => {
  widgetsStore.updateCurrentExpansiveWidgetData({
    ...widgetsStore.currentExpansiveWidget,
  });
};

watch(headerOptions, () => {
  const storedColumns = agentsColumnsFilterStore.visibleColumns || [];
  if (storedColumns.length === 0 && headerOptions.value.length > 2) {
    handleVisibleColumnsUpdate(headerOptions.value);
  }
});

watch(selectedDate, () => {
  widgetsStore.updateCurrentExpansiveWidgetFilters({
    date: selectedDate.value,
  });
});

watch(selectedSector, () => {
  widgetsStore.updateCurrentExpansiveWidgetFilters({
    sector: selectedSector.value,
  });
});

watch(selectedQueue, () => {
  widgetsStore.updateCurrentExpansiveWidgetFilters({
    queue: selectedQueue.value,
  });
});
</script>

<style scoped lang="scss">
:deep(.agents-table-header__date-picker) {
  width: 250px;
}

.agents-table-header {
  display: flex;
  flex-direction: row;
  align-items: end;
  width: 100%;
  gap: 1rem;
}
</style>
