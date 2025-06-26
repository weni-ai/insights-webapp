<template>
  <section class="queue-service-widget">
    <p class="queue-service-widget-title">Atendimentos por filas</p>
    <NativeBarChart
      :data="[
        { label: 'Fila 1', value: 10 },
        { label: 'Fila 2', value: 20 },
        { label: 'Fila 3', value: 30 },
        { label: 'Fila 4', value: 40 },
        { label: 'Fila 5', value: 50 },
        { label: 'Fila 6', value: 50 },
      ]"
      :isLoading="isLoading"
      :seeMore="true"
      @see-more="handleSeeMore"
    />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import NativeBarChart from '@/components/insights/charts/NativeBarChart.vue';

const isLoading = ref(false);

const handleSeeMore = () => {
  console.log('see more');
};
</script>

<style lang="scss" scoped>
.queue-service-widget {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-md;
  justify-content: start;
  width: 100%;
  height: 100%;
  padding: $unnnic-spacing-md;
  border-radius: $unnnic-border-radius-md;
  border: 1px solid $unnnic-color-neutral-soft;
  background-color: $unnnic-color-neutral-white;

  &-title {
    font-size: $unnnic-font-size-title-md;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-dark;
  }
}
</style>
