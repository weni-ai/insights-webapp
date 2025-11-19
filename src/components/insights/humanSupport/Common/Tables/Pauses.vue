<template>
  <UnnnicDataTable
    :locale="$i18n.locale"
    :isLoading="isLoading"
    :isLoadingMore="isLoadingMore"
    clickable
    fixedHeaders
    height="600px"
    :headers="formattedHeaders"
    :items="formattedItems"
    :infiniteScroll="true"
    :infiniteScrollDistance="12"
    :infiniteScrollDisabled="!hasMoreData"
    :hidePagination="true"
    data-testid="pauses-table"
    size="sm"
    :sort="currentSort"
    @update:sort="handleSort"
    @item-click="redirectItem"
    @load-more="loadMore"
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
import { useInfiniteScrollTable } from '@/composables/useInfiniteScrollTable';

type FormattedPausesData = Omit<PausesDataResult, 'custom_status'> & {
  custom_status: {
    status_type: string;
    break_time: string | number;
  }[];
};

const { t } = useI18n();
const humanSupportMonitoring = useHumanSupportMonitoring();
const humanSupport = useHumanSupport();

const baseTranslationKey = 'human_support_dashboard.detailed_monitoring.pauses';

const currentSort = ref<{ header: string; itemKey: string; order: string }>({
  header: t(`${baseTranslationKey}.agent`),
  order: 'asc',
  itemKey: 'agent',
});

const formatResults = (results: PausesDataResult[]): FormattedPausesData[] => {
  return results as FormattedPausesData[];
};

const fetchData = async (page: number, pageSize: number, ordering: string) => {
  const offset = (page - 1) * pageSize;
  return await getDetailedMonitoringPausesService.getDetailedMonitoringPauses({
    ordering,
    limit: pageSize,
    offset,
    agent: humanSupport.appliedDetailFilters.agent.value,
  });
};

const {
  isLoading,
  isLoadingMore,
  formattedItems: rawItems,
  hasMoreData,
  loadMoreData,
  resetAndLoadData,
  handleSort: handleSortChange,
} = useInfiniteScrollTable<PausesDataResult, FormattedPausesData>({
  fetchData,
  formatResults,
});

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
      title: t('human_support_dashboard.detailed_monitoring.pauses.attendant'),
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
      link: item.link,
      agent: item.agent,
      ...customStatusObj,
    };
  });
});

const handleSort = (sort: {
  header: string;
  itemKey: string;
  order: string;
}) => {
  handleSortChange(sort, currentSort);
};

const loadMore = () => {
  loadMoreData(currentSort.value);
};

const redirectItem = (item: PausesDataResult) => {
  if (!item?.link?.url) return;
  const path = `${item.link?.url}/insights`;
  window.parent.postMessage({ event: 'redirect', path }, '*');
};

onMounted(() => {
  resetAndLoadData(currentSort.value);
});

watch(
  [
    currentSort,
    () => humanSupport.appliedDetailFilters.agent,
    () => humanSupport.appliedFilters,
    () => humanSupport.appliedDateRange,
  ],
  () => {
    resetAndLoadData(currentSort.value);
  },
  { flush: 'post' },
);

watch(
  () => humanSupportMonitoring.refreshDataMonitoring,
  (newValue) => {
    if (newValue && humanSupportMonitoring.activeDetailedTab === 'pauses') {
      resetAndLoadData(currentSort.value);
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
