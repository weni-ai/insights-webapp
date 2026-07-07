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
        ref="triggerRef"
        class="row-alert__trigger"
        data-testid="table-row-alert"
      >
        <slot />
      </span>
    </UnnnicToolTip>
  </span>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUpdated, ref, watch } from 'vue';
import { UnnnicToolTip } from '@weni/unnnic-system';

import type { RowAlertScheme } from '@/composables/useTableRowAlert';

const ROW_ALERT_ROW_CLASSES: Record<RowAlertScheme, string> = {
  red: 'table-row--alert-red',
  orange: 'table-row--alert-orange',
  yellow: 'table-row--alert-yellow',
};

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
const triggerRef = ref<HTMLElement | null>(null);
const overlayStyle = ref<Record<string, string>>({});

let resizeObserver: ResizeObserver | null = null;
let rowElement: HTMLTableRowElement | null = null;

const getRow = () => {
  const anchor = overlayRef.value ?? triggerRef.value;
  return anchor?.closest('tr') ?? null;
};

const clearRowAlertClass = () => {
  if (!rowElement) return;

  Object.values(ROW_ALERT_ROW_CLASSES).forEach((className) => {
    rowElement?.classList.remove(className);
  });
  rowElement = null;
};

const syncRowAlertClass = () => {
  if (!props.fullRow) return;

  const row = getRow();
  if (!row) return;

  if (rowElement && rowElement !== row) {
    clearRowAlertClass();
  }

  rowElement = row;

  Object.values(ROW_ALERT_ROW_CLASSES).forEach((className) => {
    row.classList.remove(className);
  });
  row.classList.add(ROW_ALERT_ROW_CLASSES[props.scheme]);
};

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

const setupResizeObserver = () => {
  if (!props.fullRow || typeof ResizeObserver === 'undefined') return;

  const row = getRow();
  if (!row) return;

  resizeObserver?.disconnect();
  resizeObserver = new ResizeObserver(() => {
    updateOverlay();
  });
  resizeObserver.observe(row);
};

onMounted(() => {
  if (!props.fullRow) return;

  syncRowAlertClass();
  updateOverlay();
  setupResizeObserver();
});

onUpdated(() => {
  if (!props.fullRow) return;

  syncRowAlertClass();
  updateOverlay();
});

watch(
  () => props.scheme,
  () => {
    syncRowAlertClass();
  },
);

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  clearRowAlertClass();
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

<style lang="scss">
.unnnic-data-table .unnnic-data-table__body-row.table-row--alert-red {
  background-color: $unnnic-color-bg-red-plain;

  .unnnic-data-table__body-cell {
    background-color: $unnnic-color-bg-red-plain;
    font: $unnnic-font-emphasis;
  }
}

.unnnic-data-table .unnnic-data-table__body-row.table-row--alert-orange {
  background-color: $unnnic-color-bg-orange-plain;

  .unnnic-data-table__body-cell {
    background-color: $unnnic-color-bg-orange-plain;
    font: $unnnic-font-emphasis;
  }
}

.unnnic-data-table .unnnic-data-table__body-row.table-row--alert-yellow {
  background-color: $unnnic-color-bg-yellow-plain;

  .unnnic-data-table__body-cell {
    background-color: $unnnic-color-bg-yellow-plain;
    font: $unnnic-font-emphasis;
  }
}
</style>
