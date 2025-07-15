<template>
  <section
    class="progress-item"
    data-testid="progress-item"
  >
    <p
      class="progress-item__text"
      data-testid="progress-item-text"
    >
      {{ text }}
    </p>
    <section
      class="progress-item__progress"
      data-testid="progress-item-progress"
    >
      <NativeProgress
        :progress="value"
        :backgroundColor="backgroundColor"
        :progressColor="progressColor"
        data-testid="progress-item-native-progress"
      />
      <p
        class="progress-item__progress__value"
        data-testid="progress-item-value"
      >
        {{ value }}%
      </p>
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

  &__text {
    flex: 2;
    width: 180px;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    align-items: flex-start;
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
      width: 40px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: end;
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
