<template>
  <section
    class="filter-select"
    :data-testid="`filter-select-${type}`"
  >
    <UnnnicSelect
      ref="selectRef"
      :data-testid="`detailed-filters-select-${props.type}`"
      :label="filterLabel"
      :placeholder="t('human_support_dashboard.filters.common.placeholder')"
      :modelValue="props.modelValue"
      :options="options"
      :enableSearch="hasSearch"
      :search="searchValue"
      itemLabel="label"
      itemValue="value"
      :infiniteScroll="hasInfiniteScroll"
      :infiniteScrollDistance="10"
      :infiniteScrollCanLoadMore="canLoadMore"
      @update:model-value="handleChange"
      @update:search="handleSearchUpdate"
      @scroll-end="loadMoreData"
    />
  </section>
</template>

<script setup lang="ts">
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
  modelValue: string;
  filterParams?: {
    sectors?: string[];
    queues?: string[];
    tags?: string[];
  };
}

interface Emits {
  (_e: 'update:modelValue', _value: string): void;
  (
    _e: 'change',
    _payload: { value: string; label: string; email?: string },
  ): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useI18n();

const selectRef = useTemplateRef<any>('selectRef');
const data = ref<FilterItem[] | TicketIdItem[]>([]);
const isLoading = ref(false);
const nextPageUrl = ref<string | null>(null);
const isLoadingMore = ref(false);
const searchValue = ref('');
const searchDebounceTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const isSelecting = ref(false);

const isTicketIdFilter = computed(() => props.type === 'ticket_id');
const isContactFilter = computed(() => props.type === 'contact');
const isAgentFilter = computed(() => props.type === 'attendant');
const hasSearch = computed(
  () => isContactFilter.value || isTicketIdFilter.value || isAgentFilter.value,
);
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

const options = computed(() => {
  return Array.isArray(data.value) ? data.value.map(mapItemToOption) : [];
});

const canLoadMore = () => {
  return hasInfiniteScroll.value && !!nextPageUrl.value && !isLoadingMore.value;
};

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

const handleChange = (selectedValue: string) => {
  isSelecting.value = true;

  if (!selectedValue) {
    if (!props.modelValue) {
      isSelecting.value = false;
      return;
    }
    emit('update:modelValue', '');
    emit('change', { value: '', label: '' });
    isSelecting.value = false;
    return;
  }

  const item = findSelectedItem(data.value, selectedValue);

  if (item) {
    if (props.modelValue === item.value) {
      isSelecting.value = false;
      return;
    }

    emit('update:modelValue', item.value);
    emit('change', item);
  }

  setTimeout(() => {
    isSelecting.value = false;
  }, 100);
};

const clearSearchTimer = () => {
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value);
    searchDebounceTimer.value = null;
  }
};

const isItemLabel = (searchTerm: string): boolean => {
  if (!searchTerm || !data.value.length) return false;

  return options.value.some((option) => option.label === searchTerm);
};

const handleSearchUpdate = (newSearchValue: string) => {
  if (!hasSearch.value) return;

  const trimmedSearch = newSearchValue?.trim() || '';

  if (trimmedSearch && isItemLabel(trimmedSearch)) {
    searchValue.value = newSearchValue;
    return;
  }

  if (isSelecting.value) return;

  clearSearchTimer();
  searchValue.value = newSearchValue;

  if (!trimmedSearch) {
    loadData();
    return;
  }

  searchDebounceTimer.value = setTimeout(() => {
    loadData(trimmedSearch);
  }, 500);
};

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
      hasSearch.value,
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
    selectRef.value?.finishInfiniteScroll();
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
    selectRef.value?.finishInfiniteScroll();
  }
};

const clearData = () => {
  resetDataState();
  searchValue.value = '';
  clearSearchTimer();
  emit('update:modelValue', '');
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

<style lang="scss">
.unnnic-popover {
  background-color: $unnnic-color-background-snow;
}
</style>
