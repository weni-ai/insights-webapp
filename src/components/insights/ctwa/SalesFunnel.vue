<template>
  <section
    v-if="isLoading"
    class="sales-funnel__loading"
    data-testid="ctwa-sales-funnel-loading"
  >
    <UnnnicSkeletonLoading
      width="100%"
      height="100%"
    />
  </section>
  <section
    v-else
    class="sales-funnel"
    data-testid="ctwa-sales-funnel"
  >
    <h2
      class="sales-funnel__title"
      data-testid="ctwa-sales-funnel-title"
    >
      {{ $t('ctwa_dashboard.sales_funnel.title') }}
    </h2>
    <SteppedBarChart :items="chartItems" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import {
  colorBlue3,
  colorBlue6,
  colorBlue8,
} from '@weni/unnnic-system/tokens/colors';

import SteppedBarChart, {
  type FunnelChartItem,
} from '@/components/insights/charts/SteppedBarChart.vue';
import { useLazyData } from '@/composables/useLazyData';
import { useCTWA } from '@/store/modules/ctwa';
import { formatNumber, formatPercentage } from '@/utils/numbers';
import type { ConversionStage } from '@/services/api/resources/ctwa/conversions';

defineOptions({
  name: 'SalesFunnel',
});

const funnelBaseKey = 'ctwa_dashboard.sales_funnel';

const { t } = useI18n();
const ctwaStore = useCTWA();
const { appliedFilters, conversionsData, loadingConversionsData } =
  storeToRefs(ctwaStore);
const { loadConversionsData } = ctwaStore;

useLazyData({
  load: loadConversionsData,
  watchSources: [appliedFilters],
});

const isLoading = computed(() => loadingConversionsData.value);

const formatStageTotal = (total: number | null) =>
  total === null || total === undefined ? '-' : formatNumber(total);

const formatStagePercentage = (percentage: number | null) =>
  percentage === null || percentage === undefined
    ? '-'
    : formatPercentage(percentage);

const mapStage = (
  id: string,
  labelKey: string,
  stage: ConversionStage,
  backgroundColor: string,
  tooltip?: string,
): FunnelChartItem => ({
  id,
  label: t(`${funnelBaseKey}.${labelKey}`),
  value: stage.percentage ?? 0,
  displayValue: formatStagePercentage(stage.percentage),
  displaySecondary: formatStageTotal(stage.total),
  backgroundColor,
  tooltip,
});

const chartItems = computed<FunnelChartItem[]>(() => [
  mapStage(
    'started',
    'started',
    conversionsData.value.conversations_started,
    colorBlue3,
  ),
  mapStage(
    'qualified',
    'qualified',
    conversionsData.value.conversations_qualified,
    colorBlue6,
    t(`${funnelBaseKey}.qualified_help`),
  ),
  mapStage(
    'converted',
    'converted',
    conversionsData.value.conversations_converted,
    colorBlue8,
  ),
]);
</script>

<style scoped lang="scss">
.sales-funnel {
  border-radius: $unnnic-radius-2;
  border: 1px solid $unnnic-color-border-base;
  background-color: $unnnic-color-bg-base;
  display: flex;
  flex-direction: column;
  padding: $unnnic-space-6;
  gap: $unnnic-space-4;

  &__loading {
    height: 332px;
    width: 100%;
  }

  &__title {
    font: $unnnic-font-display-2;
    color: $unnnic-color-fg-emphasized;
  }
}
</style>
