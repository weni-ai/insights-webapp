<template>
  <section
    class="stepped-bar-chart"
    data-testid="stepped-bar-chart"
  >
    <section
      v-for="(item, index) in items"
      :key="item.id"
      :class="{
        'stepped-bar-chart__item': true,
        'stepped-bar-chart__item--border-left': index !== 0,
      }"
      :data-testid="`stepped-bar-chart-item-${item.id}`"
      :data-border-left="index !== 0 ? 'true' : undefined"
    >
      <section class="stepped-bar-chart__item__header">
        <section class="stepped-bar-chart__item__header__content">
          <p
            class="stepped-bar-chart__item__label"
            :data-testid="`stepped-bar-chart-label-${item.id}`"
          >
            {{ item.label }}
          </p>
          <UnnnicToolTip
            v-if="item.tooltip"
            enabled
            :text="item.tooltip"
            :data-testid="`stepped-bar-chart-tooltip-${item.id}`"
          >
            <UnnnicIcon
              icon="help"
              scheme="fg-muted"
              size="ant"
            />
          </UnnnicToolTip>
        </section>
        <p
          class="stepped-bar-chart__item__value"
          :data-testid="`stepped-bar-chart-value-${item.id}`"
        >
          <span>{{ item.displayValue ?? formatNumber(item.value) }}</span>
          <span
            v-if="item.displaySecondary"
            class="stepped-bar-chart__item__value-secondary"
          >
            | {{ item.displaySecondary }}
          </span>
        </p>
      </section>
      <section
        class="stepped-bar-chart__item__bar"
        :data-testid="`stepped-bar-chart-bar-${item.id}`"
        :style="{
          height: getBarHeight(item.value),
          width: '100%',
          backgroundColor: item.backgroundColor,
          borderRadius: getBarBorderRadius(index, items.length),
        }"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { formatNumber } from '@/utils/numbers';

defineOptions({
  name: 'SteppedBarChart',
});

export interface FunnelChartItem {
  id: string;
  label: string;
  value: number;
  displayValue?: string;
  displaySecondary?: string;
  tooltip?: string;
  backgroundColor: string;
}

interface Props {
  items: FunnelChartItem[];
}

const props = defineProps<Props>();

const getBarHeight = (value: number) => {
  const maxValue = props.items[0]?.value || 0;

  if (!maxValue) return '0%';

  return `${(value / maxValue) * 60}%`;
};

const getBarBorderRadius = (index: number, total: number) => {
  if (index === 0) return '4px 4px 0 4px';
  if (index === total - 1) return '0 4px 4px 0';
  return '0 4px 0 0';
};
</script>

<style scoped lang="scss">
.stepped-bar-chart {
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

    &__value-secondary {
      font: $unnnic-font-caption-2;
      color: $unnnic-color-fg-base;
    }
  }
}
</style>
