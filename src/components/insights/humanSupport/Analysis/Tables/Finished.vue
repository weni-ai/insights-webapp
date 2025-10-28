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
import { FinishedDataResult } from '@/services/api/resources/humanSupport/analysis/detailedAnalysis/finished';
import service from '@/services/api/resources/humanSupport/analysis/detailedAnalysis/finished';
import { useI18n } from 'vue-i18n';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { formatSecondsToTime } from '@/utils/time';

type FormattedInProgressData = Omit<
  FinishedDataResult,
  'duration' | 'awaiting_time' | 'first_response_time' | 'response_time'
> & {
  duration: string;
  awaiting_time: string;
  first_response_time: string;
  response_time: string;
};

const { t } = useI18n();
const humanSupport = useHumanSupport();
const isLoading = ref(false);

const page = ref(1);
const pageInterval = ref(15);
const pageTotal = ref(0);

const baseTranslationKey = 'human_support_dashboard.columns.common';

const currentSort = ref<{ header: string; itemKey: string; order: string }>({
  header: t(`${baseTranslationKey}.agent`),
  order: 'desc',
  itemKey: 'agent',
});

const formattedItems = ref<FormattedInProgressData[]>([]);

const formattedHeaders = computed(() => {
  const createHeader = (itemKey: string, translationKey?: string) => ({
    title: t(`${baseTranslationKey}.${translationKey || itemKey}`),
    itemKey,
    isSortable: true,
  });

  return [
    createHeader('agent'),
    createHeader('sector'),
    createHeader('queue'),
    createHeader('awaiting_time'),
    createHeader('first_response_time'),
    createHeader('duration'),
    createHeader('contact'),
    createHeader('ticket_id'),
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

const redirectItem = (item: FinishedDataResult) => {
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

    const data = await service.getDetailedAnalysisFinishedData({
      ordering,
      limit: pageInterval.value,
      offset,
    });

    formattedItems.value = data.results.map((result) => ({
      ...result,
      duration: formatSecondsToTime(result?.duration),
      awaiting_time: formatSecondsToTime(result?.awaiting_time),
      first_response_time: formatSecondsToTime(result?.first_response_time),
      response_time: formatSecondsToTime(result?.response_time),
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

watch(
  [
    currentSort,
    () => humanSupport.appliedFilters,
    () => humanSupport.appliedDateRange,
    () => humanSupport.appliedAgentFilter,
    () => humanSupport.appliedContactFilter,
    () => humanSupport.appliedTicketIdFilter,
  ],
  () => {
    page.value = 1;
    loadData();
  },
  { flush: 'post' },
);
</script>
