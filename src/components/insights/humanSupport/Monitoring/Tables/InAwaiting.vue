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
    data-testid="in-progress-table"
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
import service from '@/services/api/resources/humanSupport/monitoring/detailedMonitoring/inAwaiting';
import { InAwaitingDataResult } from '@/services/api/resources/humanSupport/monitoring/detailedMonitoring/inAwaiting';
import { useI18n } from 'vue-i18n';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';

import { formatSecondsToTime } from '@/utils/time';

type FormattedInAwaitingData = Omit<InAwaitingDataResult, 'awaiting_time'> & {
  awaiting_time: string;
};

const { t } = useI18n();
const humanSupportMonitoring = useHumanSupportMonitoring();
const humanSupport = useHumanSupport();

const isLoading = ref(false);

const page = ref(1);
const pageInterval = ref(15);
const pageTotal = ref(0);

const baseTranslationKey =
  'human_support_dashboard.detailed_monitoring.in_awaiting';

const currentSort = ref<{ header: string; itemKey: string; order: string }>({
  header: t(`${baseTranslationKey}.awaiting_time`),
  order: 'desc',
  itemKey: 'awaiting_time',
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

const formattedItems = ref<FormattedInAwaitingData[]>([]);

const handleSort = (sort: {
  header: string;
  itemKey: string;
  order: string;
}) => {
  currentSort.value = sort;
};

const handlePageChange = (newPage: number) => {
  page.value = newPage;
  loadData();
};

const redirectItem = (item: InAwaitingDataResult) => {
  if (!item?.link?.url) return;

  window.parent.postMessage(
    {
      event: 'redirect',
      path: item?.link?.url,
    },
    '*',
  );
};

const loadData = async () => {
  try {
    isLoading.value = true;

    const ordering =
      currentSort.value.order === 'desc'
        ? `-${currentSort.value.itemKey}`
        : currentSort.value.itemKey;

    const data = await service.getDetailedMonitoringInAwaiting({
      ordering,
      limit: pageInterval.value,
      offset: (page.value - 1) * pageInterval.value,
    });

    formattedItems.value = data.results.map((result) => ({
      ...result,
      awaiting_time: formatSecondsToTime(result?.awaiting_time),
    }));
    pageTotal.value = data.count;
  } catch (error) {
    console.error('Error loading in-awaiting data:', error);
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
  () => humanSupport.appliedFilters,
  () => {
    page.value = 1;
    loadData();
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
      loadData();
    }
  },
);
</script>
