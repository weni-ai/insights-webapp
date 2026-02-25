<template>
  <UnnnicDataTable
    :locale="$i18n.locale"
    :isLoading="isLoading"
    :isLoadingMore="isLoadingMore"
    clickable
    fixedHeaders
    height="500px"
    :headers="formattedHeaders"
    :items="widgetData"
    :infiniteScroll="true"
    :infiniteScrollDistance="12"
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
import { computed, ref, watch } from 'vue';
import { FinishedDataResult } from '@/services/api/resources/humanSupport/analysis/detailedAnalysis/finished';
import service from '@/services/api/resources/humanSupport/analysis/detailedAnalysis/finished';
import { useI18n } from 'vue-i18n';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { useProject } from '@/store/modules/project';
import { formatSecondsToTime } from '@/utils/time';
import { useInfiniteScrollTable } from '@/composables/useInfiniteScrollTable';
import { analysisDetailedAnalysisFinishedMock } from '../mocks';

type FormattedFinishedData = Omit<
  FinishedDataResult,
  'duration' | 'awaiting_time' | 'first_response_time' | 'response_time'
> & {
  duration: string;
  awaiting_time: string;
  first_response_time: string;
  response_time: string;
};

defineOptions({
  name: 'FinishedTable',
});

const { t } = useI18n();
const humanSupport = useHumanSupport();
const projectStore = useProject();

const baseTranslationKey = 'human_support_dashboard.columns.common';

const currentSort = ref<{ header: string; itemKey: string; order: string }>({
  header: t(`${baseTranslationKey}.agent`),
  order: 'asc',
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

const widgetData = computed(() => {
  if (!projectStore.hasChatsSectors) {
    return formatResults(analysisDetailedAnalysisFinishedMock);
  }
  return formattedItems.value;
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
  let url = item.link.url;

  if (url.startsWith('chats:/')) {
    url = url.replace('chats:/', 'chats:');
  }

  window.parent.postMessage({ event: 'redirect', path: url }, '*');
};

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
  { immediate: true },
);
</script>
