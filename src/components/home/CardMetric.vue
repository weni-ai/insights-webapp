<template>
  <section
    class="metric-card"
    data-test-id="metric-card"
    :class="{
      'left-column': leftColumn,
      'right-column': rightColumn,
      'middle-column': middleColumn,
      'first-row': firstRow,
      'last-row': lastRow,
    }"
  >
    <section class="metric-header">
      <p
        class="metric-title"
        data-test-id="metric-title"
      >
        {{ title }}
      </p>
      <UnnnicIcon
        v-if="hasInfo"
        data-test-id="info-icon"
        class="info-icon"
        icon="info"
        size="sm"
        filled
        scheme="neutral-cleanest"
      />
    </section>

    <section class="metric-content">
      <section
        class="metric-value"
        data-test-id="metric-value"
      >
        {{ prefix }}{{ formatValue(value) }}
        <p
          class="percentage"
          data-test-id="percentage"
          :class="{
            positive: percentage > 0,
            negative: percentage < 0,
          }"
        >
          {{ formatPercentage(percentage) }}
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
  hasInfo: {
    type: Boolean,
    required: true,
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

const formatValue = (value: number): string => {
  if (value % 1 === 0) return value.toLocaleString();
  return value.toFixed(2).replace('.', ',');
};

const formatPercentage = (value: number): string => {
  if (value === 0) return '0%';
  return `${Math.abs(value).toFixed(2)}%`;
};
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

  &.left-column {
    &.first-row {
      border-top-left-radius: $unnnic-border-radius-md;
    }

    &.last-row {
      border-bottom-left-radius: $unnnic-border-radius-md;
    }
  }

  &.right-column {
    &.first-row {
      border-top-right-radius: $unnnic-border-radius-md;
    }

    &.last-row {
      border-bottom-right-radius: $unnnic-border-radius-md;
    }
  }
}

.metric-header {
  display: flex;
  align-items: center;
  gap: $unnnic-spacing-xs;
  margin-bottom: $unnnic-spacing-xs;

  :deep(.material-symbols-rounded.unnnic-icon-size--sm) {
    font-size: $unnnic-font-size-body-gt;
  }
}

.metric-title {
  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-gt;
  font-style: normal;
  font-weight: $unnnic-font-weight-regular;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  color: $unnnic-color-neutral-dark;
}

.info-icon {
  cursor: help;
}

.metric-value {
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

.percentage {
  display: flex;
  align-items: center;
  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-md;
  font-style: normal;
  font-weight: $unnnic-font-weight-bold;
  line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
  color: $unnnic-color-neutral-clean;

  &.positive {
    color: $unnnic-color-aux-green-500;
  }

  &.negative {
    color: $unnnic-color-aux-red-500;
  }
}
</style>
