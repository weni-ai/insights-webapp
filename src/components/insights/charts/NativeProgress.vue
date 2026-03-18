<template>
  <div class="native-progress">
    <UnnnicToolTip
      class="native-progress__tooltip"
      enableHtml
      :enabled="!!tooltip"
      :text="tooltip"
      side="top"
    >
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
    </UnnnicToolTip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { UnnnicToolTip } from '@weni/unnnic-system';
import { colorBlue500, colorGray50 } from '@weni/unnnic-system/tokens/colors';

interface Props {
  progress: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  tooltip?: string;
  maxProgressValue?: number;
}

const props = withDefaults(defineProps<Props>(), {
  progress: 0,
  color: colorBlue500,
  backgroundColor: colorGray50,
  height: 8,
  tooltip: '',
  maxProgressValue: 100,
});

const normalizedProgress = computed(() => {
  const progress = Math.max(
    0,
    Math.min(props.maxProgressValue, props.progress),
  );
  if (props.maxProgressValue <= 0) return 0;
  return Math.min(100, (progress / props.maxProgressValue) * 100);
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
  display: grid;

  &__bar {
    height: 100%;
    border-radius: inherit;
    transition: width 0.3s ease-in-out;
    position: relative;
  }
}
</style>
