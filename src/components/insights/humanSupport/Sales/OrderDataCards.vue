<template>
  <section
    class="order-data-cards"
    data-testid="order-data-cards"
  >
    <section
      class="order-data-cards__cards"
      data-testid="order-data-cards-cards"
    >
      <CardConversations
        :title="$t(`${baseTranslationKey}.total_revenue`)"
        :value="formatMoney(totalRevenue.value)"
        :description="totalRevenueComparison"
        borderRadius="left"
        :isLoading="isLoadingCards"
      />
      <CardConversations
        :title="$t(`${baseTranslationKey}.average_order_value`)"
        :value="formatMoney(averageOrderValue)"
        borderRadius="right"
        :isLoading="isLoadingCards"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import CardConversations from '@/components/insights/cards/CardConversations.vue';

import { useLazyData } from '@/composables/useLazyData';

import { useConfig } from '@/store/modules/config';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { useHumanSupportSales } from '@/store/modules/humanSupport/sales';

import { formatCurrency, formatPercentageFixed } from '@/utils/numbers';

const baseTranslationKey = 'human_support_dashboard.sales.order_data';

const { t } = useI18n();
const { projectCurrency } = storeToRefs(useConfig());

const humanSupport = useHumanSupport();
const { appliedDateRange, appliedFilters } = storeToRefs(humanSupport);

const humanSupportSales = useHumanSupportSales();
const { loadSalesData } = humanSupportSales;
const { salesData, loadingSalesData } = storeToRefs(humanSupportSales);

useLazyData({
  load: loadSalesData,
  watchSources: [appliedDateRange, appliedFilters],
});

const isLoadingCards = computed(() => loadingSalesData.value);

const totalRevenue = computed(() => salesData.value.total_revenue);
const averageOrderValue = computed(() => salesData.value.average_order_value);

const formatMoney = (value: number | null) => {
  if (value === null || value === undefined) return '-';
  return formatCurrency(value, projectCurrency.value);
};

const formatSignedVariation = (value: number | null) => {
  if (value === null || value === undefined) return null;

  const prefix = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${prefix}${formatPercentageFixed(Math.abs(value))}`;
};

const totalRevenueComparison = computed(() => {
  const { variation, last_period_value } = totalRevenue.value;
  const formattedVariation = formatSignedVariation(variation);

  if (
    formattedVariation === null ||
    last_period_value === null ||
    last_period_value === undefined
  ) {
    return undefined;
  }

  return t(`${baseTranslationKey}.last_period_comparison`, {
    variation: formattedVariation,
    lastPeriodValue: formatMoney(last_period_value),
  });
});
</script>

<style scoped lang="scss">
$min-height: 112px;

.order-data-cards {
  display: flex;
  gap: $unnnic-space-3;

  &__cards {
    flex: 1;
    display: flex;
    min-height: $min-height;
  }
}
</style>
