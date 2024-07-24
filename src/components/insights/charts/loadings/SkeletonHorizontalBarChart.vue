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

const BAR_HEIGHT = 48;

const props = defineProps({
  width: { type: Number, required: true },
  height: { type: Number, required: true },
});

const generateRandomWidth = () => {
  return `${Math.random() * (props.width - 150) + 100}px`;
};

const totalBars = computed(() => parseInt(props.height / BAR_HEIGHT) || 14);
</script>

<style lang="scss" scoped>
.skeleton-h-bar-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-nano;
  overflow: hidden;
  &__bar {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-sm;
  }
}
</style>
