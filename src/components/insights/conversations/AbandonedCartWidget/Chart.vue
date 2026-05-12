<template>
  <section class="abandoned-cart-widget-chart">
    <section
      v-for="(item, index) in chartDataOrdered"
      :key="item.label"
      :class="{
        'abandoned-cart-widget-chart__item': true,
        'abandoned-cart-widget-chart__item--border-left': index !== 0,
      }"
    >
      <section class="abandoned-cart-widget-chart__item__header">
        <section class="abandoned-cart-widget-chart__item__header__content">
          <p class="abandoned-cart-widget-chart__item__label">
            {{ item.label }}
          </p>
          <UnnnicToolTip
            v-if="item.tooltip"
            enabled
            :text="item.tooltip"
          >
            <UnnnicIcon
              icon="help"
              scheme="fg-muted"
              size="ant"
            />
          </UnnnicToolTip>
        </section>
        <p class="abandoned-cart-widget-chart__item__value">
          {{ formatNumber(item.value) }}
        </p>
      </section>
      <section
        class="abandoned-cart-widget-chart__item__bar"
        :style="{
          height: chartBars[index].height,
          width: '100%',
          backgroundColor: chartBars[index].backgroundColor,
          borderRadius: chartBars[index].radios,
        }"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import {
  colorBlue2,
  colorBlue4,
  colorBlue6,
  colorBlue8,
} from '@weni/unnnic-system/tokens/colors';

import i18n from '@/utils/plugins/i18n';
import { formatNumber } from '@/utils/numbers';

defineOptions({
  name: 'AbandonedCartWidgetChart',
});

interface Props {
  data: {
    sent: number;
    delivered: number;
    read: number;
    clicks: number;
  };
}

const { t } = i18n.global;

const props = defineProps<Props>();

const chartDataOrdered = computed(() => {
  return [
    {
      label: t(
        'conversations_dashboard.abandoned_cart_recovery_widget.chart.sent',
      ),
      value: props.data.sent,
    },
    {
      label: t(
        'conversations_dashboard.abandoned_cart_recovery_widget.chart.delivered',
      ),
      value: props.data.delivered,
    },
    {
      label: t(
        'conversations_dashboard.abandoned_cart_recovery_widget.chart.read',
      ),
      value: props.data.read,
      tooltip: t(
        'conversations_dashboard.abandoned_cart_recovery_widget.chart.read_help',
      ),
    },
    {
      label: t(
        'conversations_dashboard.abandoned_cart_recovery_widget.chart.clicks',
      ),
      value: props.data.clicks,
    },
  ];
});

const calcChartBarHeight = (
  value: number,
  maxValue: number = props.data.sent,
) => {
  return `${(value / maxValue) * 60}%`;
};

const chartBars = computed(() => {
  return [
    {
      radios: '4px 4px 0 4px',
      height: calcChartBarHeight(props.data.sent),
      backgroundColor: colorBlue2,
    },
    {
      radios: '0 4px 0 0',
      height: calcChartBarHeight(props.data.delivered),
      backgroundColor: colorBlue4,
    },
    {
      radios: '0 4px 0 0',
      height: calcChartBarHeight(props.data.read),
      backgroundColor: colorBlue6,
    },
    {
      radios: '0 4px 4px 0',
      height: calcChartBarHeight(props.data.clicks),
      backgroundColor: colorBlue8,
    },
  ];
});
</script>

<style scoped lang="scss">
.abandoned-cart-widget-chart {
  display: flex;
  width: 100%;

  &__item {
    width: 100%;
    height: 252px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-self: stretch;

    &--border-left {
      border-left: 1px solid $unnnic-color-blue-1;
    }

    &__header {
      display: flex;
      flex-direction: column;
      gap: $unnnic-space-1;
      padding: 0 $unnnic-space-4;
      &__content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: $unnnic-space-2;
        width: 100%;
      }
    }
    &__label {
      font: $unnnic-font-body;
      color: $unnnic-color-fg-emphasized;
    }
    &__value {
      font: $unnnic-font-display-3;
      color: $unnnic-color-fg-emphasized;
    }
  }
}
</style>
