<template>
  <UnnnicDataTable
    :locale="$i18n.locale"
    :isLoading="isLoading"
    clickable
    fixedHeaders
    height="100%"
    :headers="formattedHeaders"
    :items="formattedItems"
    :page="page"
    :pageTotal="pageTotal"
    :pageInterval="pageInterval"
    data-testid="attendant-table"
    size="sm"
    :sort="currentSort"
    @update:sort="handleSort"
    @update:page="handlePageChange"
    @item-click="redirectItem"
  >
    <template #body-action="{ item }">
      <DisconnectAgent
        :agent="{ name: item?.agent, email: item?.agent_email }"
        containerCenter
        :disabled="['offline'].includes(item?.status)"
        @request-data="loadData"
      />
    </template>
    <template #body-status="{ item }">
      <AgentStatus
        :status="handleStatus(item.status)"
        :label="item.status"
      />
    </template>
  </UnnnicDataTable>
</template>

<script setup lang="ts">
import { UnnnicDataTable } from '@weni/unnnic-system';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { AttendantDataResult } from '@/services/api/resources/humanSupport/detailedMonitoring/attendant';
import service from '@/services/api/resources/humanSupport/detailedMonitoring/attendant';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import DisconnectAgent from '@/components/DisconnectAgent.vue';
import AgentStatus from '@/components/insights/widgets/HumanServiceAgentsTable/AgentStatus.vue';
import { formatSecondsToTime } from '@/utils/time';

type FormattedAttendantData = Omit<
  AttendantDataResult,
  | 'average_girst_response_time'
  | 'average_response_time'
  | 'average_duration'
  | 'time_in_service'
> & {
  average_girst_response_time: string;
  average_response_time: string;
  average_duration: string;
  time_in_service: string;
};

const { t } = useI18n();

const isLoading = ref(false);
const humanSupportMonitoring = useHumanSupportMonitoring();

const page = ref(1);
const pageInterval = ref(15);
const pageTotal = ref(0);

const currentSort = ref<{ header: string; order: string }>({
  header: 'status',
  order: 'desc',
});

const formattedItems = ref<FormattedAttendantData[]>([]);

const formattedHeaders = computed(() => [
  {
    title: t('human_support_dashboard.detailed_monitoring.attendant.status'),
    itemKey: 'status',
    isSortable: true,
  },
  {
    title: t('human_support_dashboard.detailed_monitoring.attendant.agent'),
    itemKey: 'agent',
    isSortable: true,
  },
  {
    title: t('human_support_dashboard.detailed_monitoring.attendant.ongoing'),
    itemKey: 'opened',
    isSortable: true,
  },
  {
    title: t('human_support_dashboard.detailed_monitoring.attendant.finished'),
    itemKey: 'closed',
    isSortable: true,
  },
  {
    title: t(
      'human_support_dashboard.detailed_monitoring.attendant.average_girst_response_time',
    ),
    itemKey: 'average_girst_response_time',
    isSortable: true,
  },
  {
    title: t(
      'human_support_dashboard.detailed_monitoring.attendant.average_response_time',
    ),
    itemKey: 'average_response_time',
    isSortable: true,
  },
  {
    title: t(
      'human_support_dashboard.detailed_monitoring.attendant.average_duration',
    ),
    itemKey: 'average_duration',
    isSortable: true,
  },
  {
    title: t(
      'human_support_dashboard.detailed_monitoring.attendant.time_in_service',
    ),
    itemKey: 'time_in_service',
    isSortable: true,
  },
  {
    title: t('human_support_dashboard.detailed_monitoring.attendant.action'),
    itemKey: 'action',
    isSortable: false,
    size: 0.5,
    align: 'center',
  },
]);

const handleSort = (sort: { header: string; order: string }) => {
  currentSort.value = sort;
};

const handlePageChange = (newPage: number) => {
  page.value = newPage;
  loadData();
};

/* TODO: Remove handleStatus after the API is updated */
const handleStatus = (status: string) => {
  const statusLabelMapper = {
    online: 'green',
    offline: 'gray',
    custom: 'orange',
  };

  return statusLabelMapper[status];
};

const redirectItem = (item: AttendantDataResult) => {
  if (!item?.link?.url) return;

  const path = `${item.link?.url}/insights`;
  window.parent.postMessage(
    {
      event: 'redirect',
      path,
    },
    '*',
  );
};

const loadData = async () => {
  try {
    isLoading.value = true;
    const data = await service.getDetailedMonitoringAttendant({
      ordering:
        currentSort.value.order === 'desc'
          ? `-${currentSort.value.header}`
          : currentSort.value.header,
      limit: pageInterval.value,
      offset: (page.value - 1) * pageInterval.value,
      agent: humanSupportMonitoring.appliedAgentFilter.value,
    });

    if (data.results) {
      formattedItems.value = data.results.map((result) => ({
        ...result,
        average_girst_response_time: formatSecondsToTime(
          result?.average_girst_response_time,
        ),
        average_response_time: formatSecondsToTime(
          result?.average_response_time,
        ),
        average_duration: formatSecondsToTime(result?.average_duration),
        time_in_service: formatSecondsToTime(result?.time_in_service),
      }));
      pageTotal.value = data.count;
    } else {
      formattedItems.value = [];
      pageTotal.value = 0;
    }
    pageTotal.value = data.count;
  } catch (error) {
    console.error('Error loading attendant data:', error);
    formattedItems.value = [];
    pageTotal.value = 0;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadData();
});

watch(currentSort, () => {
  page.value = 1;
  loadData();
});

watch(
  () => humanSupportMonitoring.appliedAgentFilter,
  () => {
    page.value = 1;
    loadData();
  },
  { flush: 'post' },
);

watch(
  () => humanSupportMonitoring.appliedFilters,
  () => {
    page.value = 1;
    loadData();
  },
  { flush: 'post' },
);

watch(
  () => humanSupportMonitoring.refreshDetailedTabData,
  (newValue) => {
    if (newValue && humanSupportMonitoring.activeDetailedTab === 'attendant') {
      loadData();
    }
  },
);
</script>
