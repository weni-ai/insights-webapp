<template>
  <section
    class="abandoned-cart-widget-info-card"
    data-testid="abandoned-cart-widget-info-card"
  >
    <section class="abandoned-cart-widget-info-card__header">
      <section class="abandoned-cart-widget-info-card__recovery-revenue__data">
        <p class="abandoned-cart-widget-info-card__item__label">
          {{
            $t(
              'conversations_dashboard.abandoned_cart_recovery_widget.info_card.recovery_revenue',
            )
          }}
        </p>
        <p
          class="abandoned-cart-widget-info-card__item__value--display-1"
          data-testid="abandoned-cart-widget-info-card-recovery-revenue"
        >
          {{
            `${props.data.currency} ${formatNumber(props.data.recoveryRevenue)}`
          }}
        </p>
      </section>
      <section class="abandoned-cart-widget-info-card__roas">
        <p
          class="abandoned-cart-widget-info-card__roas__value"
          data-testid="abandoned-cart-widget-info-card-roas"
        >
          RoAS: {{ formatNumber(roas) }}x
        </p>
        <UnnnicToolTip
          enabled
          data-testid="abandoned-cart-widget-info-card-roas-tooltip"
          :text="
            $t(
              'conversations_dashboard.abandoned_cart_recovery_widget.info_card.roas_tooltip',
            )
          "
        >
          <UnnnicIcon
            icon="help"
            size="ant"
            scheme="fg-muted"
          />
        </UnnnicToolTip>
      </section>
    </section>
    <section class="abandoned-cart-widget-info-card__content">
      <section class="abandoned-cart-widget-info-card__item">
        <p class="abandoned-cart-widget-info-card__item__label">
          {{
            $t(
              'conversations_dashboard.abandoned_cart_recovery_widget.info_card.total_sends',
            )
          }}
        </p>
        <p
          class="abandoned-cart-widget-info-card__item__value"
          data-testid="abandoned-cart-widget-info-card-total-sends"
        >
          {{ formatNumber(props.data.totalSends) }}
        </p>
      </section>
      <section class="abandoned-cart-widget-info-card__item">
        <p class="abandoned-cart-widget-info-card__item__label">
          {{
            $t(
              'conversations_dashboard.abandoned_cart_recovery_widget.info_card.converted_sales',
            )
          }}
        </p>
        <p
          class="abandoned-cart-widget-info-card__item__value"
          data-testid="abandoned-cart-widget-info-card-converted-sales"
        >
          {{ formatNumber(props.data.convertedSales) }}
        </p>
      </section>
    </section>
    <section class="abandoned-cart-widget-info-card__content">
      <section class="abandoned-cart-widget-info-card__item">
        <p class="abandoned-cart-widget-info-card__item__label">
          {{
            $t(
              'conversations_dashboard.abandoned_cart_recovery_widget.info_card.conversion_rate',
            )
          }}
        </p>
        <p
          class="abandoned-cart-widget-info-card__item__value"
          data-testid="abandoned-cart-widget-info-card-conversion-rate"
        >
          {{ formatPercentage(conversionRate) }}
        </p>
      </section>
      <section class="abandoned-cart-widget-info-card__item">
        <p class="abandoned-cart-widget-info-card__item__label">
          {{
            $t(
              'conversations_dashboard.abandoned_cart_recovery_widget.info_card.average_order_value',
            )
          }}
        </p>
        <p
          class="abandoned-cart-widget-info-card__item__value"
          data-testid="abandoned-cart-widget-info-card-average-order-value"
        >
          {{
            `${props.data.currency} ${formatNumber(Number(averageOrderValue))}`
          }}
        </p>
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { useProject } from '@/store/modules/project';

import { formatNumber, formatPercentage } from '@/utils/numbers';
import { storeToRefs } from 'pinia';

const projectStore = useProject();
const { abandonedCartRecoveryCost } = storeToRefs(projectStore);

defineOptions({
  name: 'AbandonedCartWidgetInfoCard',
});

interface Props {
  data: {
    currency: string;
    recoveryRevenue: number;
    totalSends: number;
    convertedSales: number;
  };
}

const props = defineProps<Props>();

const conversionRate = computed(() => {
  return (props.data.convertedSales / props.data.totalSends) * 100;
});

const averageOrderValue = computed(() => {
  const value = Number(
    props.data.recoveryRevenue / props.data.convertedSales,
  ).toFixed(2);

  if (isNaN(Number(value))) {
    return 0;
  }

  return value;
});

const cost = props.data.totalSends * abandonedCartRecoveryCost.value || 0;

const roas = cost > 0 ? props.data.recoveryRevenue / cost : 0;
</script>

<style scoped lang="scss">
.abandoned-cart-widget-info-card {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;
  padding: $unnnic-space-6;

  border-radius: $unnnic-radius-2;
  border: 1px solid $unnnic-color-border-base;
  background-color: $unnnic-color-bg-base;

  &__header {
    display: flex;
    justify-content: space-between;
  }

  &__content {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  &__roas {
    display: flex;
    padding: $unnnic-space-1 $unnnic-space-2;
    gap: $unnnic-space-1;
    height: fit-content;

    border-radius: $unnnic-radius-1;
    background: $unnnic-color-bg-success;

    &__value {
      font: $unnnic-font-emphasis;
      color: $unnnic-color-fg-success;
    }
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;

    &__label {
      font: $unnnic-font-body;
      color: $unnnic-color-fg-emphasized;
    }

    &__value {
      font: $unnnic-font-display-2;
      color: $unnnic-color-fg-emphasized;

      &--display-1 {
        font: $unnnic-font-display-1;
        color: $unnnic-color-fg-emphasized;
      }
    }
  }
}
</style>
