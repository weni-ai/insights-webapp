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
    data-testid="attendant-table"
    size="sm"
    :sort="currentSort"
    @update:sort="handleSort"
    @item-click="redirectItem"
    @item-click:middle="redirectItemNewTab"
    @load-more="loadMore"
  >
    <template #body-action="{ item }">
      <DisconnectAgent
        :agent="{ name: item?.agent, email: item?.agent_email }"
        containerCenter
        :disabled="['offline'].includes(item?.status)"
        @request-data="resetAndLoadData"
      />
    </template>
    <template #body-status="{ item }">
      <AgentStatus
        :status="item.status"
        :label="getStatusLabel(item.status, item?.status_label)"
      />
    </template>
    <template #body-agent="{ item }">
      <DynamicCellText
        :text="item.agent"
        :isDeleted="item.agent_is_deleted"
        :tooltipText="
          $t('human_support_dashboard.deleted_tooltips.representative')
        "
      />
    </template>
  </UnnnicDataTable>
</template>

<script setup lang="ts">
import { UnnnicDataTable } from '@weni/unnnic-system';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { watchDebounced } from '@vueuse/core';
import service, {
  type AttendantDataResult,
} from '@/services/api/resources/humanSupport/monitoring/detailedMonitoring/attendant';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import DisconnectAgent from '@/components/DisconnectAgent.vue';
import AgentStatus from '@/components/insights/widgets/HumanServiceAgentsTable/AgentStatus.vue';
import DynamicCellText from '../../Common/DynamicCellText.vue';
import { formatSecondsToTime } from '@/utils/time';
import { useInfiniteScrollTable } from '@/composables/useInfiniteScrollTable';
import { storeToRefs } from 'pinia';
import { openNewTabLink } from '@/utils/redirect';

defineOptions({
  name: 'AttendantTable',
});

type FormattedAttendantData = Omit<
  AttendantDataResult,
  | 'agent'
  | 'status'
  | 'average_first_response_time'
  | 'average_response_time'
  | 'average_duration'
  | 'time_in_service'
> & {
  agent: string | null;
  agent_email: string;
  agent_is_deleted: boolean;
  status: string;
  status_label: string;
  average_first_response_time: string;
  average_response_time: string;
  average_duration: string;
  time_in_service: string;
};

const { t } = useI18n();
const humanSupportMonitoring = useHumanSupportMonitoring();
const { isSilentRefresh } = storeToRefs(humanSupportMonitoring);
const humanSupport = useHumanSupport();

const baseTranslationKey =
  'human_support_dashboard.detailed_monitoring.attendant';

const currentSort = ref<{ header: string; itemKey: string; order: string }>({
  header: t(`${baseTranslationKey}.status`),
  order: 'asc',
  itemKey: 'status',
});

const formatResults = (
  results: AttendantDataResult[],
): FormattedAttendantData[] => {
  return results.map((result) => ({
    ...result,
    agent: result?.agent ? formatAgentName(result.agent) : null,
    agent_email: result?.agent?.email || '',
    agent_is_deleted: result?.agent?.is_deleted === true,
    status: result?.status?.status || '',
    status_label: result?.status?.label || '',
    average_first_response_time: formatSecondsToTime(
      result?.average_first_response_time,
    ),
    average_response_time: formatSecondsToTime(result?.average_response_time),
    average_duration: formatSecondsToTime(result?.average_duration),
    time_in_service: formatSecondsToTime(result?.time_in_service),
  }));
};

const formatAgentName = (agent: { name: string; email: string }) => {
  return agent?.name?.trim().length > 0 ? agent?.name : agent?.email || '';
};

const fetchData = async (page: number, pageSize: number, ordering: string) => {
  const offset = (page - 1) * pageSize;

  const statusFilter = humanSupport.appliedDetailFilters.status
    .value as string[];

  const onlineOnfflineStatus = statusFilter?.filter(
    (status) => status === 'online' || status === 'offline',
  );

  const customStatusFilter = statusFilter?.filter(
    (status) => status !== 'online' && status !== 'offline',
  );

  return await service.getDetailedMonitoringAttendant({
    ordering,
    limit: pageSize,
    offset,
    agent: humanSupport.appliedDetailFilters.agent.value as string,
    status: onlineOnfflineStatus,
    custom_status: customStatusFilter,
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

const isLoadingVisible = computed(() => {
  return isLoading.value && !isSilentRefresh.value;
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
    createHeader('status'),
    createHeader('agent'),
    createHeader('ongoing'),
    createHeader('finished'),
    createHeader('average_first_response_time'),
    createHeader('average_response_time'),
    createHeader('average_duration'),
    createHeader('time_in_service', undefined, {
      isSortable: false,
    }),
    createHeader('action', undefined, {
      isSortable: false,
      size: 0.5,
      align: 'center',
    }),
  ];
});

const getStatusLabel = (status: string, statusLabel?: string) => {
  if (status === 'custom') {
    return statusLabel || status;
  }
  return status;
};

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

const redirectItemNewTab = (item: AttendantDataResult) => {
  if (!item?.link?.url) return;
  openNewTabLink(item.link.url, { concatInsights: true });
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

watchDebounced(
  () => humanSupport.appliedDetailFilters.status,
  async () => {
    await resetAndLoadData(currentSort.value);
  },
  { deep: true, debounce: 700 },
);

watch(
  [
    currentSort,
    () => humanSupport.appliedDetailFilters.agent,
    () => humanSupport.appliedFilters,
  ],
  () => {
    loadDataSafely(currentSort.value);
  },
  { immediate: true, deep: true },
);

watch(
  () => humanSupportMonitoring.refreshDataMonitoring,
  (newValue) => {
    if (newValue && humanSupportMonitoring.activeDetailedTab === 'attendant') {
      loadDataSafely(currentSort.value);
    }
  },
);
</script>
