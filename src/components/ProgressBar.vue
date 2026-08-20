<template>
  <section class="progress-bar-container">
    <UnnnicProgressBar
      v-model="progress"
      data-test-id="progress-bar"
      inline
      :title="title"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

defineOptions({ name: 'ProgressBar' });

interface ProgressBarProps {
  title?: string;
  timeInterval?: number;
}

const props = withDefaults(defineProps<ProgressBarProps>(), {
  title: '',
  timeInterval: 50,
});

const emit = defineEmits<{
  'progress-complete': [];
}>();

const progress = ref(0);
let interval: ReturnType<typeof setInterval> | null = null;

const updateProgress = () => {
  progress.value === 100 ? emit('progress-complete') : (progress.value += 1);
};

const startProgressBar = () => {
  progress.value = 0;
  interval = setInterval(updateProgress, props.timeInterval);
};

onMounted(() => {
  setTimeout(startProgressBar, 2000);
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<style lang="scss" scoped>
.progress-bar-container {
  position: absolute;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999999;
  background-color: rgba(0, 0, 0, 0.4);
  top: 0;
  left: 0;
}
</style>
