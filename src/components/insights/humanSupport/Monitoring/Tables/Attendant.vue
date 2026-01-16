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
  </UnnnicDataTable>
</template>

<script setup lang="ts">
import { UnnnicDataTable } from '@weni/unnnic-system';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { AttendantDataResult } from '@/services/api/resources/humanSupport/monitoring/detailedMonitoring/attendant';
import service from '@/services/api/resources/humanSupport/monitoring/detailedMonitoring/attendant';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import DisconnectAgent from '@/components/DisconnectAgent.vue';
import AgentStatus from '@/components/insights/widgets/HumanServiceAgentsTable/AgentStatus.vue';
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
const humanSupportMonitoring = useHumanSupportMonitoring();
const humanSupport = useHumanSupport();

const baseTranslationKey =
  'human_support_dashboard.detailed_monitoring.attendant';

const currentSort = ref<{ header: string; itemKey: string; order: string }>({
  header: t(`${baseTranslationKey}.status`),
  order: 'desc',
  itemKey: 'status',
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
  return await service.getDetailedMonitoringAttendant({
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
    createHeader('status'),
    createHeader('agent'),
    createHeader('ongoing'),
    createHeader('finished'),
    createHeader('average_first_response_time'),
    createHeader('average_response_time'),
    createHeader('average_duration'),
    createHeader('time_in_service'),
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

onMounted(() => {
  resetAndLoadData(currentSort.value);
});

watch(
  [
    currentSort,
    () => humanSupport.appliedDetailFilters.agent,
    () => humanSupport.appliedFilters,
  ],
  () => {
    resetAndLoadData(currentSort.value);
  },
  { flush: 'post' },
);

watch(
  () => humanSupportMonitoring.refreshDataMonitoring,
  (newValue) => {
    if (newValue && humanSupportMonitoring.activeDetailedTab === 'attendant') {
      resetAndLoadData(currentSort.value);
    }
  },
);
</script>
