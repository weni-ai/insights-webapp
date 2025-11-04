<template>
  <section class="analysis">
    <StatusCards data-testid="status-cards" />
    <ServicesOpenByHour data-testid="services-open-by-hour" />
    <DetailedAnalysis data-testid="detailed-analysis" />
    <NewsHumanSupportModal
      :modelValue="true"
      type="analysis"
    />
  </section>
</template>

<script setup lang="ts">
import StatusCards from './StatusCards.vue';
import ServicesOpenByHour from './ServicesOpenByHour.vue';
import DetailedAnalysis from './DetailedAnalysis.vue';
import NewsHumanSupportModal from '../Common/Modals/NewsHumanSupportModal.vue';
</script>

<style scoped lang="scss">
.analysis {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-8;
}
</style>
