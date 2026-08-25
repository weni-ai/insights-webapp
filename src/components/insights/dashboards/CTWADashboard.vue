<template>
  <section class="ctwa-dashboard">
    <LazyWidget>
      <MetricCards />
    </LazyWidget>
    <LazyWidget>
      <SalesFunnel />
    </LazyWidget>
    <LazyWidget v-if="!selectedCampaign">
      <PerformanceByCampaign />
    </LazyWidget>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';

import MetricCards from '@/components/insights/ctwa/MetricCards.vue';
import PerformanceByCampaign from '@/components/insights/ctwa/PerformanceByCampaign.vue';
import SalesFunnel from '@/components/insights/ctwa/SalesFunnel.vue';
import LazyWidget from '@/components/insights/Layout/LazyWidget.vue';
import { useCTWA } from '@/store/modules/ctwa';

defineOptions({
  name: 'CTWADashboard',
});

const { selectedCampaign } = storeToRefs(useCTWA());
</script>

<style lang="scss" scoped>
.ctwa-dashboard {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-6;
}
</style>
