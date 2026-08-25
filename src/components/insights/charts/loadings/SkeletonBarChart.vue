<template>
  <section class="skeleton-bar-container">
    <section
      v-for="n in totalBars"
      :key="n"
      class="skeleton-bar-container__bar"
    >
      <UnnnicSkeletonLoading
        :width="`${BAR_WIDTH}px`"
        :height="generateRandomHeight()"
      />
      <UnnnicSkeletonLoading
        :width="`${BAR_WIDTH}px`"
        height="12px"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'SkeletonBarChart' });

interface SkeletonBarChartProps {
  width: number;
  height: number;
}

const BAR_WIDTH = 48;

const props = defineProps<SkeletonBarChartProps>();

const generateRandomHeight = () => {
  const minHeight = 100;
  return `${Math.random() * (props.height - minHeight) + minHeight}px`;
};

const totalBars = computed(
  () => Number.parseInt(String(props.width / BAR_WIDTH)) || 36,
);
</script>

<style lang="scss" scoped>
.skeleton-bar-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  gap: $unnnic-space-1;
  &__bar {
    display: flex;
    flex-direction: column;
    justify-content: end;
    gap: $unnnic-space-1;
    max-height: 100%;
  }
}
</style>
