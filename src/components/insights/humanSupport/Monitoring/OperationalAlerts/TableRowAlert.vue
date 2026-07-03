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
}
</style>
