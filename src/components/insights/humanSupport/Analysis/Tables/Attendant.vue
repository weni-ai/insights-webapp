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
  />
</template>

<script setup lang="ts">
import { UnnnicDataTable } from '@weni/unnnic-system';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { AttendantDataResult } from '@/services/api/resources/humanSupport/analysis/detailedAnalysis/attendant';
import service from '@/services/api/resources/humanSupport/analysis/detailedAnalysis/attendant';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { formatSecondsToTime } from '@/utils/time';

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

const isLoading = ref(false);
const humanSupport = useHumanSupport();

const page = ref(1);
const pageInterval = ref(15);
const pageTotal = ref(0);

const baseTranslationKey = 'human_support_dashboard.columns.common';

const currentSort = ref<{ header: string; itemKey: string; order: string }>({
  header: t(`${baseTranslationKey}.agent`),
  order: 'desc',
  itemKey: 'agent',
});

const formattedItems = ref<FormattedAttendantData[]>([]);

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
    createHeader('agent'),
    createHeader('finished', 'total_attendances'),
    createHeader('average_first_response_time'),
    createHeader('average_response_time'),
    createHeader('average_duration'),
    createHeader('time_in_service'),
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
    const data = await service.getDetailedAnalysisAttendantData({
      ordering:
        currentSort.value.order === 'desc'
          ? `-${currentSort.value.itemKey}`
          : currentSort.value.itemKey,
      limit: pageInterval.value,
      offset: (page.value - 1) * pageInterval.value,
      agent: humanSupport.appliedDetailFilters.agent.value,
    });

    if (data.results) {
      formattedItems.value = data.results.map((result) => ({
        ...result,
        average_first_response_time: formatSecondsToTime(
          result?.average_first_response_time,
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

watch(
  [
    currentSort,
    () => humanSupport.appliedDetailFilters.agent,
    () => humanSupport.appliedFilters,
    () => humanSupport.appliedDateRange,
  ],
  () => {
    page.value = 1;
    loadData();
  },
  { flush: 'post' },
);
</script>
