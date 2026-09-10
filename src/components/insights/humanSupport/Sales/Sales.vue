<template>
  <section class="sales">
    <LazyWidget>
      <OrderDataCards data-testid="order-data-cards" />
    </LazyWidget>
  </section>
</template>

<script lang="ts" setup>
import LazyWidget from '@/components/insights/Layout/LazyWidget.vue';
import OrderDataCards from './OrderDataCards.vue';

defineOptions({
  name: 'SalesView',
});
</script>

<style lang="scss" scoped>
.sales {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-8;
}
</style>
