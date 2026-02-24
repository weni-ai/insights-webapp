<template>
  <section class="sales-funnel-widget">
    <WarningMessage
      v-if="isEmptyData"
      :title="$t('conversations_dashboard.no_data_available')"
    />
    <section class="sales-funnel-widget__count-container">
      <section class="sales-funnel-widget__count-container-item">
        <h2 class="sales-funnel-widget__count-container-item-title">
          {{ $t('conversations_dashboard.sales_funnel_widget.total_orders') }}
        </h2>
        <p class="sales-funnel-widget__count-container-item-value">
          {{
            formatNumber(
              salesFunnelWidgetData?.total_orders || 0,
              i18n.global.locale,
            )
          }}
        </p>
      </section>
      <section class="sales-funnel-widget__count-container-item">
        <h2 class="sales-funnel-widget__count-container-item-title">
          {{ $t('conversations_dashboard.sales_funnel_widget.total_value') }}
        </h2>
        <p class="sales-funnel-widget__count-container-item-value">
          {{
            formatCurrency(
              (salesFunnelWidgetData?.total_value || 0) / 100,
              currencySymbols[salesFunnelWidgetData?.currency || 'USD'],
              i18n.global.locale,
            )
          }}
        </p>
      </section>
      <section class="sales-funnel-widget__count-container-item">
        <h2 class="sales-funnel-widget__count-container-item-title">
          {{ $t('conversations_dashboard.sales_funnel_widget.average_ticket') }}
        </h2>
        <p class="sales-funnel-widget__count-container-item-value">
          {{
            formatCurrency(
              (salesFunnelWidgetData?.average_ticket || 0) / 100,
              currencySymbols[salesFunnelWidgetData?.currency || 'USD'],
              i18n.global.locale,
            )
          }}
        </p>
      </section>
    </section>
    <UnnnicChartFunnel
      :data="graphData"
      class="sales-funnel-widget__graph"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useConversationalWidgets } from '@/store/modules/conversational/widgets';
import { UnnnicChartFunnel } from '@weni/unnnic-system';
import WarningMessage from '@/components/WarningMessage.vue';
import { currencySymbols } from '@/utils/currency';
import {
  formatPercentage,
  formatNumber,
  formatCurrency,
} from '@/utils/numbers';
import i18n from '@/utils/plugins/i18n';
import {
  colorOrange500,
  colorOrange200,
} from '@weni/unnnic-system/tokens/colors';

defineOptions({
  name: 'SalesFunnelWidget',
});

const { salesFunnelWidgetData } = useConversationalWidgets();

const isEmptyData = computed(() => {
  const {
    captured_leads,
    purchases_made,
    total_orders,
    total_value,
    average_ticket,
  } = salesFunnelWidgetData || {};
  return [
    captured_leads?.full_value || 0,
    purchases_made?.full_value || 0,
    total_orders || 0,
    total_value || 0,
    average_ticket || 0,
  ].every((value) => value === 0);
});

const barDisplay = computed(() => {
  return isEmptyData.value ? 'none' : 'block';
});

const graphData = computed(() => {
  const leadsData = {
    title: formatPercentage(
      salesFunnelWidgetData?.captured_leads?.value || 0,
      i18n.global.locale,
    ),
    value: formatNumber(
      salesFunnelWidgetData?.captured_leads?.full_value,
      i18n.global.locale,
    ),
    description: i18n.global.t(
      'conversations_dashboard.sales_funnel_widget.captured_leads',
    ),
    color: colorOrange500,
  };
  const purchasesData = {
    title: formatPercentage(
      salesFunnelWidgetData?.purchases_made?.value || 0,
      i18n.global.locale,
    ),
    value: formatNumber(
      salesFunnelWidgetData?.purchases_made?.full_value,
      i18n.global.locale,
    ),
    description: i18n.global.t(
      'conversations_dashboard.sales_funnel_widget.purchases_made',
    ),
    color: colorOrange200,
  };
  return [leadsData, purchasesData];
});
</script>

<style lang="scss" scoped>
// This deep is used to hide the graph bars if they have zero values
:deep(.sales-funnel-widget__graph) {
  .unnnic-chart-funnel-base-item {
    .w-60 {
      display: v-bind(barDisplay);
    }
    .w-50 {
      display: v-bind(barDisplay);
    }
  }
}
.sales-funnel-widget {
  display: flex;
  flex-direction: column;
  flex: 1 0 0;
  gap: $unnnic-space-4;

  &__count-container {
    display: flex;
    justify-content: space-between;
    padding: $unnnic-space-6;
    width: 100%;

    border-radius: $unnnic-border-radius-md;
    border: 1px solid $unnnic-color-neutral-soft;
    background: $unnnic-color-bg-base;

    &-item {
      display: flex;
      flex-direction: column;
      gap: $unnnic-space-2;

      &-title {
        font: $unnnic-font-display-4;
        color: $unnnic-color-fg-emphasized;
      }
      &-value {
        font: $unnnic-font-display-1;
        color: $unnnic-color-fg-emphasized;
      }
    }
  }
}
</style>
