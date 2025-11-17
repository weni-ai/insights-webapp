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
    data-testid="attendant-table"
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
import { useI18n } from 'vue-i18n';
import { AttendantDataResult } from '@/services/api/resources/humanSupport/analysis/detailedAnalysis/attendant';
import service from '@/services/api/resources/humanSupport/analysis/detailedAnalysis/attendant';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { formatSecondsToTime } from '@/utils/time';
import { useInfiniteScrollTable } from '@/composables/useInfiniteScrollTable';

type FormattedAttendantData = Omit<
  AttendantDataResult,
  | 'average_first_response_time'
  | 'average_response_time'
  | 'average_duration'
  | 'time_in_service'
> & {
  average_first_response_time: string;
  average_response_time: string;
  average_duration: string;
  time_in_service: string;
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
  results: AttendantDataResult[],
): FormattedAttendantData[] => {
  return results.map((result) => ({
    ...result,
    average_first_response_time: formatSecondsToTime(
      result?.average_first_response_time,
    ),
    average_response_time: formatSecondsToTime(result?.average_response_time),
    average_duration: formatSecondsToTime(result?.average_duration),
    time_in_service: formatSecondsToTime(result?.time_in_service),
  }));
};

const fetchData = async (page: number, pageSize: number, ordering: string) => {
  const offset = (page - 1) * pageSize;
  return await service.getDetailedAnalysisAttendantData({
    ordering,
    limit: pageSize,
    offset,
    agent: humanSupport.appliedDetailFilters.agent.value,
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
} = useInfiniteScrollTable<AttendantDataResult, FormattedAttendantData>({
  fetchData,
  formatResults,
});

const formattedHeaders = computed(() => {
  const createHeader = (
    itemKey: string,
    translationKey?: string,
    overrides = {},
  ) => ({
    title: t(`${baseTranslationKey}.${translationKey || itemKey}`),
    itemKey,
    isSortable: true,
    ...overrides,
  });

  return [
    createHeader('agent'),
    createHeader('finished', 'total_attendances'),
    createHeader('average_first_response_time'),
    createHeader('average_response_time'),
    createHeader('average_duration'),
    createHeader('time_in_service'),
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

const redirectItem = (item: AttendantDataResult) => {
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
    () => humanSupport.appliedDetailFilters.agent,
    () => humanSupport.appliedFilters,
    () => humanSupport.appliedDateRange,
  ],
  () => {
    resetAndLoadData(currentSort.value);
  },
  { flush: 'post' },
);
</script>
