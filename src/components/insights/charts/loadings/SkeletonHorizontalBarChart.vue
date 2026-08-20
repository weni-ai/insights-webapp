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

<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'SkeletonHorizontalBarChart' });

interface SkeletonHorizontalBarChartProps {
  width: number;
  height: number;
}

const BAR_HEIGHT = 48;

const props = defineProps<SkeletonHorizontalBarChartProps>();

const generateRandomWidth = () => {
  return `${Math.random() * (props.width - 150) + 100}px`;
};

const totalBars = computed(
  () => Number.parseInt(String(props.height / BAR_HEIGHT)) || 14,
);
</script>

<style lang="scss" scoped>
.skeleton-h-bar-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-1;
  overflow: hidden;
  &__bar {
    display: flex;
    align-items: center;
    gap: $unnnic-space-4;
  }
}
</style>
