<template>
  <section
    v-if="totalBars"
    class="skeleton-h-bar-container"
  >
    <section
      v-for="n in totalBars"
      :key="n"
      class="skeleton-h-bar-container__bar"
    >
      <UnnnicSkeletonLoading
        width="100px"
        height="10px"
      />
      <UnnnicSkeletonLoading
        :width="generateRandomWidth()"
        height="46px"
      />
    </section>
  </section>
</template>

<script>
export default {
  name: 'SkeletonHorizontalBarChart',
};
</script>

<script setup>
import { computed } from 'vue';
import { useWindowSize } from '@vueuse/core';
const BAR_HEIGHT = 48;
const { width, height } = useWindowSize();

const generateRandomWidth = () => {
  return `${Math.random() * (width.value - 100) + 100}px`;
};

const totalBars = computed(
  () => parseInt((height.value - 220) / BAR_HEIGHT) || 14,
);
</script>

<style lang="scss" scoped>
.skeleton-h-bar-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-nano;
  &__bar {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-sm;
  }
}
</style>
