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
  />
</template>

<script setup lang="ts">
import { UnnnicDataTable } from '@weni/unnnic-system';
import { computed, onMounted, ref, watch } from 'vue';
import {
  PausesData,
  PausesDataResult,
} from '@/services/api/resources/humanSupport/detailedMonitoring/pauses';
import getDetailedMonitoringPausesService from '@/services/api/resources/humanSupport/detailedMonitoring/pauses';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const isLoading = ref(false);

const page = ref(1);
const pageInterval = ref(12);
const pageTotal = ref(0);

const currentSort = ref<{ field: string; order: string }>({
  field: 'agent',
  order: 'asc',
});

const apiData = ref<PausesData | null>(null);
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
      size: 0.8,
    },
    {
      title: t('human_support_dashboard.detailed_monitoring.pauses.agent'),
      itemKey: 'agent',
      isSortable: true,
      size: 1,
    },
    {
      title: t('human_support_dashboard.detailed_monitoring.pauses.opened'),
      itemKey: 'opened',
      isSortable: true,
      size: 0.6,
    },
    {
      title: t('human_support_dashboard.detailed_monitoring.pauses.closed'),
      itemKey: 'closed',
      isSortable: true,
      size: 0.6,
    },
  ];

  const dynamicHeaders = customStatusTypes.value.map((statusType) => ({
    title: statusType,
    itemKey: statusType,
    isSortable: true,
    size: 0.8,
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
      agent: item.agent,
      opened: item.opened,
      closed: item.closed,
      ...customStatusObj,
    };
  });
});

const handleSort = (sort: { field: string; order: string }) => {
  currentSort.value = sort;
};

const handlePageChange = (newPage: number) => {
  page.value = newPage;
  loadData();
};

const loadData = async () => {
  try {
    isLoading.value = true;

    const offset = (page.value - 1) * pageInterval.value;
    const ordering =
      currentSort.value.order === 'desc'
        ? `-${currentSort.value.field}`
        : currentSort.value.field;

    const data =
      await getDetailedMonitoringPausesService.getDetailedMonitoringPauses({
        ordering,
        limit: pageInterval.value,
        offset,
      });

    apiData.value = {
      next: '',
      previous: '',
      count: 0,
      results: data.results,
    };

    if (apiData.value) {
      rawItems.value = apiData.value.results;
      pageTotal.value = apiData.value.count;

      console.log(
        `Loaded ${apiData.value.results.length} items from total of ${apiData.value.count}`,
      );
      console.log(
        `Page ${page.value}, has next: ${!!apiData.value.next}, has previous: ${!!apiData.value.previous}`,
      );
      console.log('Custom status types found:', customStatusTypes.value);
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
</script>
