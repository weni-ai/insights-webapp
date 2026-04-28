<template>
  <UnnnicDataTable
    :locale="$i18n.locale"
    :isLoading="isLoading"
    :isLoadingMore="isLoadingMore"
    clickable
    fixedHeaders
    height="500px"
    :headers="formattedHeaders"
    :items="widgetData"
    :infiniteScroll="true"
    :infiniteScrollDistance="12"
    :infiniteScrollDisabled="!hasMoreData"
    :hidePagination="true"
    data-testid="finished-table"
    size="sm"
    :sort="currentSort"
    @update:sort="handleSort"
    @item-click="redirectItem"
    @item-click:middle="redirectItemNewTab"
    @load-more="loadMore"
  >
    <template #body-agent="{ item }">
      <DynamicCellText
        v-if="item.agent"
        :text="item.agent"
        :isDeleted="item.agent_is_deleted"
        :tooltipText="
          $t('human_support_dashboard.deleted_tooltips.representative')
        "
      />
      <UnnnicToolTip
        v-else
        enabled
        :text="
          $t(
            'human_support_dashboard.analyze.detailed_analysis.not_handled.description',
          )
        "
      >
        <p class="italic-text">
          {{
            $t(
              'human_support_dashboard.analyze.detailed_analysis.not_handled.title',
            )
          }}
        </p>
      </UnnnicToolTip>
    </template>
    <template #body-sector="{ item }">
      <DynamicCellText
        :text="item.sector"
        :isDeleted="item.sector_is_deleted"
        :tooltipText="$t('human_support_dashboard.deleted_tooltips.sector')"
      />
    </template>
    <template #body-queue="{ item }">
      <DynamicCellText
        :text="item.queue"
        :isDeleted="item.queue_is_deleted"
        :tooltipText="$t('human_support_dashboard.deleted_tooltips.queue')"
      />
    </template>
    <template #body-first_response_time="{ item }">
      <p
        v-if="item.first_response_time === null"
        class="italic-text"
      >
        {{ $t('human_support_dashboard.common.no_response') }}
      </p>
      <p v-else>{{ formatSecondsToTime(item.first_response_time) }}</p>
    </template>
    <template #body-duration="{ item }">
      {{ formatSecondsToTime(item.duration) }}
    </template>
    <template #body-awaiting_time="{ item }">
      {{ formatSecondsToTime(item.awaiting_time) }}
    </template>
    <template #body-response_time="{ item }">
      {{ formatSecondsToTime(item.response_time) }}
    </template>
  </UnnnicDataTable>
</template>

<script setup lang="ts">
import { UnnnicDataTable } from '@weni/unnnic-system';
import { computed, ref, watch } from 'vue';
import { FinishedDataResult } from '@/services/api/resources/humanSupport/analysis/detailedAnalysis/finished';
import service from '@/services/api/resources/humanSupport/analysis/detailedAnalysis/finished';
import { useI18n } from 'vue-i18n';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { useProject } from '@/store/modules/project';
import { formatSecondsToTime } from '@/utils/time';
import { useInfiniteScrollTable } from '@/composables/useInfiniteScrollTable';
import { analysisDetailedAnalysisFinishedMock } from '../mocks';
import { openNewTabLink } from '@/utils/redirect';
import DynamicCellText from '../../Common/DynamicCellText.vue';

type FormattedFinishedData = Omit<
  FinishedDataResult,
  'agent' | 'sector' | 'queue'
> & {
  agent: string | null;
  agent_is_deleted: boolean;
  sector: string;
  sector_is_deleted: boolean;
  queue: string;
  queue_is_deleted: boolean;
};

defineOptions({
  name: 'AnalysisFinishedTable',
});

const { t } = useI18n();
const humanSupport = useHumanSupport();
const projectStore = useProject();

const baseTranslationKey = 'human_support_dashboard.columns.common';

const currentSort = ref<{ header: string; itemKey: string; order: string }>({
  header: t(`${baseTranslationKey}.agent`),
  order: 'asc',
  itemKey: 'agent',
});

const formatResults = (results: FinishedDataResult[]) => {
  return results.map((result) => ({
    ...result,
    agent: formatAgentName(result.agent),
    agent_is_deleted: result.agent?.is_deleted === true,
    sector: result.sector?.name || '',
    sector_is_deleted: result.sector?.is_deleted === true,
    queue: result.queue?.name || '',
    queue_is_deleted: result.queue?.is_deleted === true,
  }));
};

const formatAgentName = (agent: { name: string; email: string }) => {
  return agent?.name?.trim().length > 0 ? agent?.name : agent?.email || '';
};

const fetchData = async (page: number, pageSize: number, ordering: string) => {
  const offset = (page - 1) * pageSize;
  return await service.getDetailedAnalysisFinishedData({
    ordering,
    limit: pageSize,
    offset,
  });
};

const {
  isLoading,
  isLoadingMore,
  formattedItems,
  hasMoreData,
  loadMoreData,
  resetAndLoadData,
  handleSort: handleSortChange,
} = useInfiniteScrollTable<FinishedDataResult, FormattedFinishedData>({
  fetchData,
  formatResults,
  sort: currentSort.value,
});

const widgetData = computed(() => {
  if (!projectStore.hasSectorsConfigured) {
    return formatResults(
      analysisDetailedAnalysisFinishedMock as unknown as FinishedDataResult[],
    );
  }
  return formattedItems.value;
});

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
  handleSortChange(sort, currentSort);
};

const loadMore = () => {
  loadMoreData(currentSort.value);
};

const redirectItemNewTab = (item: FinishedDataResult) => {
  if (!item?.link?.url) return;
  openNewTabLink(item.link.url);
};

const redirectItem = (item: FinishedDataResult) => {
  if (!item?.link?.url) return;
  let url = item.link.url;

  if (url.startsWith('chats:/')) {
    url = url.replace('chats:/', 'chats:');
  }

  window.parent.postMessage({ event: 'redirect', path: url }, '*');
};

watch(
  [
    currentSort,
    () => humanSupport.appliedFilters,
    () => humanSupport.appliedDateRange,
    () => humanSupport.appliedDetailFilters.agent,
    () => humanSupport.appliedDetailFilters.contact,
    () => humanSupport.appliedDetailFilters.ticketId,
  ],
  () => {
    resetAndLoadData(currentSort.value);
  },
  { immediate: true },
);
</script>

<style scoped>
.italic-text {
  font-style: italic;
}
</style>
