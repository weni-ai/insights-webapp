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

<script>
export default {
  name: 'SkeletonBarChart',
};
</script>

<script setup>
import { computed } from 'vue';

const BAR_WIDTH = 48;

const props = defineProps({
  width: { type: Number, required: true },
  height: { type: Number, required: true },
});

const generateRandomHeight = () => {
  const minHeight = 100;
  return `${Math.random() * (props.height - minHeight) + minHeight}px`;
};

const totalBars = computed(() => parseInt(props.width / BAR_WIDTH) || 36);
</script>

<style lang="scss" scoped>
.skeleton-bar-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  gap: $unnnic-spacing-nano;
  &__bar {
    display: flex;
    flex-direction: column;
    justify-content: end;
    gap: $unnnic-spacing-nano;
    max-height: 100%;
  }
}
</style>
