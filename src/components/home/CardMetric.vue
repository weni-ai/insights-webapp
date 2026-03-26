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
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { formatValue } from '@/utils/numbers';
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
});
</script>

<style lang="scss" scoped>
.metric-card {
  background: $unnnic-color-gray-0;
  border: 1px solid $unnnic-color-gray-2;
  padding: $unnnic-space-4;
  border-radius: 0;
  margin: -1px 0 0 -1px;

  border-right: 1px solid $unnnic-color-gray-2;
  border-left: 1px solid $unnnic-color-gray-2;
  border-bottom: 1px solid $unnnic-color-gray-2;

  &--left-column {
    &.metric-card--first-row {
      border-top-left-radius: $unnnic-radius-2;
    }

    &.metric-card--last-row {
      border-bottom-left-radius: $unnnic-radius-2;
    }
  }

  &--right-column {
    &.metric-card--first-row {
      border-top-right-radius: $unnnic-radius-2;
    }

    &.metric-card--last-row {
      border-bottom-right-radius: $unnnic-radius-2;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    gap: $unnnic-space-2;
    margin-bottom: $unnnic-space-2;

    :deep(.material-symbols-rounded.unnnic-icon-size--sm) {
      font-size: 14px;
    }
  }

  &__title {
    font: $unnnic-font-body;
    color: $unnnic-color-gray-10;
    margin: 0;
  }

  &__info-icon {
    cursor: help;
  }

  &__value {
    color: $unnnic-color-gray-12;
    font: $unnnic-font-display-1;
    display: flex;
    align-items: baseline;
    gap: $unnnic-space-2;
  }
}
</style>
