<template>
  <section class="dashboard-commerce">
    <section class="dashboard-commerce__header">
      <section class="dashboard-commerce__header-title">
        See what's happening in: Commerce
      </section>
      <section class="filter-type">
        <p>{{ $t('filter-by') }}</p>
        <DropdownFilter
          :items="[
            {
              name: 'today',
              action: () => handleFilter('today'),
            },
            {
              name: 'Last 7 days',
              action: () => handleFilter('Last 7 days'),
            },
            {
              name: 'Last week',
              action: () => handleFilter('Last week'),
            },
            {
              name: 'Last month',
              action: () => handleFilter('Last month'),
            },
          ]"
          :defaultItem="{ name: 'Last 7 days' }"
        />
      </section>
    </section>
    <div class="metrics-container">
      <CardMetric
        v-for="(metric, index) in metrics"
        :key="metric.id"
        :title="metric.title"
        :value="metric.value"
        :percentage="metric.percentage"
        :prefix="metric.prefix"
        :hasInfo="metric.hasInfo"
        :leftColumn="index % 3 === 0"
        :rightColumn="(index + 1) % 3 === 0"
        :middleColumn="index % 3 === 1"
        :firstRow="index < 3"
        :lastRow="index >= metrics.length - (metrics.length % 3 || 3)"
      />
    </div>
  </section>
</template>

<script lang="ts" setup>
import CardMetric from '@/components/home/CardMetric.vue';
import DropdownFilter from '@/components/home/DropdownFilter.vue';
import { ref } from 'vue';

interface Metric {
  id: number;
  title: string;
  value: number;
  percentage: number;
  prefix?: string;
  hasInfo?: boolean;
}

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

const handleFilter = (filter: string) => {
  console.log(filter);
};
</script>

<style lang="scss" scoped>
.dashboard-commerce {
  display: flex;
  flex-direction: column;

  &__header {
    display: flex;
    justify-content: space-between;
    width: 100%;

    &-title {
      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-lg;
      font-style: normal;
      font-weight: $unnnic-font-weight-black;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
    }
  }
}

.metrics-container {
  display: grid;
  grid-template-columns: repeat(3, minmax(250px, 1fr));
  padding: $unnnic-spacing-sm 1px;
}

.filter-type {
  display: flex;
  align-items: center;
  gap: $unnnic-spacing-sm;
  p {
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }
}
</style>
