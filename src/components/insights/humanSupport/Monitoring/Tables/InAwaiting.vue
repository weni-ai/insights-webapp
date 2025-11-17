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
    data-testid="in-awaiting-table"
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
import service from '@/services/api/resources/humanSupport/monitoring/detailedMonitoring/inAwaiting';
import { InAwaitingDataResult } from '@/services/api/resources/humanSupport/monitoring/detailedMonitoring/inAwaiting';
import { useI18n } from 'vue-i18n';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { formatSecondsToTime } from '@/utils/time';
import { useInfiniteScrollTable } from '@/composables/useInfiniteScrollTable';

type FormattedInAwaitingData = Omit<InAwaitingDataResult, 'awaiting_time'> & {
  awaiting_time: string;
};

const { t } = useI18n();
const humanSupportMonitoring = useHumanSupportMonitoring();
const humanSupport = useHumanSupport();

const baseTranslationKey =
  'human_support_dashboard.detailed_monitoring.in_awaiting';

const currentSort = ref<{ header: string; itemKey: string; order: string }>({
  header: t(`${baseTranslationKey}.awaiting_time`),
  order: 'desc',
  itemKey: 'awaiting_time',
});

const formatResults = (
  results: InAwaitingDataResult[],
): FormattedInAwaitingData[] => {
  return results.map((result) => ({
    ...result,
    awaiting_time: formatSecondsToTime(result?.awaiting_time),
  }));
};

const fetchData = async (page: number, pageSize: number, ordering: string) => {
  const offset = (page - 1) * pageSize;
  return await service.getDetailedMonitoringInAwaiting({
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
} = useInfiniteScrollTable<InAwaitingDataResult, FormattedInAwaitingData>({
  fetchData,
  formatResults,
});

const formattedHeaders = computed(() => {
  const createHeader = (itemKey: string) => ({
    title: t(`${baseTranslationKey}.${itemKey}`),
    itemKey,
    isSortable: true,
  });

  return [
    createHeader('awaiting_time'),
    createHeader('contact'),
    createHeader('sector'),
    createHeader('queue'),
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

const redirectItem = (item: InAwaitingDataResult) => {
  if (!item?.link?.url) return;
  window.parent.postMessage({ event: 'redirect', path: item?.link?.url }, '*');
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
      humanSupportMonitoring.activeDetailedTab === 'in_awaiting'
    ) {
      resetAndLoadData(currentSort.value);
    }
  },
);
</script>
