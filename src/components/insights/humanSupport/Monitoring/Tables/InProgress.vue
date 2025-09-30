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
  />
</template>

<script setup lang="ts">
import { UnnnicDataTable } from '@weni/unnnic-system';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import {
  InProgressDataResult,
  InProgressData,
} from '@/services/api/resources/humanSupport/detailedMonitoring/inProgress';
//import getDetailedMonitoringInProgress from '@/services/api/resources/humanSupport/detailedMonitoring/inProgress';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const isLoading = ref(false);

// Page state
const page = ref(1);
const pageInterval = ref(12);
const pageTotal = ref(0);

const currentSort = ref<{ field: string; order: string }>({
  field: 'duration',
  order: 'desc',
});

const apiData = ref<InProgressData | null>(null);
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

const handlePageChange = (newPage: number) => {
  console.log('in-progress-table pagination change', newPage);
  page.value = newPage;
  loadData();
};

let mockDatabase: InProgressDataResult[] = [];

const initializeMockDatabase = () => {
  if (mockDatabase.length > 0) return;

  const agents = [
    'Alice',
    'Bob',
    'Charlie',
    'David',
    'Eve',
    'Frank',
    'Grace',
    'Henry',
  ];
  const sectors = ['Support', 'Sales', 'Technical', 'Billing', 'General'];
  const queues = ['Priority', 'Standard', 'VIP', 'New Customers'];

  for (let i = 0; i < 35; i++) {
    mockDatabase.push({
      duration: Math.floor(Math.random() * 300) + 10,
      awaiting_time: Math.floor(Math.random() * 120) + 5,
      first_response_time: Math.floor(Math.random() * 60) + 10,
      agent: agents[Math.floor(Math.random() * agents.length)],
      sector: sectors[Math.floor(Math.random() * sectors.length)],
      queue: queues[Math.floor(Math.random() * queues.length)],
      contact: `+55 11 9${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`,
    });
  }
};

const mockGetDetailedMonitoringInProgress = async (
  limit: number,
  offset: number,
  ordering: string,
): Promise<InProgressData> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const sortedData = [...mockDatabase].sort((a, b) => {
    const isDesc = ordering.startsWith('-');
    const field = isDesc ? ordering.substring(1) : ordering;
    const fieldKey = field as keyof InProgressDataResult;

    let valueA = a[fieldKey];
    let valueB = b[fieldKey];

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return isDesc
        ? valueB.localeCompare(valueA)
        : valueA.localeCompare(valueB);
    }

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return isDesc ? valueB - valueA : valueA - valueB;
    }

    return 0;
  });

  const results = sortedData.slice(offset, offset + limit);
  const count = sortedData.length;

  const hasNext = offset + limit < count;
  const hasPrevious = offset > 0;

  return {
    next: hasNext ? `?limit=${limit}&offset=${offset + limit}` : '',
    previous: hasPrevious ? `?limit=${limit}&offset=${offset - limit}` : '',
    count,
    results,
  };
};

const loadData = async () => {
  try {
    isLoading.value = true;

    initializeMockDatabase();

    const offset = (page.value - 1) * pageInterval.value;
    const ordering =
      currentSort.value.order === 'desc'
        ? `-${currentSort.value.field}`
        : currentSort.value.field;

    // Mock API call - Replace this with the real API call in the future:
    // const data = await getDetailedMonitoringInProgress({
    //   ordering,
    //   limit: pageInterval.value,
    //   offset,
    // });

    const data = await mockGetDetailedMonitoringInProgress(
      pageInterval.value,
      offset,
      ordering,
    );

    apiData.value = data;

    formattedItems.value = data.results;

    pageTotal.value = data.count;

    console.log(
      `Loaded ${data.results.length} items from total of ${data.count}`,
    );
    console.log(
      `Page ${page.value}, has next: ${!!data.next}, has previous: ${!!data.previous}`,
    );
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
  page.value = 1;
  loadData();
});
</script>
