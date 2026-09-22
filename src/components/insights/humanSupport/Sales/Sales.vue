<template>
  <section class="sales-view">
    <LazyWidget>
      <OrderDataCards data-testid="order-data-cards" />
    </LazyWidget>
    <section class="sales-view__2-col">
      <LazyWidget>
        <SalesFunnel data-testid="sales-funnel" />
      </LazyWidget>
      <LazyWidget>
        <SalesPerChannel data-testid="sales-per-channel" />
      </LazyWidget>
    </section>
    <LazyWidget>
      <PerformanceTable data-testid="performance-table" />
    </LazyWidget>
  </section>
</template>

<script lang="ts" setup>
import LazyWidget from '@/components/insights/Layout/LazyWidget.vue';
import OrderDataCards from './OrderDataCards.vue';
import SalesFunnel from './SalesFunnel.vue';
import SalesPerChannel from './SalesPerChannel.vue';
import PerformanceTable from './PerformanceTable.vue';

defineOptions({
  name: 'SalesView',
});
</script>

<style lang="scss" scoped>
.sales-view {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-6;

  &__2-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $unnnic-space-6;
  }
}
</style>
