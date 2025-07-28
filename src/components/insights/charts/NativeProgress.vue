<template>
  <section
    class="native-progress"
    :style="containerStyles"
    data-testid="native-progress"
  >
    <section
      class="native-progress__bar"
      :style="progressBarStyles"
      data-testid="native-progress-bar"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  progress: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  progress: 0,
  color: '#007bff',
  backgroundColor: '#e9ecef',
  height: 8,
});

const normalizedProgress = computed(() => {
  return Math.max(0, Math.min(100, props.progress));
});

const containerStyles = computed(() => ({
  backgroundColor: props.backgroundColor,
  height: `${props.height}px`,
}));

const progressBarStyles = computed(() => ({
  width: `${normalizedProgress.value}%`,
  backgroundColor: props.color,
}));
</script>

<style scoped lang="scss">
.native-progress {
  width: 100%;
  border-radius: $unnnic-border-radius-sm;
  overflow: hidden;
  position: relative;

  &__bar {
    height: 100%;
    border-radius: inherit;
    transition: width 0.3s ease-in-out;
    position: relative;
  }
}
</style>
