<template>
  <section
    class="performance-table"
    data-testid="performance-table"
  >
    <h2
      class="performance-table__title"
      data-testid="performance-table-title"
    >
      {{ $t(`${baseTranslationKey}.title`) }}
    </h2>
    <UnnnicDataTable
      :locale="$i18n.locale"
      :isLoading="isLoading"
      :isLoadingMore="isLoadingMore"
      fixedHeaders
      height="500px"
      :headers="formattedHeaders"
      :items="tableItems"
      :infiniteScroll="true"
      :infiniteScrollDistance="12"
      :infiniteScrollDisabled="!hasMoreData"
      :hidePagination="true"
      data-testid="performance-table-data"
      size="sm"
      :sort="currentSort"
      @update:sort="handleSort"
      @load-more="loadMore"
    >
      <template #header-average_order_value>
        <UnnnicToolTip
          :enabled="locale === 'en'"
          :text="$t(`${baseTranslationKey}.average_order_value_title_tooltip`)"
          side="top"
          data-testid="performance-table-aov-tooltip"
        >
          <p>{{ $t(`${baseTranslationKey}.average_order_value`) }}</p>
        </UnnnicToolTip>
      </template>
      <template #header-trend>
        <section class="performance-table__trend-header">
          <span>{{ $t(`${baseTranslationKey}.trend`) }}</span>
          <UnnnicToolTip
            enabled
            :text="$t(`${baseTranslationKey}.trend_tooltip`)"
            side="top"
            data-testid="performance-table-trend-tooltip"
          >
            <UnnnicIcon
              icon="help"
              size="sm"
              scheme="fg-muted"
              data-testid="performance-table-trend-help-icon"
            />
          </UnnnicToolTip>
        </section>
      </template>
      <template #body-trend="{ item }">
        <section
          class="performance-table__trend"
          data-testid="performance-table-trend-cell"
        >
          <UnnnicIcon
            v-if="item.trend?.variation_type"
            :icon="trendIcon(item.trend.variation_type)"
            :scheme="trendScheme(item.trend.variation_type)"
            size="md"
            :data-testid="`performance-table-trend-icon-${item.trend.variation_type.toLowerCase()}`"
          />
          <span>{{ formatTrendValue(item.trend) }}</span>
        </section>
      </template>
    </UnnnicDataTable>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import {
  UnnnicDataTable,
  UnnnicIcon,
  UnnnicToolTip,
} from '@weni/unnnic-system';

import { useInfiniteScrollTable } from '@/composables/useInfiniteScrollTable';
import { useLazyData } from '@/composables/useLazyData';
import { useConfig } from '@/store/modules/config';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import service, {
  type PerRepresentativeResult,
  type PerRepresentativeTrend,
  type TrendVariationType,
} from '@/services/api/resources/humanSupport/sales/perRepresentative';
import {
  formatCurrency,
  formatNumber,
  formatPercentageFixed,
} from '@/utils/numbers';

defineOptions({
  name: 'PerformanceTable',
});

type PerformanceTableItem = {
  representative: string;
  conversations: number | null;
  sales: number | null;
  conversions: number | null;
  revenue: number | null;
  average_order_value: number | null;
  trend: PerRepresentativeTrend | null;
};

const baseTranslationKey =
  'human_support_dashboard.sales.performance_by_representative';

const { t, locale } = useI18n();
const { projectCurrency } = storeToRefs(useConfig());
const humanSupport = useHumanSupport();
const { appliedDateRange, appliedFilters } = storeToRefs(humanSupport);

const currentSort = ref<{ header: string; itemKey: string; order: string }>({
  header: t(`${baseTranslationKey}.revenue`),
  order: 'desc',
  itemKey: 'revenue',
});

const formatResults = (
  results: PerRepresentativeResult[],
): PerformanceTableItem[] =>
  results.map((item) => ({
    representative:
      item.representative?.name || item.representative?.email || '-',
    conversations: item.conversations,
    sales: item.sales,
    conversions: item.conversions,
    revenue: item.revenue,
    average_order_value: item.average_order_value,
    trend: item.trend ?? null,
  }));

const fetchData = async (page: number, pageSize: number, ordering: string) => {
  const offset = (page - 1) * pageSize;
  return await service.getPerRepresentative({
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
} = useInfiniteScrollTable<PerRepresentativeResult, PerformanceTableItem>({
  fetchData,
  formatResults,
  sort: currentSort.value,
});

const formatMetric = (value: number | null) =>
  value === null || value === undefined ? '-' : formatNumber(value);

const formatPercent = (value: number | null) =>
  value === null || value === undefined ? '-' : formatPercentageFixed(value);

const formatMoney = (value: number | null) =>
  value === null || value === undefined
    ? '-'
    : formatCurrency(value, projectCurrency.value);

const formatTrendValue = (trend: PerRepresentativeTrend | null) => {
  if (trend?.value === null || trend?.value === undefined) return '-';

  const prefix =
    trend.variation_type === 'DECREASE' ? '-' : trend.value > 0 ? '+' : '';

  return `${prefix}${formatPercentageFixed(Math.abs(trend.value))}`;
};

const trendIcon = (variationType: TrendVariationType) =>
  variationType === 'DECREASE' ? 'trending_down' : 'trending_up';

const trendScheme = (variationType: TrendVariationType) =>
  variationType === 'DECREASE' ? 'fg-warning' : 'fg-success';

const tableItems = computed(() =>
  formattedItems.value.map((item) => ({
    ...item,
    conversations: formatMetric(item.conversations),
    sales: formatMetric(item.sales),
    conversions: formatPercent(item.conversions),
    revenue: formatMoney(item.revenue),
    average_order_value: formatMoney(item.average_order_value),
  })),
);

const formattedHeaders = computed(() => {
  const createHeader = (
    itemKey: string,
    { isSortable = true, align = 'right' } = {},
  ) => ({
    title: t(`${baseTranslationKey}.${itemKey}`),
    itemKey,
    isSortable,
    align,
  });

  return [
    createHeader('representative', { isSortable: false, align: 'left' }),
    createHeader('conversations'),
    createHeader('sales'),
    createHeader('conversions'),
    createHeader('revenue'),
    createHeader('average_order_value'),
    createHeader('trend', { isSortable: false }),
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

const isRequestPending = ref(false);

const loadDataSafely = async (sortValue: typeof currentSort.value) => {
  if (isRequestPending.value) return;

  try {
    isRequestPending.value = true;
    await resetAndLoadData(sortValue);
  } finally {
    isRequestPending.value = false;
  }
};

useLazyData({
  load: () => loadDataSafely(currentSort.value),
  watchSources: [appliedDateRange, appliedFilters, currentSort],
});
</script>

<style lang="scss" scoped>
.performance-table {
  border-radius: $unnnic-radius-2;
  border: 1px solid $unnnic-color-border-base;
  background-color: $unnnic-color-bg-base;
  display: flex;
  flex-direction: column;
  padding: $unnnic-space-6;
  gap: $unnnic-space-4;

  &__title {
    font: $unnnic-font-display-2;
    color: $unnnic-color-fg-emphasized;
  }

  &__trend-header {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: $unnnic-space-1;
    width: 100%;
  }

  &__trend {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: $unnnic-space-1;
    color: $unnnic-color-fg-base;
  }
}
</style>
