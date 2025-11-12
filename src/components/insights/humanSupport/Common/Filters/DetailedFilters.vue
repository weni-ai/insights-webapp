<template>
  <section class="detailed-filters">
    <TransitionGroup
      name="filter-slide"
      tag="div"
      class="detailed-filters__container"
    >
      <FilterSelect
        v-for="filter in activeFilters"
        :key="filter.type"
        :ref="(el) => setFilterRef(el, filter.type)"
        v-bind="filter.props"
        v-on="filter.events"
      />
    </TransitionGroup>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import FilterSelect from './FilterSelect.vue';

type FilterType = 'attendant' | 'contact' | 'ticket_id';
type ComponentType = 'attendant' | 'pauses' | 'finished';
type SourceType = 'agents' | 'contacts' | 'ticket_id';
type StoreFilterType = 'agent' | 'contact' | 'ticketId';

interface Props {
  type: ComponentType;
}

interface FilterOption {
  value: string;
  label: string;
}

interface FilterState {
  type: FilterType;
  source: SourceType;
  selected: FilterOption[];
}

const props = defineProps<Props>();
const humanSupport = useHumanSupport();
const { saveAppliedDetailFilter } = humanSupport;

const filterRefs = ref<Record<FilterType, any>>({
  attendant: null,
  contact: null,
  ticket_id: null,
});

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

const filters = ref<Record<FilterType, FilterState>>({
  attendant: {
    type: 'attendant',
    source: 'agents',
    selected: [],
  },
  contact: {
    type: 'contact',
    source: 'contacts',
    selected: [],
  },
  ticket_id: {
    type: 'ticket_id',
    source: 'ticket_id',
    selected: [],
  },
});

const setFilterRef = (el: any, filterType: FilterType) => {
  if (el) {
    filterRefs.value[filterType] = el;
  }
};

const filterParams = computed(() => ({
  sectors: humanSupport.appliedFilters.sectors.map((sector) => sector.value),
  queues: humanSupport.appliedFilters.queues.map((queue) => queue.value),
  tags: humanSupport.appliedFilters.tags.map((tag) => tag.value),
}));

const handleFilterChange = (
  filterType: FilterType,
  payload: { value: string; label: string; email?: string },
) => {
  const storeFilterType = FILTER_TO_STORE_MAP[filterType];

  if (!payload.value) {
    saveAppliedDetailFilter(storeFilterType, '', '');
    return;
  }

  let valueToStore = payload.value;
  if (filterType === 'attendant' && payload.email) {
    valueToStore = payload.email;
  }

  saveAppliedDetailFilter(storeFilterType, valueToStore, payload.label);
};

const activeFilters = computed(() => {
  const filterTypes = FILTER_CONFIG[props.type] || [];

  return filterTypes.map((filterType) => {
    const filter = filters.value[filterType];

    return {
      type: filterType,
      props: {
        type: filter.type,
        source: filter.source,
        modelValue: filter.selected,
        filterParams: filterParams.value,
      },
      events: {
        'update:modelValue': (value: FilterOption[]) => {
          filter.selected = value;
        },
        change: (payload: { value: string; label: string; email?: string }) =>
          handleFilterChange(filterType, payload),
      },
    };
  });
});

const clearNonFinishedFilters = () => {
  if (props.type !== 'finished') {
    filters.value.contact.selected = [];
    filters.value.ticket_id.selected = [];

    if (filterRefs.value.contact) {
      filterRefs.value.contact.clearData();
    }
    if (filterRefs.value.ticket_id) {
      filterRefs.value.ticket_id.clearData();
    }

    saveAppliedDetailFilter('contact', '', '');
    saveAppliedDetailFilter('ticketId', '', '');
  }
};

watch(
  () => props.type,
  async (newType, oldType) => {
    clearNonFinishedFilters();

    if (!oldType) return;

    const newFilters = FILTER_CONFIG[newType] || [];
    const oldFilters = FILTER_CONFIG[oldType] || [];

    const filtersToReset = newFilters.filter(
      (filterType) => !oldFilters.includes(filterType),
    );

    if (filtersToReset.length === 0) return;

    filtersToReset.forEach((filterType) => {
      filters.value[filterType].selected = [];
    });
  },
  { flush: 'post' },
);

watch(
  () => humanSupport.appliedFilters,
  () => {
    // Os filtros individuais já observam filterParams e recarregam automaticamente
  },
  { flush: 'post' },
);

onMounted(() => {
  clearNonFinishedFilters();
});
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
