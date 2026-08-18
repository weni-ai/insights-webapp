<template>
  <section class="ctwa-dashboard">
    <LazyWidget>
      <MetricCards />
    </LazyWidget>
    <LazyWidget>
      <SalesFunnel />
    </LazyWidget>
  </section>
</template>

<script setup lang="ts">
import MetricCards from '@/components/insights/ctwa/MetricCards.vue';
import SalesFunnel from '@/components/insights/ctwa/SalesFunnel.vue';
import LazyWidget from '@/components/insights/Layout/LazyWidget.vue';

defineOptions({
  name: 'CTWADashboard',
});
</script>

<style lang="scss" scoped>
.ctwa-dashboard {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-6;
}
</style>
