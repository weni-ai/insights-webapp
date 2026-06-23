<template>
  <span
    :class="['row-alert', `row-alert--${scheme}`]"
    data-testid="table-row-alert"
    aria-hidden="true"
  >
    <span
      class="row-alert__tooltip"
      data-testid="table-row-alert-tooltip"
    >
      {{ text }}
    </span>
  </span>
</template>

<script setup lang="ts">
import type { RowAlertScheme } from '@/composables/useTableRowAlert';

defineProps<{
  scheme: RowAlertScheme;
  text: string;
}>();
</script>

<style scoped lang="scss">
.row-alert {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  pointer-events: none;

  &__tooltip {
    position: absolute;
    top: 50%;
    left: 200px;
    z-index: 10;
    width: max-content;
    max-width: 320px;
    padding: $unnnic-space-2 $unnnic-space-3;
    transform: translateY(-50%);
    border-radius: $unnnic-radius-2;
    background: $unnnic-color-gray-13;
    color: $unnnic-color-fg-inverted;
    font: $unnnic-font-caption-2;
    white-space: normal;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.15s ease;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: -$unnnic-space-1;
      width: 0;
      height: 0;
      transform: translateY(-50%);
      border-width: $unnnic-space-1 $unnnic-space-1 $unnnic-space-1 0;
      border-style: solid;
      border-color: transparent $unnnic-color-gray-13 transparent transparent;
    }
  }
}
</style>
