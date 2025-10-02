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
    data-testid="pauses-table"
    size="sm"
    :sort="currentSort"
    @update:sort="handleSort"
    @update:page="handlePageChange"
    @item-click="redirectItem"
  />
</template>

<script setup lang="ts">
import { UnnnicDataTable } from '@weni/unnnic-system';
import { computed, onMounted, ref, watch } from 'vue';
import { PausesDataResult } from '@/services/api/resources/humanSupport/detailedMonitoring/pauses';
import getDetailedMonitoringPausesService from '@/services/api/resources/humanSupport/detailedMonitoring/pauses';
import { useI18n } from 'vue-i18n';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';

const { t } = useI18n();

const isLoading = ref(false);
const humanSupportMonitoring = useHumanSupportMonitoring();

const page = ref(1);
const pageInterval = ref(12);
const pageTotal = ref(0);

const currentSort = ref<{ header: string; order: string }>({
  header: 'agent',
  order: 'asc',
});

const rawItems = ref<PausesDataResult[]>([]);

const customStatusTypes = computed(() => {
  if (!rawItems.value.length) return [];

  const allStatusTypes = new Set<string>();

  rawItems.value.forEach((item) => {
    item.custom_status?.forEach((status) => {
      allStatusTypes.add(status.status_type);
    });
  });

  return Array.from(allStatusTypes).sort();
});

const formattedHeaders = computed(() => {
  const baseHeaders = [
    {
      title: t('human_support_dashboard.detailed_monitoring.pauses.status'),
      itemKey: 'status',
      isSortable: true,
      size: 0.5,
    },
    {
      title: t('human_support_dashboard.detailed_monitoring.pauses.agent'),
      itemKey: 'agent',
      isSortable: true,
      size: 0.8,
    },
    {
      title: t('human_support_dashboard.detailed_monitoring.pauses.opened'),
      itemKey: 'opened',
      isSortable: true,
      size: 0.4,
    },
    {
      title: t('human_support_dashboard.detailed_monitoring.pauses.closed'),
      itemKey: 'closed',
      isSortable: true,
      size: 0.4,
    },
  ];

  const dynamicHeaders = customStatusTypes.value.map((statusType) => ({
    title: statusType,
    itemKey: statusType,
    isSortable: true,
    size: 0.5,
  }));

  return [...baseHeaders, ...dynamicHeaders];
});

const formattedItems = computed(() => {
  return rawItems.value.map((item) => {
    const customStatusObj: Record<string, number> = {};

    item.custom_status?.forEach((status) => {
      customStatusObj[status.status_type] = status.break_time;
    });

    return {
      status: item.status.label || item.status.status,
      link: item.link,
      agent: item.agent,
      opened: item.opened,
      closed: item.closed,
      ...customStatusObj,
    };
  });
});

const handleSort = (sort: { header: string; order: string }) => {
  currentSort.value = sort;
};

const handlePageChange = (newPage: number) => {
  page.value = newPage;
  loadData();
};

const redirectItem = (item: PausesDataResult) => {
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

    const offset = (page.value - 1) * pageInterval.value;
    const ordering =
      currentSort.value.order === 'desc'
        ? `-${currentSort.value.header}`
        : currentSort.value.header;

    const data =
      await getDetailedMonitoringPausesService.getDetailedMonitoringPauses({
        ordering,
        limit: pageInterval.value,
        offset,
        agent: humanSupportMonitoring.appliedAgentFilter.value,
      });

    if (data.results) {
      rawItems.value = data.results;
      pageTotal.value = data.count;
    } else {
      rawItems.value = [];
      pageTotal.value = 0;
    }
  } catch (error) {
    console.error('Error loading pauses data:', error);
    rawItems.value = [];
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
</script>
