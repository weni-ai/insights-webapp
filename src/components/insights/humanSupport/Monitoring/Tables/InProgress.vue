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
    data-testid="in-progress-table"
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
import { InProgressDataResult } from '@/services/api/resources/humanSupport/monitoring/detailedMonitoring/inProgress';
import service from '@/services/api/resources/humanSupport/monitoring/detailedMonitoring/inProgress';
import { useI18n } from 'vue-i18n';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { formatSecondsToTime } from '@/utils/time';
import { useInfiniteScrollTable } from '@/composables/useInfiniteScrollTable';

type FormattedInProgressData = Omit<
  InProgressDataResult,
  'duration' | 'awaiting_time' | 'first_response_time'
> & {
  duration: string;
  awaiting_time: string;
  first_response_time: string;
};

const { t } = useI18n();
const humanSupportMonitoring = useHumanSupportMonitoring();
const humanSupport = useHumanSupport();

const baseTranslationKey =
  'human_support_dashboard.detailed_monitoring.in_progress';

const currentSort = ref<{ header: string; itemKey: string; order: string }>({
  header: t(`${baseTranslationKey}.duration`),
  order: 'desc',
  itemKey: 'duration',
});

const formatResults = (
  results: InProgressDataResult[],
): FormattedInProgressData[] => {
  return results.map((result) => ({
    ...result,
    duration: formatSecondsToTime(result?.duration),
    awaiting_time: formatSecondsToTime(result?.awaiting_time),
    first_response_time: formatSecondsToTime(result?.first_response_time),
  }));
};

const fetchData = async (page: number, pageSize: number, ordering: string) => {
  const offset = (page - 1) * pageSize;
  return await service.getDetailedMonitoringInProgress({
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
} = useInfiniteScrollTable<InProgressDataResult, FormattedInProgressData>({
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
    createHeader('duration'),
    createHeader('awaiting_time'),
    createHeader('first_response_time'),
    createHeader('agent', 'attendant'),
    createHeader('sector'),
    createHeader('queue'),
    createHeader('contact'),
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

const redirectItem = (item: InProgressDataResult) => {
  if (!item?.link?.url) return;
  const path = `${item.link?.url}/insights`;
  window.parent.postMessage({ event: 'redirect', path }, '*');
};

onMounted(() => {
  resetAndLoadData(currentSort.value);
});

watch(
  [currentSort, () => humanSupport.appliedFilters],
  () => {
    resetAndLoadData(currentSort.value);
  },
  { flush: 'post' },
);

watch(
  () => humanSupportMonitoring.refreshDataMonitoring,
  (newValue) => {
    if (
      newValue &&
      humanSupportMonitoring.activeDetailedTab === 'in_progress'
    ) {
      resetAndLoadData(currentSort.value);
    }
  },
);
</script>
