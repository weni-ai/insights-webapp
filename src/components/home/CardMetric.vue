<template>
  <section
    class="metric-card"
    :class="{
      'left-column': leftColumn,
      'right-column': rightColumn,
      'middle-column': middleColumn,
      'first-row': firstRow,
      'last-row': lastRow,
    }"
  >
    <section class="metric-header">
      <p class="metric-title">{{ title }}</p>
      <UnnnicIcon
        v-if="hasInfo"
        class="info-icon"
        icon="info"
        size="sm"
        filled
        scheme="neutral-cleanest"
      />
    </section>

    <section class="metric-content">
      <section class="metric-value">
        {{ prefix }}{{ formatValue(value) }}
        <p
          class="percentage"
          :class="{
            positive: percentage > 0,
            negative: percentage < 0,
          }"
        >
          {{ formatPercentage(percentage) }}
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
  background: white;
  border: 1px solid #e5e7eb;
  padding: 1rem;
  transition: all 0.2s ease;
  border-radius: 0;
  margin: -1px 0 0 -1px;

  border-right: 1px solid #e5e7eb;
  border-left: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;

  &.left-column {
    &.first-row {
      border-top-left-radius: 8px;
    }

    &.last-row {
      border-bottom-left-radius: 8px;
    }
  }

  &.right-column {
    &.first-row {
      border-top-right-radius: 8px;
    }

    &.last-row {
      border-bottom-right-radius: 8px;
    }
  }

  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    z-index: 1;
  }
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.metric-title {
  color: #6b7280;
  font-size: 0.875rem;
}

.info-icon {
  cursor: help;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.percentage {
  font-size: 0.875rem;
  font-weight: 500;
  color: $unnnic-color-neutral-clean;

  &.positive {
    color: #10b981;
  }

  &.negative {
    color: #ef4444;
  }
}
</style>
