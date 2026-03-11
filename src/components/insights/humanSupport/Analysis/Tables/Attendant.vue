<template>
  <UnnnicDataTable
    :locale="$i18n.locale"
    :isLoading="isLoading"
    :isLoadingMore="isLoadingMore"
    clickable
    fixedHeaders
    height="500px"
    :headers="formattedHeaders"
    :items="formattedItems"
    :infiniteScroll="true"
    :infiniteScrollDistance="12"
    :infiniteScrollDisabled="!hasMoreData"
    :hidePagination="true"
    data-testid="attendant-table"
    size="sm"
    :sort="currentSort"
    @update:sort="handleSort"
    @item-click="redirectItem"
    @auxclick="handleAuxClick"
    @load-more="loadMore"
  />
</template>

<script setup lang="ts">
import { UnnnicDataTable } from '@weni/unnnic-system';
import { computed, ref, watch } from 'vue';
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
  order: 'asc',
  itemKey: 'agent',
});

const formatResults = (
  results: AttendantDataResult[],
): FormattedAttendantData[] => {
  return results.map((result) => ({
    ...result,
    agent: result?.agent || result?.agent_email || '',
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
    agent: humanSupport.appliedDetailFilters.agent.value as string,
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
  sort: currentSort.value,
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
    createHeader('time_in_service', undefined, {
      isSortable: false,
    }),
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

const getRedirectPath = (item: AttendantDataResult): string | null => {
  if (!item?.link?.url) return null;
  return `${item.link.url}/insights`;
};

const redirectItem = (item: AttendantDataResult) => {
  const path = getRedirectPath(item);
  if (!path) return;

  window.parent.postMessage({ event: 'redirect', path }, '*');
};

const handleAuxClick = (event: MouseEvent) => {
  if (event.button !== 1) return;

  const target = event.target as HTMLElement;
  const row = target.closest('.unnnic-data-table__body-row--clickable');
  if (!row) return;

  const tbody = row.closest('tbody');
  if (!tbody) return;

  const clickableRows = Array.from(
    tbody.querySelectorAll('.unnnic-data-table__body-row--clickable'),
  );
  const rowIndex = clickableRows.indexOf(row);
  if (rowIndex < 0 || rowIndex >= formattedItems.value.length) return;

  const item = formattedItems.value[rowIndex];
  const path = getRedirectPath(item as AttendantDataResult);
  if (!path) return;

  event.preventDefault();
  window.parent.postMessage({ event: 'redirect', path, newTab: true }, '*');
};

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
  { immediate: true },
);
</script>
