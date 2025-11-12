<template>
  <section class="filter-select">
    <UnnnicLabel :label="filterLabel" />
    <UnnnicSelectSmart
      v-bind="selectProps"
      v-on="selectEvents"
    />
  </section>
</template>

<script setup lang="ts">
import { UnnnicSelectSmart } from '@weni/unnnic-system';
import Projects from '@/services/api/resources/projects';
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

type FilterType = 'attendant' | 'contact' | 'ticket_id';
type SourceType = 'agents' | 'contacts' | 'ticket_id';

interface FilterItem {
  uuid: string;
  name: string;
  email?: string;
  external_id?: string;
}

interface TicketIdItem {
  protocol: string;
}

interface FilterOption {
  value: string;
  label: string;
}

interface Props {
  type: FilterType;
  source: SourceType;
  modelValue: FilterOption[];
  filterParams?: {
    sectors?: string[];
    queues?: string[];
    tags?: string[];
  };
}

interface Emits {
  (_e: 'update:modelValue', _value: FilterOption[]): void;
  (
    _e: 'change',
    _payload: { value: string; label: string; email?: string },
  ): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useI18n();

const data = ref<FilterItem[] | TicketIdItem[]>([]);
const isLoading = ref(false);

const isTicketIdFilter = computed(() => props.type === 'ticket_id');

const filterLabel = computed(() =>
  t(`human_support_dashboard.filters.${props.type}.label`),
);

const mapDataToOptions = (
  items: FilterItem[] | TicketIdItem[],
): FilterOption[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  if (isTicketIdFilter.value) {
    return (items as TicketIdItem[]).map((item) => ({
      value: item.protocol,
      label: item.protocol,
    }));
  }

  return (items as FilterItem[]).map((item) => {
    const value =
      props.type === 'contact' && item.external_id
        ? item.external_id
        : item.uuid;
    return {
      value,
      label: item.name,
    };
  });
};

const options = computed(() => mapDataToOptions(data.value));

const selectProps = computed(() => ({
  'data-testid': `detailed-filters-select-${props.type}`,
  placeholder: t('human_support_dashboard.filters.common.placeholder'),
  modelValue: props.modelValue,
  options: options.value,
  autocomplete: true,
  autocompleteClearOnFocus: true,
  autocompleteIconLeft: true,
  isLoading: isLoading.value,
}));

const findSelectedItem = (
  items: FilterItem[] | TicketIdItem[],
  value: string,
): { value: string; label: string; email?: string } | null => {
  if (!Array.isArray(items)) {
    return null;
  }

  if (isTicketIdFilter.value) {
    const item = (items as TicketIdItem[]).find((d) => d.protocol === value);
    return item ? { value: item.protocol, label: item.protocol } : null;
  }

  const item = (items as FilterItem[]).find((d) => {
    if (props.type === 'contact' && d.external_id) {
      return d.external_id === value;
    }
    return d.uuid === value;
  });

  if (!item) return null;

  const itemValue =
    props.type === 'contact' && item.external_id ? item.external_id : item.uuid;

  const result: { value: string; label: string; email?: string } = {
    value: itemValue,
    label: item.name,
  };

  if (props.type === 'attendant' && item.email) {
    result.email = item.email;
  }

  return result;
};

const handleChange = (selectedOptions: FilterOption[]) => {
  if (!selectedOptions || !selectedOptions.length) {
    if (props.modelValue.length === 0) return;
    emit('update:modelValue', []);
    emit('change', { value: '', label: '' });
    return;
  }

  const selected = selectedOptions[0];
  const item = findSelectedItem(data.value, selected.value);

  if (item) {
    const currentValue = props.modelValue[0]?.value;
    if (currentValue === item.value) return;

    emit('update:modelValue', [{ value: item.value, label: item.label }]);
    emit('change', item);
  }
};

const selectEvents = computed(() => ({
  'update:model-value': handleChange,
}));

const loadData = async () => {
  try {
    isLoading.value = true;
    const params = props.filterParams || {};
    const response = await Projects.getProjectSource(props.source, params);

    if (Array.isArray(response)) {
      data.value = response;
    } else if (response && Array.isArray(response.results)) {
      data.value = response.results;
    } else {
      data.value = [];
    }
  } catch (error) {
    console.error(`Error loading ${props.type} data`, error);
    data.value = [];
  } finally {
    isLoading.value = false;
  }
};

const clearData = () => {
  data.value = [];
  emit('update:modelValue', []);
};

watch(
  () => props.filterParams,
  () => {
    loadData();
  },
  { deep: true, flush: 'post' },
);

onMounted(() => {
  loadData();
});

defineExpose({
  loadData,
  clearData,
});
</script>

<style scoped lang="scss">
.filter-select {
  display: flex;
  flex-direction: column;
  flex: 0 0 calc(100% / 4);
  max-width: calc(100% / 4);
  gap: $unnnic-space-1;
}
</style>
