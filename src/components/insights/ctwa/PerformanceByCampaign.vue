<template>
  <section
    class="performance-by-campaign"
    data-testid="ctwa-performance-by-campaign"
  >
    <h2
      class="performance-by-campaign__title"
      data-testid="ctwa-performance-by-campaign-title"
    >
      {{ $t(`${tableBaseKey}.title`) }}
    </h2>
    <UnnnicDataTable
      :locale="$i18n.locale"
      :isLoading="isLoading"
      :headers="headers"
      :items="rows"
      :page="page"
      :pageTotal="count"
      :pageInterval="pageSize"
      :hidePagination="hidePagination"
      size="sm"
      data-testid="ctwa-performance-by-campaign-table"
      @update:page="handlePageChange"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { UnnnicDataTable } from '@weni/unnnic-system';

import { useLazyData } from '@/composables/useLazyData';
import { CAMPAIGN_PERFORMANCE_PAGE_SIZE, useCTWA } from '@/store/modules/ctwa';
import { formatCurrency, formatNumber } from '@/utils/numbers';

defineOptions({
  name: 'PerformanceByCampaign',
});

const tableBaseKey = 'ctwa_dashboard.performance_by_campaign';
const pageSize = CAMPAIGN_PERFORMANCE_PAGE_SIZE;

const { t } = useI18n();
const ctwaStore = useCTWA();
const {
  appliedDateRange,
  campaignPerformanceResults,
  campaignPerformanceCount,
  campaignPerformanceOffset,
  loadingCampaignPerformance,
} = storeToRefs(ctwaStore);
const { loadCampaignPerformanceData } = ctwaStore;

useLazyData({
  load: () => loadCampaignPerformanceData(0),
  watchSources: [appliedDateRange],
});

const isLoading = computed(() => loadingCampaignPerformance.value);
const count = computed(() => campaignPerformanceCount.value);
const page = computed(
  () => Math.floor(campaignPerformanceOffset.value / pageSize) + 1,
);
const hidePagination = computed(() => count.value <= pageSize);

const formatMetric = (value: number | null) =>
  value === null || value === undefined ? '-' : formatNumber(value);

const formatMoney = (value: number | null) =>
  value === null || value === undefined ? '-' : formatCurrency(value);

const headerKeys = [
  'campaign',
  'conversations',
  'qualified',
  'conversions',
  'revenue',
] as const;

const headers = computed(() =>
  headerKeys.map((itemKey) => ({
    title: t(`${tableBaseKey}.${itemKey}`),
    itemKey,
    isSortable: false,
  })),
);

const rows = computed(() =>
  campaignPerformanceResults.value.map((item) => ({
    campaign: item.campaign || '-',
    conversations: formatMetric(item.conversations),
    qualified: formatMetric(item.qualified),
    conversions: formatMetric(item.conversions),
    revenue: formatMoney(item.revenue),
  })),
);

const handlePageChange = (nextPage: number) => {
  loadCampaignPerformanceData((nextPage - 1) * pageSize);
};
</script>

<style scoped lang="scss">
.performance-by-campaign {
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
}
</style>
