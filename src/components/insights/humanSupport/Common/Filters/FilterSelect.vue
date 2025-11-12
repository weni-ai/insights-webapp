<template>
  <section class="filter-select">
    <UnnnicLabel :label="filterLabel" />
    <UnnnicSelectSmart
      ref="selectSmartRef"
      v-bind="selectProps"
      v-on="selectEvents"
    />
  </section>
</template>

<script setup lang="ts">
import { UnnnicSelectSmart } from '@weni/unnnic-system';
import Projects from '@/services/api/resources/projects';
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  useTemplateRef,
} from 'vue';
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
  ticket_id: string;
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

const selectSmartRef = useTemplateRef<any>('selectSmartRef');
const data = ref<FilterItem[] | TicketIdItem[]>([]);
const isLoading = ref(false);
const nextPageUrl = ref<string | null>(null);
const isLoadingMore = ref(false);
const searchValue = ref('');
const searchDebounceTimer = ref<ReturnType<typeof setTimeout> | null>(null);

const isTicketIdFilter = computed(() => props.type === 'ticket_id');
const isContactFilter = computed(() => props.type === 'contact');
const hasInfiniteScroll = computed(
  () => isContactFilter.value || isTicketIdFilter.value,
);
const filterLabel = computed(() =>
  t(`human_support_dashboard.filters.${props.type}.label`),
);

const mapItemToOption = (item: FilterItem | TicketIdItem): FilterOption => {
  if (isTicketIdFilter.value) {
    const ticketItem = item as TicketIdItem;
    return { value: ticketItem.ticket_id, label: ticketItem.ticket_id };
  }

  const filterItem = item as FilterItem;
  const value =
    props.type === 'contact' && filterItem.external_id
      ? filterItem.external_id
      : filterItem.uuid;

  return { value, label: filterItem.name };
};

const mapDataToOptions = (
  items: FilterItem[] | TicketIdItem[],
): FilterOption[] => {
  return Array.isArray(items) ? items.map(mapItemToOption) : [];
};

const options = computed(() => mapDataToOptions(data.value));

const canLoadMore = () => {
  return hasInfiniteScroll.value && !!nextPageUrl.value;
};

const selectProps = computed(() => ({
  'data-testid': `detailed-filters-select-${props.type}`,
  placeholder: t('human_support_dashboard.filters.common.placeholder'),
  modelValue: props.modelValue,
  options: options.value,
  autocomplete: true,
  autocompleteClearOnFocus: true,
  autocompleteIconLeft: true,
  isLoading: isLoading.value,
  ...(hasInfiniteScroll.value && {
    infiniteScroll: true,
    infiniteScrollDistance: 10,
    infiniteScrollCanLoadMore: canLoadMore,
    disableInternalFilter: true,
  }),
}));

const findSelectedItem = (
  items: FilterItem[] | TicketIdItem[],
  value: string,
): { value: string; label: string; email?: string } | null => {
  if (!Array.isArray(items)) {
    return null;
  }

  if (isTicketIdFilter.value) {
    const item = (items as TicketIdItem[]).find((d) => d.ticket_id === value);
    return item ? { value: item.ticket_id, label: item.ticket_id } : null;
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

const clearSearchTimer = () => {
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value);
    searchDebounceTimer.value = null;
  }
};

const handleSearchValueUpdate = (newSearchValue: string) => {
  if (!hasInfiniteScroll.value) return;

  clearSearchTimer();
  searchValue.value = newSearchValue;

  const trimmedSearch = newSearchValue?.trim() || '';

  if (!trimmedSearch) {
    loadData();
    return;
  }

  searchDebounceTimer.value = setTimeout(() => {
    loadData(trimmedSearch);
  }, 500);
};

const selectEvents = computed(() => ({
  'update:model-value': handleChange,
  ...(hasInfiniteScroll.value && {
    'scroll-end': loadMoreData,
    'update:search-value': handleSearchValueUpdate,
  }),
}));

const resetDataState = () => {
  data.value = [];
  nextPageUrl.value = null;
};

const processApiResponse = (response: any, preserveNextForSearch = false) => {
  if (Array.isArray(response)) {
    data.value = response;
    nextPageUrl.value = null;
    return;
  }

  if (response?.results && Array.isArray(response.results)) {
    data.value = response.results;
    nextPageUrl.value =
      preserveNextForSearch || hasInfiniteScroll.value ? response.next : null;
    return;
  }

  resetDataState();
};

const loadData = async (search?: string) => {
  try {
    isLoading.value = true;

    const params = search
      ? { ...props.filterParams, search }
      : props.filterParams || {};

    const response = await Projects.getProjectSource(
      props.source,
      params,
      hasInfiniteScroll.value,
    );

    processApiResponse(response, !!search);
  } catch (error) {
    console.error(`Error loading ${props.type} data`, error);
    resetDataState();
  } finally {
    isLoading.value = false;
  }
};

const loadMoreData = async () => {
  const canLoad =
    hasInfiniteScroll.value && nextPageUrl.value && !isLoadingMore.value;

  if (!canLoad) {
    selectSmartRef.value?.finishInfiniteScroll();
    return;
  }

  try {
    isLoadingMore.value = true;
    const response = await Projects.getProjectSourcePaginated(
      nextPageUrl.value,
    );

    if (response?.results && Array.isArray(response.results)) {
      data.value = [...data.value, ...response.results];
      nextPageUrl.value = response.next;
    }
  } catch (error) {
    console.error(`Error loading more ${props.type} data`, error);
  } finally {
    isLoadingMore.value = false;
    selectSmartRef.value?.finishInfiniteScroll();
  }
};

const clearData = () => {
  resetDataState();
  searchValue.value = '';
  clearSearchTimer();
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

onBeforeUnmount(() => {
  clearSearchTimer();
});

defineExpose({
  loadData,
  loadMoreData,
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
