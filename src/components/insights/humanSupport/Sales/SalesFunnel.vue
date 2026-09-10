<template>
  <section
    v-if="isLoading"
    class="sales-funnel__loading"
    data-testid="sales-funnel-loading"
  >
    <UnnnicSkeletonLoading
      width="100%"
      height="100%"
    />
  </section>
  <section
    v-else
    :class="['sales-funnel', { 'sales-funnel--empty': isEmptyData }]"
    data-testid="sales-funnel"
  >
    <h2
      class="sales-funnel__title"
      data-testid="sales-funnel-title"
    >
      {{ $t(`${baseTranslationKey}.title`) }}
    </h2>
    <UnnnicDisclaimer
      v-if="isEmptyData"
      type="informational"
      :description="$t('human_support_dashboard.sales.sales_funnel.no_data')"
      data-testid="sales-funnel-no-data-disclaimer"
    />
    <UnnnicChartFunnel
      v-else
      :data="graphData"
      class="sales-funnel__graph"
      data-testid="sales-funnel-graph"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import {
  UnnnicChartFunnel,
  UnnnicDisclaimer,
  UnnnicSkeletonLoading,
} from '@weni/unnnic-system';
import { colorTeal3, colorFgAccent } from '@weni/unnnic-system/tokens/colors';

import { useLazyData } from '@/composables/useLazyData';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { useHumanSupportSales } from '@/store/modules/humanSupport/sales';
import { formatNumber, formatPercentage } from '@/utils/numbers';

defineOptions({
  name: 'HumanSupportSalesFunnel',
});

const baseTranslationKey = 'human_support_dashboard.sales.sales_funnel';

const { t, locale } = useI18n();

const humanSupport = useHumanSupport();
const { appliedDateRange, appliedFilters } = storeToRefs(humanSupport);

const humanSupportSales = useHumanSupportSales();
const { loadPurchasesMadeData } = humanSupportSales;
const { purchasesMadeData, loadingPurchasesMadeData } =
  storeToRefs(humanSupportSales);

useLazyData({
  load: loadPurchasesMadeData,
  watchSources: [appliedDateRange, appliedFilters],
});

const isLoading = computed(() => loadingPurchasesMadeData.value);

const isEmptyData = computed(() => {
  const { leads_captured, purchases_made } = purchasesMadeData.value;

  return [leads_captured?.value || 0, purchases_made?.value || 0].every(
    (value) => value === 0,
  );
});

const barDisplay = computed(() => (isEmptyData.value ? 'none' : 'block'));

const graphData = computed(() => {
  const { leads_captured, purchases_made } = purchasesMadeData.value;

  return [
    {
      title: formatPercentage(leads_captured?.percentage || 0, locale.value),
      value: formatNumber(leads_captured?.value || 0, locale.value),
      description: t(`${baseTranslationKey}.leads_captured`),
      color: colorFgAccent,
    },
    {
      title: formatPercentage(purchases_made?.percentage || 0, locale.value),
      value: formatNumber(purchases_made?.value || 0, locale.value),
      description: t(`${baseTranslationKey}.purchases_made`),
      color: colorTeal3,
    },
  ];
});
</script>

<style lang="scss" scoped>
:deep(.sales-funnel__graph) {
  .unnnic-chart-funnel-base-item {
    position: relative;
    z-index: 2;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -1px;
      width: 100%;
      height: 1px;
      background-color: $unnnic-color-gray-2;
      z-index: 1;
    }

    &:last-of-type::after {
      display: none;
    }

    .w-60 {
      display: v-bind(barDisplay);
    }

    .w-50 {
      display: v-bind(barDisplay);
    }
  }
}

.sales-funnel {
  border-radius: $unnnic-radius-2;
  border: 1px solid $unnnic-color-border-base;
  background-color: $unnnic-color-bg-base;
  display: flex;
  flex-direction: column;
  padding: $unnnic-space-6;
  justify-content: space-between;
  gap: $unnnic-space-8;
  min-height: 450px;

  &--empty {
    justify-content: unset;
    gap: $unnnic-space-2;
  }

  &__loading {
    height: 450px;
    width: 100%;
  }

  &__title {
    font: $unnnic-font-display-2;
    color: $unnnic-color-fg-emphasized;
  }
}
</style>
