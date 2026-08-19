<template>
  <UnnnicSelect
    ref="selectRef"
    class="campaign-filter"
    data-testid="ctwa-campaign-filter"
    :modelValue="modelValue"
    :options="options"
    :placeholder="t('ctwa_dashboard.filters.campaign.placeholder')"
    itemLabel="label"
    itemValue="value"
    enableSearch
    :search="searchValue"
    clearable
    :infiniteScroll="true"
    :infiniteScrollDistance="10"
    :infiniteScrollCanLoadMore="canLoadMore"
    @update:model-value="handleChange"
    @update:search="handleSearchUpdate"
    @scroll-end="loadMoreData"
  />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

import Projects from '@/services/api/resources/projects';

defineOptions({
  name: 'CampaignFilter',
});

interface Campaign {
  uuid: string;
  name: string;
}

interface CampaignOption {
  value: string;
  label: string;
}

interface PaginatedCampaigns {
  count?: number | null;
  results: Campaign[];
}

const CAMPAIGN_FILTER_PAGE_SIZE = 10;

interface Props {
  modelValue: string;
}

interface Emits {
  (_e: 'update:modelValue', _value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useI18n();

const selectRef = useTemplateRef<{ finishInfiniteScroll: () => void }>(
  'selectRef',
);
const campaigns = ref<Campaign[]>([]);
const currentOffset = ref(0);
const totalCount = ref<number | null>(null);
const lastFetchedCount = ref(0);
const appliedSearch = ref('');
const isLoading = ref(false);
const isLoadingMore = ref(false);
const searchValue = ref('');
const searchDebounceTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const isSelecting = ref(false);

const options = computed<CampaignOption[]>(() => {
  const mapped = campaigns.value.map((campaign) => ({
    value: campaign.uuid,
    label: campaign.name,
  }));

  if (
    props.modelValue &&
    !mapped.some((option) => option.value === props.modelValue)
  ) {
    mapped.unshift({
      value: props.modelValue,
      label: props.modelValue,
    });
  }

  return mapped;
});

const hasMorePages = () => {
  if (totalCount.value !== null) {
    return campaigns.value.length < totalCount.value;
  }

  return lastFetchedCount.value === CAMPAIGN_FILTER_PAGE_SIZE;
};

const canLoadMore = () =>
  hasMorePages() && !isLoading.value && !isLoadingMore.value;

const buildQueryParams = (offset: number, search?: string) => ({
  limit: CAMPAIGN_FILTER_PAGE_SIZE,
  offset,
  ...(search ? { search } : {}),
});

const handleChange = (selectedValue: string) => {
  isSelecting.value = true;

  const nextValue = selectedValue || '';

  if (props.modelValue !== nextValue) {
    emit('update:modelValue', nextValue);
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

const isSelectedLabel = (searchTerm: string): boolean =>
  !!searchTerm && options.value.some((option) => option.label === searchTerm);

const handleSearchUpdate = (newSearchValue: string) => {
  const nextSearch = newSearchValue ?? '';
  const trimmedSearch = nextSearch.trim();

  if (trimmedSearch && isSelectedLabel(trimmedSearch)) {
    searchValue.value = nextSearch;
    return;
  }

  if (isSelecting.value) return;

  if (searchValue.value === nextSearch) return;

  clearSearchTimer();
  searchValue.value = nextSearch;

  if (trimmedSearch === appliedSearch.value) return;

  if (!trimmedSearch) {
    loadData();
    return;
  }

  searchDebounceTimer.value = setTimeout(() => {
    loadData(trimmedSearch);
  }, 500);
};

const resetPagination = () => {
  currentOffset.value = 0;
  totalCount.value = null;
  lastFetchedCount.value = 0;
};

const updatePaginationState = (response: PaginatedCampaigns | Campaign[]) => {
  if (Array.isArray(response)) {
    totalCount.value = null;
    lastFetchedCount.value = response.length;
    return;
  }

  totalCount.value = typeof response.count === 'number' ? response.count : null;
  lastFetchedCount.value = response.results?.length ?? 0;
};

const processApiResponse = (response: PaginatedCampaigns | Campaign[]) => {
  if (Array.isArray(response)) {
    campaigns.value = response;
    updatePaginationState(response);
    return;
  }

  if (response?.results && Array.isArray(response.results)) {
    campaigns.value = response.results;
    updatePaginationState(response);
    return;
  }

  campaigns.value = [];
  resetPagination();
};

const loadData = async (search?: string) => {
  appliedSearch.value = search || '';
  currentOffset.value = 0;
  isLoading.value = true;

  try {
    const response = await Projects.getMetaCampaigns(
      buildQueryParams(0, appliedSearch.value),
    );
    processApiResponse(response);
  } catch (error) {
    console.error('Error loading campaigns', error);
    campaigns.value = [];
    resetPagination();
  } finally {
    isLoading.value = false;
  }
};

const loadMoreData = async () => {
  if (!canLoadMore()) return;

  isLoadingMore.value = true;

  try {
    const nextOffset = currentOffset.value + CAMPAIGN_FILTER_PAGE_SIZE;
    const response = await Projects.getMetaCampaigns(
      buildQueryParams(nextOffset, appliedSearch.value),
    );

    if (response?.results && Array.isArray(response.results)) {
      campaigns.value = [...campaigns.value, ...response.results];
      currentOffset.value = nextOffset;
      updatePaginationState(response);
    }
  } catch (error) {
    console.error('Error loading more campaigns', error);
  } finally {
    isLoadingMore.value = false;
    selectRef.value?.finishInfiniteScroll();
  }
};

onMounted(() => {
  loadData();
});

onBeforeUnmount(() => {
  clearSearchTimer();
});
</script>

<style lang="scss" scoped>
.campaign-filter {
  width: 304px;
}
</style>
