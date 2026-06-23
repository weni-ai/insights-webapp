<template>
  <span :class="['row-alert', `row-alert--${scheme}`]">
    <UnnnicToolTip
      enabled
      :text="text"
      side="right"
      maxWidth="320px"
      data-testid="table-row-alert-tooltip"
    >
      <span
        class="row-alert__trigger"
        data-testid="table-row-alert"
      >
        <slot />
        <span class="row-alert__accessible-text">{{ text }}</span>
      </span>
    </UnnnicToolTip>
  </span>
</template>

<script setup lang="ts">
import { UnnnicToolTip } from '@weni/unnnic-system';

import type { RowAlertScheme } from '@/composables/useTableRowAlert';

defineProps<{
  scheme: RowAlertScheme;
  text: string;
}>();
</script>

<style scoped lang="scss">
.row-alert {
  display: inline;

  &__trigger {
    display: inline;
  }

  &__accessible-text {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}
</style>
