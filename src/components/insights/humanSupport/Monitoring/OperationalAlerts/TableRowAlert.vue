<template>
  <span
    :class="[
      'row-alert',
      `row-alert--${scheme}`,
      { 'row-alert--full-row': fullRow },
    ]"
  >
    <UnnnicToolTip
      enabled
      :text="text"
      side="right"
      maxWidth="320px"
      data-testid="table-row-alert-tooltip"
    >
      <span
        v-if="fullRow"
        ref="overlayRef"
        class="row-alert__overlay"
        :style="overlayStyle"
        data-testid="table-row-alert-overlay"
      />
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
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { UnnnicToolTip } from '@weni/unnnic-system';

import type { RowAlertScheme } from '@/composables/useTableRowAlert';

const props = withDefaults(
  defineProps<{
    scheme: RowAlertScheme;
    text: string;
    fullRow?: boolean;
  }>(),
  {
    fullRow: false,
  },
);

const overlayRef = ref<HTMLElement | null>(null);
const overlayStyle = ref<Record<string, string>>({});

let resizeObserver: ResizeObserver | null = null;

const updateOverlay = () => {
  if (!props.fullRow) return;

  const overlay = overlayRef.value;
  if (!overlay) return;

  const row = overlay.closest('tr');
  const cell = overlay.closest('td');

  if (!row || !cell) return;

  const rowRect = row.getBoundingClientRect();
  const cellRect = cell.getBoundingClientRect();

  overlayStyle.value = {
    width: `${rowRect.width}px`,
    height: `${rowRect.height}px`,
    left: `${cellRect.left - rowRect.left}px`,
    top: `${cellRect.top - rowRect.top}px`,
  };
};

onMounted(() => {
  if (!props.fullRow) return;

  updateOverlay();

  const row = overlayRef.value?.closest('tr');
  if (!row || typeof ResizeObserver === 'undefined') return;

  resizeObserver = new ResizeObserver(updateOverlay);
  resizeObserver.observe(row);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});
</script>

<style scoped lang="scss">
.row-alert {
  display: inline;

  &--full-row {
    display: block;
    position: relative;
  }

  &__overlay {
    position: absolute;
    z-index: 1;
    opacity: 0;
    cursor: default;
  }

  &__trigger {
    display: inline;
    position: relative;
    z-index: 0;
  }
}
</style>
