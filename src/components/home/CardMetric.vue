<template>
  <section
    class="metric-card"
    data-test-id="metric-card"
    :class="{
      'metric-card--left-column': leftColumn,
      'metric-card--right-column': rightColumn,
      'metric-card--middle-column': middleColumn,
      'metric-card--first-row': firstRow,
      'metric-card--last-row': lastRow,
    }"
  >
    <section class="metric-card__header">
      <p
        class="metric-card__title"
        data-test-id="metric-title"
      >
        {{ title }}
      </p>
      <UnnnicToolTip
        v-if="tooltipInfo"
        enabled
        :text="tooltipInfo"
        side="right"
        class="metric-card__tooltip"
        data-test-id="metric-tooltip"
      >
        <UnnnicIcon
          data-test-id="info-icon"
          class="metric-card__info-icon"
          icon="info"
          size="sm"
          filled
          scheme="neutral-cleanest"
        />
      </UnnnicToolTip>
    </section>

    <section class="metric-card__content">
      <section
        class="metric-card__value"
        data-test-id="metric-value"
      >
        {{ prefix }}{{ formatValue(value, i18n.global.locale) }}
        <p
          class="metric-card__percentage"
          data-test-id="percentage"
          :class="{
            'metric-card__percentage--positive': percentage > 0,
            'metric-card__percentage--negative': percentage < 0,
          }"
        >
          {{ formatPercentage(percentage, i18n.global.locale) }}
          <UnnnicIcon
            v-if="percentage"
            data-test-id="icon-arrow"
            :icon="percentage > 0 ? 'arrow_drop_up' : 'arrow_drop_down'"
            size="sm"
            filled
            :scheme="percentage > 0 ? 'aux-green-500' : 'aux-red-500'"
          />
        </p>
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { formatValue, formatPercentage } from '@/utils/numbers';
import i18n from '@/utils/plugins/i18n';

defineProps({
  leftColumn: {
    type: Boolean,
    required: true,
  },
  rightColumn: {
    type: Boolean,
    required: true,
  },
  middleColumn: {
    type: Boolean,
    required: true,
  },
  firstRow: {
    type: Boolean,
    required: true,
  },
  lastRow: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  tooltipInfo: {
    type: String,
    default: '',
    required: false,
  },
  prefix: {
    type: String,
    required: false,
    default: '',
  },
  value: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.metric-card {
  background: $unnnic-color-neutral-white;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  padding: $unnnic-spacing-sm;
  border-radius: 0;
  margin: -1px 0 0 -1px;

  border-right: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  border-left: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  border-bottom: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;

  &--left-column {
    &.metric-card--first-row {
      border-top-left-radius: $unnnic-border-radius-md;
    }

    &.metric-card--last-row {
      border-bottom-left-radius: $unnnic-border-radius-md;
    }
  }

  &--right-column {
    &.metric-card--first-row {
      border-top-right-radius: $unnnic-border-radius-md;
    }

    &.metric-card--last-row {
      border-bottom-right-radius: $unnnic-border-radius-md;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-xs;
    margin-bottom: $unnnic-spacing-xs;

    :deep(.material-symbols-rounded.unnnic-icon-size--sm) {
      font-size: $unnnic-font-size-body-gt;
    }
  }

  &__title {
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-style: normal;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    color: $unnnic-color-neutral-dark;
    margin: 0;
  }

  &__info-icon {
    cursor: help;
  }

  &__value {
    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-primary;
    font-size: $unnnic-font-size-title-md;
    font-style: normal;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-title-md + $unnnic-line-height-md;
    display: flex;
    align-items: baseline;
    gap: $unnnic-spacing-xs;
  }

  &__percentage {
    display: flex;
    align-items: center;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-md;
    font-style: normal;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
    color: $unnnic-color-neutral-clean;

    &--positive {
      color: $unnnic-color-aux-green-500;
    }

    &--negative {
      color: $unnnic-color-aux-red-500;
    }
  }
}
</style>
