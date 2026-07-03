<template>
  <UnnnicDataTable
    :locale="$i18n.locale"
    :isLoading="isLoadingVisible"
    :isLoadingMore="isLoadingMore"
    clickable
    fixedHeaders
    height="500px"
    :headers="formattedHeaders"
    :items="tableItems"
    :infiniteScroll="true"
    :infiniteScrollDistance="12"
    :infiniteScrollDisabled="!hasMoreData"
    :hidePagination="true"
    data-testid="in-awaiting-table"
    size="sm"
    :sort="currentSort"
    @update:sort="handleSort"
    @item-click="redirectItem"
    @item-click:middle="redirectItemNewTab"
    @load-more="loadMore"
  >
    <template #body-awaiting_time="{ item }">
      <TableRowAlert
        v-if="item.rowAlert"
        :scheme="item.rowAlert.scheme"
        :text="item.rowAlert.text"
      >
        {{ item.awaiting_time }}
      </TableRowAlert>
      <template v-else>{{ item.awaiting_time }}</template>
    </template>
  </UnnnicDataTable>
</template>

<script setup lang="ts">
import { UnnnicDataTable } from '@weni/unnnic-system';
import { computed, ref, watch } from 'vue';
import service from '@/services/api/resources/humanSupport/monitoring/detailedMonitoring/inAwaiting';
import { InAwaitingDataResult } from '@/services/api/resources/humanSupport/monitoring/detailedMonitoring/inAwaiting';
import { useI18n } from 'vue-i18n';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { formatSecondsToTime } from '@/utils/time';
import { useInfiniteScrollTable } from '@/composables/useInfiniteScrollTable';
import { useLazyData } from '@/composables/useLazyData';
import { useTableRowAlert } from '@/composables/useTableRowAlert';
import type { RowAlert } from '@/composables/useTableRowAlert';
import { useFeatureFlag } from '@/store/modules/featureFlag';
import { storeToRefs } from 'pinia';
import { openNewTabLink } from '@/utils/redirect';

import TableRowAlert from '../OperationalAlerts/TableRowAlert.vue';

type FormattedInAwaitingData = Omit<InAwaitingDataResult, 'awaiting_time'> & {
  awaiting_time: string;
  awaitingTimeRaw: number;
};

type TableInAwaitingItem = FormattedInAwaitingData & {
  rowAlert: RowAlert | null;
};

const featureFlagStore = useFeatureFlag();
const { isFeatureFlagEnabled } = featureFlagStore;
const { getRowAlert } = useTableRowAlert();

const resolveRowAlert = (item: InAwaitingDataResult): RowAlert | null => {
  if (!isFeatureFlagEnabled('insightsOperationalAlerts')) return null;

  return getRowAlert([
    {
      metric: 'waiting_time',
      scheme: 'red',
      goal: item.waiting_time_goal,
    },
  ]);
};

defineExpose({ getItemAlert: resolveRowAlert });

const { t } = useI18n();
const humanSupportMonitoring = useHumanSupportMonitoring();
const { isSilentRefresh } = storeToRefs(humanSupportMonitoring);
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
    awaitingTimeRaw: result?.awaiting_time,
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
  sort: currentSort.value,
});

const tableItems = computed((): TableInAwaitingItem[] => {
  featureFlagStore.activeFeatures;

  return formattedItems.value.map((item) => ({
    ...item,
    rowAlert: resolveRowAlert({
      ...item,
      awaiting_time: item.awaitingTimeRaw,
    }),
  }));
});

const isLoadingVisible = computed(() => {
  return isLoading.value && !isSilentRefresh.value;
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

const redirectItemNewTab = (item: InAwaitingDataResult) => {
  if (!item?.link?.url) return;
  openNewTabLink(item.link.url);
};

const redirectItem = (item: InAwaitingDataResult) => {
  if (!item?.link?.url) return;
  window.parent.postMessage({ event: 'redirect', path: item?.link?.url }, '*');
};

const isRequestPending = ref(false);

const loadDataSafely = async (sortValue: typeof currentSort.value) => {
  if (isRequestPending.value) return;

  try {
    isRequestPending.value = true;
    await resetAndLoadData(sortValue);
  } finally {
    isRequestPending.value = false;
  }
};

const { hasBeenVisible } = useLazyData({
  load: () => loadDataSafely(currentSort.value),
});

watch(
  [
    currentSort,
    () => humanSupport.appliedFilters,
    () => humanSupport.appliedDetailFilters.contactInput,
  ],
  () => {
    if (!hasBeenVisible.value) return;
    loadDataSafely(currentSort.value);
  },
  { deep: true },
);

watch(
  () => humanSupportMonitoring.refreshDataMonitoring,
  (newValue) => {
    if (!hasBeenVisible.value) return;
    if (
      newValue &&
      humanSupportMonitoring.activeDetailedTab === 'in_awaiting'
    ) {
      loadDataSafely(currentSort.value);
    }
  },
);
</script>

<style lang="scss" scoped>
:deep(.unnnic-data-table__body-row:has(.row-alert--red)) {
  background-color: $unnnic-color-bg-red-plain;
}

:deep(.unnnic-data-table__body-row--clickable:has(.row-alert--red):hover) {
  background-color: $unnnic-color-bg-red-plain;
}
</style>
