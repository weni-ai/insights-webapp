<template>
  <UnnnicDataTable
    :locale="$i18n.locale"
    :isLoading="isLoading"
    :isLoadingMore="isLoadingMore"
    clickable
    fixedHeaders
    height="800px"
    :headers="formattedHeaders"
    :items="formattedItems"
    :infiniteScroll="true"
    :infiniteScrollDistance="15"
    :infiniteScrollDisabled="!hasMoreData"
    :hidePagination="true"
    data-testid="finished-table"
    size="sm"
    :sort="currentSort"
    @update:sort="handleSort"
    @item-click="redirectItem"
    @load-more="loadMore"
  />
</template>

<script setup lang="ts">
import { UnnnicDataTable } from '@weni/unnnic-system';
import { computed, onMounted, ref, watch } from 'vue';
import { FinishedDataResult } from '@/services/api/resources/humanSupport/analysis/detailedAnalysis/finished';
import service from '@/services/api/resources/humanSupport/analysis/detailedAnalysis/finished';
import { useI18n } from 'vue-i18n';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { formatSecondsToTime } from '@/utils/time';
import { useInfiniteScrollTable } from '@/composables/useInfiniteScrollTable';

type FormattedFinishedData = Omit<
  FinishedDataResult,
  'duration' | 'awaiting_time' | 'first_response_time' | 'response_time'
> & {
  duration: string;
  awaiting_time: string;
  first_response_time: string;
  response_time: string;
};

const { t } = useI18n();
const humanSupport = useHumanSupport();

const baseTranslationKey = 'human_support_dashboard.columns.common';

const currentSort = ref<{ header: string; itemKey: string; order: string }>({
  header: t(`${baseTranslationKey}.agent`),
  order: 'desc',
  itemKey: 'agent',
});

const formatResults = (
  results: FinishedDataResult[],
): FormattedFinishedData[] => {
  return results.map((result) => ({
    ...result,
    duration: formatSecondsToTime(result?.duration),
    awaiting_time: formatSecondsToTime(result?.awaiting_time),
    first_response_time: formatSecondsToTime(result?.first_response_time),
    response_time: formatSecondsToTime(result?.response_time),
  }));
};

const fetchData = async (page: number, pageSize: number, ordering: string) => {
  const offset = (page - 1) * pageSize;
  return await service.getDetailedAnalysisFinishedData({
    ordering,
    limit: pageSize,
    offset,
  });
};

const {
  isLoading,
  isLoadingMore,
  formattedItems,
  hasMoreData,
  loadMoreData,
  resetAndLoadData,
  handleSort: handleSortChange,
} = useInfiniteScrollTable<FinishedDataResult, FormattedFinishedData>({
  fetchData,
  formatResults,
});

const formattedHeaders = computed(() => {
  const createHeader = (itemKey: string, translationKey?: string) => ({
    title: t(`${baseTranslationKey}.${translationKey || itemKey}`),
    itemKey,
    isSortable: true,
  });

  return [
    createHeader('agent'),
    createHeader('sector'),
    createHeader('queue'),
    createHeader('awaiting_time'),
    createHeader('first_response_time'),
    createHeader('duration'),
    createHeader('contact'),
    createHeader('ticket_id'),
  ];
});

const handleSort = (sort: {
  header: string;
  itemKey: string;
  order: string;
}) => {
  handleSortChange(sort, currentSort);
};

const loadMore = () => {
  loadMoreData(currentSort.value);
};

const redirectItem = (item: FinishedDataResult) => {
  if (!item?.link?.url) return;
  const path = `${item.link?.url}/insights`;
  window.parent.postMessage({ event: 'redirect', path }, '*');
};

onMounted(() => {
  resetAndLoadData(currentSort.value);
});

watch(
  [
    currentSort,
    () => humanSupport.appliedFilters,
    () => humanSupport.appliedDateRange,
    () => humanSupport.appliedDetailFilters.agent,
    () => humanSupport.appliedDetailFilters.contact,
    () => humanSupport.appliedDetailFilters.ticketId,
  ],
  () => {
    resetAndLoadData(currentSort.value);
  },
  { flush: 'post' },
);
</script>
