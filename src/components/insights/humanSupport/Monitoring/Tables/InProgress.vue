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
import { InProgressDataResult } from '@/services/api/resources/humanSupport/detailedMonitoring/inProgress';
import service from '@/services/api/resources/humanSupport/detailedMonitoring/inProgress';
import { useI18n } from 'vue-i18n';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { formatSecondsToTime } from '@/utils/time';

type FormattedInProgressData = Omit<
  InProgressDataResult,
  'duration' | 'awaiting_time' | 'first_response_time'
> & {
  duration: string;
  awaiting_time: string;
  first_response_time: string;
};

const { t } = useI18n();
const humanSupportMonitoring = useHumanSupportMonitoring();
const isLoading = ref(false);

const page = ref(1);
const pageInterval = ref(15);
const pageTotal = ref(0);

const currentSort = ref<{ header: string; itemKey: string; order: string }>({
  header: 'duration',
  order: 'desc',
  itemKey: 'duration',
});

const formattedItems = ref<FormattedInProgressData[]>([]);

const formattedHeaders = computed(() => {
  const baseTranslationKey =
    'human_support_dashboard.detailed_monitoring.in_progress';

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
  currentSort.value = sort;
};

const handlePageChange = (newPage: number) => {
  page.value = newPage;
  loadData();
};

const redirectItem = (item: InProgressDataResult) => {
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
        ? `-${currentSort.value.itemKey}`
        : currentSort.value.itemKey;

    const data = await service.getDetailedMonitoringInProgress({
      ordering,
      limit: pageInterval.value,
      offset,
    });

    formattedItems.value = data.results.map((result) => ({
      ...result,
      duration: formatSecondsToTime(result?.duration),
      awaiting_time: formatSecondsToTime(result?.awaiting_time),
      first_response_time: formatSecondsToTime(result?.first_response_time),
    }));

    pageTotal.value = data.count;
  } catch (error) {
    console.error('Error loading in-progress data:', error);
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
    if (
      newValue &&
      humanSupportMonitoring.activeDetailedTab === 'in_progress'
    ) {
      loadData();
    }
  },
);
</script>
