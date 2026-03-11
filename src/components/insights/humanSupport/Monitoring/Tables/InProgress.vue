<template>
  <UnnnicDataTable
    :locale="$i18n.locale"
    :isLoading="isLoadingVisible"
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
    data-testid="in-progress-table"
    size="sm"
    :sort="currentSort"
    @update:sort="handleSort"
    @item-click="redirectItem"
    @auxclick="handleAuxClick"
    @load-more="loadMore"
  >
    <template #body-first_response_time="{ item }">
      <p
        v-if="item.first_response_time === null"
        class="italic-text"
      >
        {{ $t('human_support_dashboard.common.no_response') }}
      </p>

      <p v-else>{{ formatSecondsToTime(item.first_response_time) }}</p>
    </template>
    <template #body-duration="{ item }">
      {{ formatSecondsToTime(item.duration) }}
    </template>
    <template #body-awaiting_time="{ item }">
      {{ formatSecondsToTime(item.awaiting_time) }}
    </template>
    <template #body-agent="{ item }">
      {{ item.agent || item.agent_email }}
    </template>
  </UnnnicDataTable>
</template>

<script setup lang="ts">
import { UnnnicDataTable } from '@weni/unnnic-system';
import { computed, ref, watch } from 'vue';
import { InProgressDataResult } from '@/services/api/resources/humanSupport/monitoring/detailedMonitoring/inProgress';
import service from '@/services/api/resources/humanSupport/monitoring/detailedMonitoring/inProgress';
import { useI18n } from 'vue-i18n';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { formatSecondsToTime } from '@/utils/time';
import { useInfiniteScrollTable } from '@/composables/useInfiniteScrollTable';
import { storeToRefs } from 'pinia';

const { t } = useI18n();
const humanSupportMonitoring = useHumanSupportMonitoring();
const { isSilentRefresh } = storeToRefs(humanSupportMonitoring);
const humanSupport = useHumanSupport();

const baseTranslationKey =
  'human_support_dashboard.detailed_monitoring.in_progress';

const currentSort = ref<{ header: string; itemKey: string; order: string }>({
  header: t(`${baseTranslationKey}.duration`),
  order: 'desc',
  itemKey: 'duration',
});

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
} = useInfiniteScrollTable<InProgressDataResult, InProgressDataResult>({
  fetchData,
  formatResults: (results) => results,
  sort: currentSort.value,
});

const isLoadingVisible = computed(() => {
  return isLoading.value && !isSilentRefresh.value;
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

const getRedirectPath = (item: InProgressDataResult): string | null => {
  if (!item?.link?.url) return null;

  const url = item.link.url;
  const hasQuery = url.includes('?');

  return hasQuery ? url.replace('?', '/insights?') : `${url}/insights`;
};

const redirectItem = (item: InProgressDataResult) => {
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
  const path = getRedirectPath(item as InProgressDataResult);
  if (!path) return;

  event.preventDefault();
  window.parent.postMessage({ event: 'redirect', path, newTab: true }, '*');
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

watch(
  [
    currentSort,
    () => humanSupport.appliedFilters,
    () => humanSupport.appliedDetailFilters.contactInput,
  ],
  () => {
    loadDataSafely(currentSort.value);
  },
  { immediate: true, deep: true },
);

watch(
  () => humanSupportMonitoring.refreshDataMonitoring,
  (newValue) => {
    if (
      newValue &&
      humanSupportMonitoring.activeDetailedTab === 'in_progress'
    ) {
      loadDataSafely(currentSort.value);
    }
  },
);
</script>

<style lang="scss" scoped>
.italic-text {
  font-style: italic;
}
</style>
