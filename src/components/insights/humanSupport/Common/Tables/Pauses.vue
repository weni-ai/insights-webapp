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
  >
    <template
      v-for="statusType in customStatusTypes"
      #[`header-${statusType}`]
      :key="`header-${statusType}`"
    >
      <UnnnicToolTip
        :text="statusType"
        side="top"
        enabled
        class="pauses-table-header-tooltip"
      >
        <span class="pauses-table-header-text">
          {{ statusType }}
        </span>
      </UnnnicToolTip>
    </template>
  </UnnnicDataTable>
</template>

<script setup lang="ts">
import { UnnnicDataTable, UnnnicToolTip } from '@weni/unnnic-system';
import { computed, onMounted, ref, watch } from 'vue';
import { PausesDataResult } from '@/services/api/resources/humanSupport/monitoring/detailedMonitoring/pauses';
import getDetailedMonitoringPausesService from '@/services/api/resources/humanSupport/monitoring/detailedMonitoring/pauses';
import { useI18n } from 'vue-i18n';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { formatSecondsToTime } from '@/utils/time';

type FormattedPausesData = Omit<PausesDataResult, 'custom_status'> & {
  custom_status: {
    status_type: string;
    break_time: string | number;
  }[];
};

const { t } = useI18n();

const isLoading = ref(false);
const humanSupportMonitoring = useHumanSupportMonitoring();
const humanSupport = useHumanSupport();

const page = ref(1);
const pageInterval = ref(15);
const pageTotal = ref(0);

const baseTranslationKey = 'human_support_dashboard.detailed_monitoring.pauses';

const currentSort = ref<{ header: string; itemKey: string; order: string }>({
  header: t(`${baseTranslationKey}.agent`),
  order: 'asc',
  itemKey: 'agent',
});

const rawItems = ref<FormattedPausesData[]>([]);

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
      title: t('human_support_dashboard.detailed_monitoring.pauses.agent'),
      itemKey: 'agent',
      isSortable: true,
      size: 0.8,
    },
  ];

  const dynamicHeaders = customStatusTypes.value.map((statusType) => ({
    title: statusType,
    itemKey: statusType,
    isSortable: false,
    size: 0.5,
  }));

  return [...baseHeaders, ...dynamicHeaders];
});

const formattedItems = computed(() => {
  return rawItems.value.map((item) => {
    const customStatusObj: Record<string, string> = {};

    item.custom_status?.forEach((status) => {
      customStatusObj[status.status_type] = formatSecondsToTime(
        status?.break_time as number,
      );
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
        ? `-${currentSort.value.itemKey}`
        : currentSort.value.itemKey;

    const data =
      await getDetailedMonitoringPausesService.getDetailedMonitoringPauses({
        ordering,
        limit: pageInterval.value,
        offset,
        agent: humanSupport.appliedDetailFilters.agent.value,
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

watch(
  () => humanSupportMonitoring.refreshDataMonitoring,
  (newValue) => {
    if (newValue && humanSupportMonitoring.activeDetailedTab === 'pauses') {
      loadData();
    }
  },
);
</script>

<style scoped lang="scss">
.pauses-table-header-tooltip {
  width: 100%;
  display: flex;
}

.pauses-table-header-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}
</style>
