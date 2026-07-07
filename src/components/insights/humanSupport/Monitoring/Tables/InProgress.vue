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
    data-testid="in-progress-table"
    size="sm"
    :sort="currentSort"
    @update:sort="handleSort"
    @item-click="redirectItem"
    @item-click:middle="redirectItemNewTab"
    @load-more="loadMore"
  >
    <template #body-first_response_time="{ item }">
      <p
        v-if="item.first_response_time === null"
        class="italic-text"
      >
        {{ $t('human_support_dashboard.common.no_response') }}
      </p>

      <template v-else>
        {{ formatSecondsToTime(item.first_response_time) }}
      </template>
    </template>
    <template #body-duration="{ item }">
      <section class="in-progress-duration">
        <span class="in-progress-duration__value">
          <TableRowAlert
            v-if="item.rowAlert"
            :scheme="item.rowAlert.scheme"
            :text="item.rowAlert.text"
            fullRow
          >
            {{ formatSecondsToTime(item.duration) }}
          </TableRowAlert>
          <template v-else>{{ formatSecondsToTime(item.duration) }}</template>
        </span>
        <UnnnicToolTip
          v-if="item.pending_response"
          enabled
          :text="$t(`${baseTranslationKey}.pending_response_tooltip`)"
          side="right"
          data-testid="in-progress-pending-response-tooltip"
        >
          <UnnnicIcon
            icon="reply"
            size="sm"
            scheme="fg-info"
            data-testid="in-progress-pending-response-icon"
            @click.stop
          />
        </UnnnicToolTip>
      </section>
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
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { useProject } from '@/store/modules/project';

import { useInfiniteScrollTable } from '@/composables/useInfiniteScrollTable';
import { useLazyData } from '@/composables/useLazyData';
import { useTableRowAlert } from '@/composables/useTableRowAlert';
import type { RowAlert } from '@/composables/useTableRowAlert';
import { useFeatureFlag } from '@/store/modules/featureFlag';

import { InProgressDataResult } from '@/services/api/resources/humanSupport/monitoring/detailedMonitoring/inProgress';
import service from '@/services/api/resources/humanSupport/monitoring/detailedMonitoring/inProgress';

import TableRowAlert from '../OperationalAlerts/TableRowAlert.vue';

import { monitoringDetailedMonitoringInProgressMock } from '../mocks';
import { openNewTabLink } from '@/utils/redirect';
import { formatSecondsToTime } from '@/utils/time';

type TableInProgressItem = InProgressDataResult & {
  rowAlert: RowAlert | null;
};

const { t } = useI18n();
const humanSupportMonitoring = useHumanSupportMonitoring();
const { isSilentRefresh } = storeToRefs(humanSupportMonitoring);
const humanSupport = useHumanSupport();

const projectStore = useProject();
const { hasSectorsConfigured } = storeToRefs(projectStore);

const featureFlagStore = useFeatureFlag();
const { isFeatureFlagEnabled } = featureFlagStore;
const { getRowAlert } = useTableRowAlert();

const resolveRowAlert = (item: InProgressDataResult): RowAlert | null => {
  if (!isFeatureFlagEnabled('insightsOperationalAlerts')) return null;

  return getRowAlert([
    {
      metric: 'first_response_time',
      scheme: 'orange',
      exceeded: item.goals_metrics?.first_response_time?.exceeded,
    },
    {
      metric: 'conversation_duration',
      scheme: 'yellow',
      exceeded: item.goals_metrics?.duration?.exceeded,
    },
  ]);
};

defineExpose({ getItemAlert: resolveRowAlert });

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
  formatResults: (results) => results.map((item) => ({ ...item })),
  sort: currentSort.value,
});

const tableItems = computed((): TableInProgressItem[] => {
  featureFlagStore.activeFeatures;

  const source = hasSectorsConfigured.value
    ? formattedItems.value
    : (monitoringDetailedMonitoringInProgressMock as InProgressDataResult[]);

  return source.map((item) => ({
    ...item,
    rowAlert: resolveRowAlert(item),
  }));
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

const redirectItemNewTab = (item: InProgressDataResult) => {
  if (!item?.link?.url) return;

  openNewTabLink(item.link.url, { concatInsights: true });
};

const redirectItem = (item: InProgressDataResult) => {
  if (!item?.link?.url) return;

  const url = item.link.url;
  const hasQuery = url.includes('?');

  const newPath = hasQuery ? url.replace('?', '/insights?') : `${url}/insights`;

  window.parent.postMessage({ event: 'redirect', path: newPath }, '*');
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

.in-progress-duration {
  display: flex;
  align-items: center;
  gap: $unnnic-space-1;

  &__value {
    display: inline;
  }
}
</style>
