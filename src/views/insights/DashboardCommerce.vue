<template>
  <section class="dashboard-commerce">
    <section class="dashboard-commerce__header">
      <section>See what's happening in:</section>
      <section>Filter</section>
    </section>
    <div class="metrics-container">
      <div
        v-for="(metric, index) in metrics"
        :key="metric.id"
        class="metric-card"
        :class="{
          'left-column': index % 3 === 0,
          'right-column': (index + 1) % 3 === 0,
          'middle-column': index % 3 === 1,
          'first-row': index < 3,
          'last-row': index >= metrics.length - (metrics.length % 3 || 3),
        }"
      >
        <div class="metric-header">
          <span class="metric-title">{{ metric.title }}</span>
          <UnnnicIcon
            v-if="metric.hasInfo"
            class="info-icon"
            icon="info"
            size="sm"
            filled
            scheme="neutral-cleanest"
          />
        </div>

        <div class="metric-content">
          <div class="metric-value">
            {{ metric.prefix }}{{ formatValue(metric.value) }}
            <span
              class="percentage"
              :class="{
                positive: metric.percentage > 0,
                negative: metric.percentage < 0,
              }"
            >
              {{ formatPercentage(metric.percentage) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

interface Metric {
  id: number;
  title: string;
  value: number;
  percentage: number;
  prefix?: string;
  hasInfo?: boolean;
}

export default defineComponent({
  name: 'MetricCard',
  setup() {
    const metrics = ref<Metric[]>([
      {
        id: 1,
        title: 'Sent messages',
        value: 1325,
        percentage: 5.08,
        hasInfo: true,
      },
      {
        id: 2,
        title: 'Delivered messages',
        value: 1259,
        percentage: -1.12,
        hasInfo: true,
      },
      {
        id: 3,
        title: 'Readed messages',
        value: 956,
        percentage: -2.08,
        hasInfo: true,
      },
      {
        id: 4,
        title: 'Interactions',
        value: 569,
        percentage: 6.13,
        hasInfo: true,
      },
      {
        id: 5,
        title: 'UTM revenue',
        value: 44566.0,
        percentage: 12.2,
        prefix: 'R$ ',
        hasInfo: true,
      },
      {
        id: 6,
        title: 'Orders placed',
        value: 86,
        percentage: 0,
        hasInfo: true,
      },
    ]);

    const formatValue = (value: number): string => {
      if (value % 1 === 0) {
        return value.toLocaleString();
      }
      return value.toFixed(2).replace('.', ',');
    };

    const formatPercentage = (value: number): string => {
      if (value === 0) return '0%';
      return `${Math.abs(value).toFixed(2)}%`;
    };

    return {
      metrics,
      formatValue,
      formatPercentage,
    };
  },
});
</script>

<style lang="scss" scoped>
.dashboard-commerce {
  display: flex;
  flex-direction: column;

  &__header {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
}

.metrics-container {
  display: grid;
  grid-template-columns: repeat(3, minmax(250px, 1fr));
  padding: 1rem 1px;
}

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
