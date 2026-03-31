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
        <component
          :is="filter.component"
          v-for="filter in activeFilters"
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
import FilterSelect, { type FilterOption } from './FilterSelect.vue';
import FilterInput from './FilterInput.vue';
import FilterMultiSelect from './FilterMultiSelect.vue';

type FilterType =
  | 'status'
  | 'attendant'
  | 'contact'
  | 'ticket_id'
  | 'contact_input';
type ComponentType =
  | 'attendant'
  | 'pauses'
  | 'finished'
  | 'in_awaiting'
  | 'in_progress';
type SourceType = 'agents' | 'contacts' | 'ticket_id' | 'custom_status';
type StoreFilterType =
  | 'status'
  | 'agent'
  | 'contact'
  | 'ticketId'
  | 'contactInput';

interface Props {
  mode: 'monitoring' | 'analysis';
  type: ComponentType;
}

interface FilterState {
  type: FilterType;
  source?: SourceType;
  selected: string | string[];
  isInput?: boolean;
  isMultiSelect?: boolean;
  component: any;
  itemValue?: string;
  itemLabel?: string;
  formatOptionsFn?: (_options: Record<string, unknown>[]) => FilterOption[];
}

const props = defineProps<Props>();
const humanSupport = useHumanSupport();
const { saveAppliedDetailFilter } = humanSupport;

const filterRefs = ref<Record<FilterType, any>>({
  attendant: null,
  contact: null,
  ticket_id: null,
  contact_input: null,
  status: null,
});

const FILTER_CONFIG_MONITORING = {
  attendant: ['status', 'attendant'],
  pauses: ['attendant'],
  in_awaiting: ['contact_input'],
  in_progress: ['contact_input'],
};

const FILTER_CONFIG_ANALYSIS = {
  attendant: ['attendant'],
  pauses: ['attendant'],
  finished: ['attendant', 'contact', 'ticket_id'],
};

const filterConfig = computed(() => {
  if (props.mode === 'monitoring') {
    return FILTER_CONFIG_MONITORING;
  }
  return FILTER_CONFIG_ANALYSIS;
});

const FILTER_TO_STORE_MAP: Record<FilterType, StoreFilterType> = {
  attendant: 'agent',
  contact: 'contact',
  ticket_id: 'ticketId',
  contact_input: 'contactInput',
  status: 'status',
};

const filters = ref<Record<FilterType, FilterState>>({
  attendant: {
    type: 'attendant',
    source: 'agents',
    selected: '',
    formatOptionsFn: (
      agents: { uuid: string; name: string; email: string }[],
    ) => {
      return agents.map((agent) => ({
        value: agent.uuid,
        label: agent.name.trim() || agent.email,
      }));
    },
    component: FilterSelect,
  },
  contact: {
    type: 'contact',
    source: 'contacts',
    selected: '',
    component: FilterSelect,
  },
  ticket_id: {
    type: 'ticket_id',
    source: 'ticket_id',
    selected: '',
    component: FilterSelect,
  },
  contact_input: {
    type: 'contact',
    selected: '',
    isInput: true,
    component: FilterInput,
  },
  status: {
    type: 'status',
    selected: [],
    source: 'custom_status',
    isMultiSelect: true,
    component: FilterMultiSelect,
    itemValue: 'name',
    itemLabel: 'name',
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
  payload: { value: any; label: string; email?: string } | string,
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

const activeFilters = computed(() => {
  const filterTypes = filterConfig.value[props.type] || [];

  return filterTypes.map((filterType) => {
    const filter = filters.value[filterType];

    const props = {
      type: filter.type,
      modelValue: filter.selected,
      source: filter.source,
      filterParams: filterParams.value,
      itemValue: filter.itemValue,
      itemLabel: filter.itemLabel,
      formatOptionsFn: filter.formatOptionsFn,
    };

    const events = {
      'update:modelValue': (value: string) => {
        filter.selected = value;
      },
      change: (value: string) => handleFilterChange(filterType, value),
    };

    return {
      type: filterType,
      component: filter.component,
      props,
      events,
    };
  });
});

const clearNonFinishedFilters = () => {
  if (props.type === 'attendant') {
    filters.value.status.selected = [];

    saveAppliedDetailFilter('status', [] as string[], '');
  }
  if (props.type !== 'finished') {
    filters.value.contact.selected = '';
    filters.value.ticket_id.selected = '';

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

    const newFilters = filterConfig.value[newType] || [];
    const oldFilters = filterConfig.value[oldType] || [];

    const filtersToReset = newFilters.filter(
      (filterType) => !oldFilters.includes(filterType),
    );

    if (filtersToReset.length === 0) return;

    filtersToReset.forEach((filterType) => {
      const filter = filters.value[filterType];
      if (filter.isMultiSelect) filter.selected = [];
      else filter.selected = '';
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
