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
        :agent="{ name: item.agent, email: item.agent_email }"
        containerCenter
        @request-data="loadData"
      />
    </template>
  </UnnnicDataTable>
</template>

<script setup lang="ts">
import { UnnnicDataTable } from '@weni/unnnic-system';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { AttendantDataResult } from '@/services/api/resources/humanSupport/detailedMonitoring/attendant';
import service from '@/services/api/resources/humanSupport/detailedMonitoring/attendant';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import DisconnectAgent from '@/components/DisconnectAgent.vue';

const { t } = useI18n();

const isLoading = ref(false);
const humanSupportMonitoring = useHumanSupportMonitoring();

const page = ref(1);
const pageInterval = ref(8);
const pageTotal = ref(0);

const currentSort = ref<{ header: string; order: string }>({
  header: 'status',
  order: 'desc',
});

const formattedItems = ref<AttendantDataResult[]>([]);

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
      formattedItems.value = data.results;
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
  console.log('attendant-table mounted');
  loadData();
});

onUnmounted(() => {
  console.log('attendant-table unmounted');
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
</script>
