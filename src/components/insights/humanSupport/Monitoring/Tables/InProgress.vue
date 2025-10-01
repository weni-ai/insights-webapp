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

const { t } = useI18n();

const isLoading = ref(false);

const page = ref(1);
const pageInterval = ref(6);
const pageTotal = ref(0);

const currentSort = ref<{ header: string; order: string }>({
  header: 'duration',
  order: 'desc',
});

const formattedItems = ref<InProgressDataResult[]>([]);

const formattedHeaders = computed(() => [
  {
    title: t(
      'human_support_dashboard.detailed_monitoring.in_progress.duration',
    ),
    itemKey: 'duration',
    isSortable: true,
  },
  {
    title: t(
      'human_support_dashboard.detailed_monitoring.in_progress.awaiting_time',
    ),
    itemKey: 'awaiting_time',
    isSortable: true,
  },
  {
    title: t(
      'human_support_dashboard.detailed_monitoring.in_progress.first_response_time',
    ),
    itemKey: 'first_response_time',
    isSortable: true,
  },
  {
    title: t(
      'human_support_dashboard.detailed_monitoring.in_progress.attendant',
    ),
    itemKey: 'agent',
    isSortable: true,
  },
  {
    title: t('human_support_dashboard.detailed_monitoring.in_progress.sector'),
    itemKey: 'sector',
    isSortable: true,
  },
  {
    title: t('human_support_dashboard.detailed_monitoring.in_progress.queue'),
    itemKey: 'queue',
    isSortable: true,
  },
  {
    title: t('human_support_dashboard.detailed_monitoring.in_progress.contact'),
    itemKey: 'contact',
    isSortable: true,
  },
]);

const handleSort = (sort: { header: string; order: string }) => {
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
        ? `-${currentSort.value.header}`
        : currentSort.value.header;

    const data = await service.getDetailedMonitoringInProgress({
      ordering,
      limit: pageInterval.value,
      offset,
    });

    formattedItems.value = data.results;

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
</script>
