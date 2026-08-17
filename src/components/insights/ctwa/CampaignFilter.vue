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
    infiniteScroll
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
  next?: string | null;
  previous?: string | null;
  results: Campaign[];
}

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
const nextPageUrl = ref<string | null>(null);
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

const canLoadMore = () => !!nextPageUrl.value && !isLoadingMore.value;

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
  const trimmedSearch = newSearchValue?.trim() || '';

  if (trimmedSearch && isSelectedLabel(trimmedSearch)) {
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

const processApiResponse = (response: PaginatedCampaigns | Campaign[]) => {
  if (Array.isArray(response)) {
    campaigns.value = response;
    nextPageUrl.value = null;
    return;
  }

  if (response?.results && Array.isArray(response.results)) {
    campaigns.value = response.results;
    nextPageUrl.value = response.next || null;
    return;
  }

  campaigns.value = [];
  nextPageUrl.value = null;
};

const loadData = async (search?: string) => {
  try {
    const response = await Projects.getMetaCampaigns(search ? { search } : {});
    processApiResponse(response);
  } catch (error) {
    console.error('Error loading campaigns', error);
    campaigns.value = [];
    nextPageUrl.value = null;
  }
};

const loadMoreData = async () => {
  if (!canLoadMore()) {
    selectRef.value?.finishInfiniteScroll();
    return;
  }

  try {
    isLoadingMore.value = true;
    const response = await Projects.getProjectSourcePaginated(
      nextPageUrl.value,
    );

    if (response?.results && Array.isArray(response.results)) {
      campaigns.value = [...campaigns.value, ...response.results];
      nextPageUrl.value = response.next || null;
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
