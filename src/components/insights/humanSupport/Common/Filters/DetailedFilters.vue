<template>
  <section class="detailed-filters">
    <TransitionGroup
      name="filter-slide"
      tag="div"
      class="detailed-filters__container"
    >
      <section
        v-for="filter in activeFilters"
        :key="filter.type"
        class="detailed-filters__filter"
      >
        <UnnnicLabel
          :label="$t(`human_support_dashboard.filters.${filter.type}.label`)"
        />
        <UnnnicSelectSmart
          :data-testid="`detailed-filters-select-${filter.type}`"
          :placeholder="
            $t(`human_support_dashboard.filters.common.placeholder`)
          "
          :modelValue="filter.selected"
          :options="filter.options"
          autocomplete
          autocompleteClearOnFocus
          autocompleteIconLeft
          :isLoading="filter.isLoading"
          @update:model-value="(value) => handleChange(filter.type, value)"
        />
      </section>
    </TransitionGroup>
  </section>
</template>

<script setup lang="ts">
import { UnnnicSelectSmart } from '@weni/unnnic-system';
import Projects from '@/services/api/resources/projects';
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';

type FilterType = 'attendant' | 'contact' | 'ticket_id';
type ComponentType = 'attendant' | 'pauses' | 'finished';
type SourceType = 'agents' | 'contacts' | 'ticket_id';
type StoreFilterType = 'agent' | 'contact' | 'ticketId';

interface Props {
  type: ComponentType;
}

interface FilterItem {
  uuid: string;
  name: string;
  email?: string;
}

interface TicketIdItem {
  ticket_id: string;
}

interface FilterOption {
  value: string;
  label: string;
}

interface FilterState {
  type: FilterType;
  source: SourceType;
  data: FilterItem[] | TicketIdItem[];
  selected: FilterOption[];
  isLoading: boolean;
}

const props = defineProps<Props>();
const humanSupport = useHumanSupport();
const { saveAppliedDetailFilter } = humanSupport;

const FILTER_CONFIG: Record<ComponentType, FilterType[]> = {
  attendant: ['attendant'],
  pauses: ['attendant'],
  finished: ['attendant', 'contact', 'ticket_id'],
};

const FILTER_TO_STORE_MAP: Record<FilterType, StoreFilterType> = {
  attendant: 'agent',
  contact: 'contact',
  ticket_id: 'ticketId',
};

const isTicketIdFilter = (filterType: FilterType): boolean =>
  filterType === 'ticket_id';

const filters = ref<Record<FilterType, FilterState>>({
  attendant: {
    type: 'attendant',
    source: 'agents',
    data: [],
    selected: [],
    isLoading: false,
  },
  contact: {
    type: 'contact',
    source: 'contacts',
    data: [],
    selected: [],
    isLoading: false,
  },
  ticket_id: {
    type: 'ticket_id',
    source: 'ticket_id',
    data: [],
    selected: [],
    isLoading: false,
  },
});

const mapDataToOptions = (
  filterType: FilterType,
  data: FilterItem[] | TicketIdItem[],
): FilterOption[] => {
  if (isTicketIdFilter(filterType)) {
    return (data as TicketIdItem[]).map((item) => ({
      value: item.ticket_id,
      label: item.ticket_id,
    }));
  }

  return (data as FilterItem[]).map((item) => ({
    value: item.uuid,
    label: item.name,
  }));
};

const activeFilters = computed(() => {
  const filterTypes = FILTER_CONFIG[props.type] || [];

  return filterTypes.map((filterType) => {
    const filter = filters.value[filterType];

    return {
      type: filterType,
      selected: filter.selected,
      options: mapDataToOptions(filterType, filter.data),
      isLoading: filter.isLoading,
    };
  });
});

const loadFilterData = async (filterType: FilterType) => {
  const filter = filters.value[filterType];

  try {
    filter.isLoading = true;
    const params = {
      sectors: humanSupport.appliedFilters.sectors.map(
        (sector) => sector.value,
      ),
      queues: humanSupport.appliedFilters.queues.map((queue) => queue.value),
      tags: humanSupport.appliedFilters.tags.map((tag) => tag.value),
      start_date: humanSupport.appliedDateRange.start,
      end_date: humanSupport.appliedDateRange.end,
    };
    const response = await Projects.getProjectSource(filter.source, params);
    filter.data = response;
  } catch (error) {
    console.error(`Error loading ${filterType} data`, error);
    filter.data = [];
  } finally {
    filter.isLoading = false;
  }
};

const findSelectedItem = (
  filterType: FilterType,
  data: FilterItem[] | TicketIdItem[],
  value: string,
): { value: string; label: string } | null => {
  if (isTicketIdFilter(filterType)) {
    const item = (data as TicketIdItem[]).find((d) => d.ticket_id === value);
    return item ? { value: item.ticket_id, label: item.ticket_id } : null;
  }

  const item = (data as FilterItem[]).find((d) => d.uuid === value);
  return item ? { value: item.uuid, label: item.name } : null;
};

const updateFilterSelection = (
  filter: FilterState,
  newSelection: { value: string; label: string },
) => {
  const shouldUpdate =
    filter.selected.length === 0 ||
    filter.selected[0].value !== newSelection.value;

  if (shouldUpdate) {
    nextTick(() => {
      filter.selected = [newSelection];
    });
  }
};

const handleChange = (
  filterType: FilterType,
  selectedOptions: FilterOption[],
) => {
  const filter = filters.value[filterType];
  const storeFilterType = FILTER_TO_STORE_MAP[filterType];

  if (!selectedOptions || !selectedOptions.length) {
    if (filter.selected.length > 0) {
      nextTick(() => {
        filter.selected = [];
      });
    }
    saveAppliedDetailFilter(storeFilterType, '', '');
    return;
  }

  const selected = selectedOptions[0];
  const item = findSelectedItem(filterType, filter.data, selected.value);

  if (item) {
    updateFilterSelection(filter, item);
    saveAppliedDetailFilter(storeFilterType, item.value, item.label);
  }
};

const loadData = async () => {
  const filterTypes = FILTER_CONFIG[props.type] || [];
  await Promise.all(
    filterTypes.map((filterType) => loadFilterData(filterType)),
  );
};

onMounted(() => {
  loadData();
});

watch(
  () => humanSupport.appliedDateRange,
  () => {
    loadData();
  },
  { flush: 'post' },
);

watch(
  () => humanSupport.appliedFilters,
  () => {
    loadData();
  },
  { flush: 'post' },
);
</script>

<style scoped lang="scss">
.detailed-filters {
  display: flex;
  gap: $unnnic-space-6;

  &__container {
    display: flex;
    gap: $unnnic-space-6;
    flex: 1;
  }

  &__filter {
    display: flex;
    flex-direction: column;
    flex: 0 0 calc(100% / 4);
    max-width: calc(100% / 4);
    gap: $unnnic-space-1;
  }
}

.filter-slide-enter-active {
  transition: opacity 0.3s ease;
}

.filter-slide-leave-active {
  transition: opacity 0.3s ease;
}

.filter-slide-enter-from {
  opacity: 0;
}

.filter-slide-leave-to {
  opacity: 0;
}
</style>
