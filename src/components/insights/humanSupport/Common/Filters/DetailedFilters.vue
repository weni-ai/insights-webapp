<template>
  <section
    class="detailed-filters"
    :data-testid="`detailed-filters-${type}`"
  >
    <section
      class="detailed-filters__container"
      data-testid="detailed-filters-container"
    >
      <TransitionGroup name="filter-slide">
        <FilterInput
          v-for="filter in activeFilters.filter(
            (f) => f.component === 'FilterInput',
          )"
          :key="filter.type"
          :ref="(el) => setFilterRef(el, filter.type)"
          :data-testid="`detailed-filter-${filter.type}`"
          v-bind="filter.props"
          v-on="filter.events"
        />
        <FilterSelect
          v-for="filter in activeFilters.filter(
            (f) => f.component === 'FilterSelect',
          )"
          :key="filter.type"
          :ref="(el) => setFilterRef(el, filter.type)"
          :data-testid="`detailed-filter-${filter.type}`"
          v-bind="filter.props"
          v-on="filter.events"
        />
      </TransitionGroup>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import FilterSelect from './FilterSelect.vue';
import FilterInput from './FilterInput.vue';

type FilterType = 'attendant' | 'contact' | 'ticket_id' | 'contact_input';
type ComponentType =
  | 'attendant'
  | 'pauses'
  | 'finished'
  | 'in_awaiting'
  | 'in_progress';
type SourceType = 'agents' | 'contacts' | 'ticket_id';
type StoreFilterType = 'agent' | 'contact' | 'ticketId' | 'contactInput';

interface Props {
  type: ComponentType;
}

interface FilterOption {
  value: string;
  label: string;
}

interface FilterState {
  type: FilterType;
  source?: SourceType;
  selected: FilterOption[] | string;
  isInput?: boolean;
}

interface ActiveFilter {
  type: FilterType;
  component: 'FilterInput' | 'FilterSelect';
  props: any;
  events: any;
}

const props = defineProps<Props>();
const humanSupport = useHumanSupport();
const { saveAppliedDetailFilter } = humanSupport;

const filterRefs = ref<Record<FilterType, any>>({
  attendant: null,
  contact: null,
  ticket_id: null,
  contact_input: null,
});

const FILTER_CONFIG: Record<ComponentType, FilterType[]> = {
  attendant: ['attendant'],
  pauses: ['attendant'],
  finished: ['attendant', 'contact', 'ticket_id'],
  in_awaiting: ['contact_input'],
  in_progress: ['contact_input'],
};

const FILTER_TO_STORE_MAP: Record<FilterType, StoreFilterType> = {
  attendant: 'agent',
  contact: 'contact',
  ticket_id: 'ticketId',
  contact_input: 'contactInput',
};

const filters = ref<Record<FilterType, FilterState>>({
  attendant: {
    type: 'attendant',
    source: 'agents',
    selected: [],
    isInput: false,
  },
  contact: {
    type: 'contact',
    source: 'contacts',
    selected: [],
    isInput: false,
  },
  ticket_id: {
    type: 'ticket_id',
    source: 'ticket_id',
    selected: [],
    isInput: false,
  },
  contact_input: {
    type: 'contact_input',
    selected: '',
    isInput: true,
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
  payload: { value: string; label: string; email?: string } | string,
) => {
  const storeFilterType = FILTER_TO_STORE_MAP[filterType];

  if (typeof payload === 'string') {
    saveAppliedDetailFilter(storeFilterType, payload, payload);
    return;
  }

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

const activeFilters = computed<ActiveFilter[]>(() => {
  const filterTypes = FILTER_CONFIG[props.type] || [];

  return filterTypes.map((filterType): ActiveFilter => {
    const filter = filters.value[filterType];

    if (filter.isInput) {
      return {
        type: filterType,
        component: 'FilterInput',
        props: {
          type: 'contact',
          modelValue: filter.selected as string,
        },
        events: {
          'update:modelValue': (value: string) => {
            filter.selected = value;
          },
          change: (value: string) => handleFilterChange(filterType, value),
        },
      };
    }

    return {
      type: filterType,
      component: 'FilterSelect',
      props: {
        type: filter.type,
        source: filter.source,
        modelValue: filter.selected as FilterOption[],
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

  if (props.type !== 'in_awaiting' && props.type !== 'in_progress') {
    filters.value.contact_input.selected = '';

    if (filterRefs.value.contact_input) {
      filterRefs.value.contact_input.clearData();
    }

    saveAppliedDetailFilter('contactInput', '', '');
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
}

.filter-slide-enter-active {
  transition: all 0.3s ease;
}

.filter-slide-leave-active {
  transition: all 0.3s ease;
  position: absolute;
}

.filter-slide-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.filter-slide-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.filter-slide-move {
  transition: transform 0.3s ease;
}
</style>
