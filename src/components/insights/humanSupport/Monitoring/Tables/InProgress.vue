<template>
  <UnnnicDataTable
    :locale="$i18n.locale"
    :isLoading="isLoading"
    clickable
    fixedHeaders
    height="100%"
    :headers="formattedHeaders"
    :items="formattedItems"
    hidePagination
    data-testid="in-progress-table"
    :sort="currentSort"
    @update:sort="handleSort"
  />
</template>

<script setup lang="ts">
import { UnnnicDataTable } from '@weni/unnnic-system';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { InProgressDataResult } from '@/services/api/resources/humanSupport/detailedMonitoring/inProgress';
//import getDetailedMonitoringInProgress from '@/services/api/resources/humanSupport/detailedMonitoring/inProgress';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const isLoading = ref(false);

const currentSort = ref<{ field: string; order: string }>({
  field: 'duration',
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

const handleSort = (sort: { field: string; order: string }) => {
  console.log('in-progress-table sort', sort);
  currentSort.value = sort;
};

const loadData = async () => {
  try {
    isLoading.value = true;
    /*const data = await getDetailedMonitoringInProgress({
      ordering: currentSort.order === 'desc' ? `-${currentSort.field}` : currentSort.field,
    });*/
    await new Promise((resolve) => setTimeout(resolve, 3000));
    formattedItems.value = [
      {
        duration: Math.random() * 100,
        awaiting_time: Math.random() * 100,
        first_response_time: Math.random() * 100,
        agent: 'Alice',
        sector: 'Sector 1',
        queue: 'Queue 1',
        contact: 'Contact 1',
      },
      {
        agent: 'Bob',
        duration: Math.random() * 100,
        awaiting_time: Math.random() * 100,
        first_response_time: Math.random() * 100,
        sector: 'Sector 1',
        queue: 'Queue 1',
        contact: 'Contact 1',
      },
      {
        agent: 'Charlie',
        duration: Math.random() * 100,
        awaiting_time: Math.random() * 100,
        first_response_time: Math.random() * 100,
        sector: 'Sector 1',
        queue: 'Queue 1',
        contact: 'Contact 1',
      },
      {
        agent: 'David',
        duration: Math.random() * 100,
        awaiting_time: Math.random() * 100,
        first_response_time: Math.random() * 100,
        sector: 'Sector 1',
        queue: 'Queue 1',
        contact: 'Contact 1',
      },
    ];
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  console.log('in-progress-table mounted');
  loadData();
});

onUnmounted(() => {
  console.log('in-progress-table unmounted');
});

watch(currentSort, () => {
  console.log('in-progress-table currentSort', currentSort.value);
  loadData();
});
</script>
