<template>
  <section class="detailed-filters">
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
        :placeholder="$t(`human_support_dashboard.filters.common.placeholder`)"
        :modelValue="filter.selected"
        :options="filter.options"
        autocomplete
        autocompleteClearOnFocus
        autocompleteIconLeft
        :isLoading="filter.isLoading"
        @update:model-value="(value) => handleChange(filter.type, value)"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { UnnnicSelectSmart } from '@weni/unnnic-system';
import Projects from '@/services/api/resources/projects';
import { ref, computed, onMounted } from 'vue';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';

type FilterType = 'attendant' | 'contact' | 'ticket_id';
type ComponentType = 'attendant' | 'pauses' | 'finished';
type SourceType = 'agents' | 'contacts' | 'ticket_id';

interface Props {
  type: ComponentType;
}

interface FilterItem {
  uuid: string;
  name: string;
  email?: string;
}

interface FilterOption {
  value: string;
  label: string;
}

interface FilterState {
  type: FilterType;
  source: SourceType;
  data: FilterItem[];
  selected: FilterOption[];
  isLoading: boolean;
}

const props = defineProps<Props>();
const { saveAppliedAgentFilter } = useHumanSupport();

const FILTER_CONFIG: Record<ComponentType, FilterType[]> = {
  attendant: ['attendant'],
  pauses: ['attendant'],
  finished: ['attendant', 'contact', 'ticket_id'],
};

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

const activeFilters = computed(() => {
  const filterTypes = FILTER_CONFIG[props.type] || [];

  return filterTypes.map((filterType) => {
    const filter = filters.value[filterType];
    return {
      type: filterType,
      selected: filter.selected,
      options: filter.data.map((item) => ({
        value: item.uuid,
        label: item.name,
      })),
      isLoading: filter.isLoading,
    };
  });
});

const loadFilterData = async (filterType: FilterType) => {
  const filter = filters.value[filterType];

  try {
    filter.isLoading = true;
    const response = await Projects.getProjectSource(filter.source);
    filter.data = response;
  } catch (error) {
    console.error(`Error loading ${filterType} data`, error);
    filter.data = [];
  } finally {
    filter.isLoading = false;
  }
};

const handleChange = (
  filterType: FilterType,
  selectedOptions: FilterOption[],
) => {
  const filter = filters.value[filterType];

  if (!selectedOptions || !selectedOptions.length) {
    filter.selected = [];
    return;
  }

  const selected = selectedOptions[0];
  const item = filter.data.find((d) => d.uuid === selected.value);

  if (item) {
    filter.selected = [
      {
        value: item.uuid,
        label: item.name,
      },
    ];

    if (filterType === 'attendant') {
      saveAppliedAgentFilter(item.uuid, item.name);
    }
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
</script>

<style scoped lang="scss">
.detailed-filters {
  display: flex;
  gap: $unnnic-space-6;

  &__filter {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;
  }
}
</style>
