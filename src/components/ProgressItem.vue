<template>
  <section class="progress-item">
    <section class="progress-item__container">
      <p class="progress-item__text">{{ text }}</p>
    </section>
    <section class="progress-item__progress">
      <NativeProgress
        :progress="value"
        :backgroundColor="backgroundColor"
        :progressColor="progressColor"
      />
      <p class="progress-item__progress__value">{{ value }}%</p>
    </section>
  </section>
</template>

<script setup lang="ts">
import NativeProgress from './insights/charts/NativeProgress.vue';

defineProps<{
  text: string;
  value: number;
  progressColor?: string;
  backgroundColor?: string;
}>();
</script>

<style scoped lang="scss">
.progress-item {
  display: flex;
  gap: $unnnic-spacing-xs;
  justify-content: space-between;
  padding: $unnnic-spacing-sm 0;
  align-items: center;
  align-self: stretch;

  &__container {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    height: 100%;
  }

  &__text {
    flex: 2;
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-shrink: 0;
    align-items: center;
    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-lg;
    font-style: normal;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
  }

  &__progress {
    flex: 8;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $unnnic-spacing-xs;

    &__value {
      width: 50px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      color: $unnnic-color-neutral-dark;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-lg;
      font-style: normal;
      font-weight: $unnnic-font-weight-bold;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
    }
  }
}
</style>
