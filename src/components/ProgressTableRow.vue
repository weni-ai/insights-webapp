<template>
  <tr
    class="progress-table-row"
    data-testid="progress-table-row"
  >
    <td
      class="progress-table-row__text"
      data-testid="progress-table-row-text"
    >
      {{ label }}
    </td>
    <td class="progress-table-row__progress">
      <NativeProgress
        :progress="value"
        :backgroundColor="backgroundColor"
        :progressColor="progressColor"
        data-testid="progress-table-row-progress"
      />
    </td>
    <td
      class="progress-table-row__description"
      data-testid="progress-table-row-description"
    >
      {{ description }}
    </td>
  </tr>
</template>

<script setup lang="ts">
import NativeProgress from './insights/charts/NativeProgress.vue';

defineProps<{
  label: string;
  value: number;
  description: string;
  progressColor?: string;
  backgroundColor?: string;
}>();
</script>

<style scoped lang="scss">
.progress-table-row {
  &:not(:last-of-type) {
    border-bottom: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  }

  & > * {
    padding: $unnnic-spacing-sm 0;
  }

  &__text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-lg;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
  }

  &__progress {
    width: 100%;

    padding: 0 $unnnic-spacing-sm;
  }

  &__description {
    text-align: end;

    color: $unnnic-color-neutral-dark;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-lg;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
  }
}
</style>
