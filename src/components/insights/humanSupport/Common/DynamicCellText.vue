<template>
  <UnnnicToolTip
    :enabled="props.isDeleted"
    :text="props.tooltipText"
    side="right"
    data-testid="dynamic-cell-tooltip"
  >
    <p
      :class="[
        'dynamic-cell-text',
        { 'dynamic-cell-text--muted': props.isDeleted },
      ]"
      data-testid="dynamic-cell-text"
    >
      {{ props.text }}
    </p>
  </UnnnicToolTip>
</template>

<script setup lang="ts">
defineOptions({
  name: 'DynamicCellText',
});

interface DynamicCellTextProps {
  text: string;
  isDeleted?: boolean;
  tooltipText?: string;
}

const props = withDefaults(defineProps<DynamicCellTextProps>(), {
  isDeleted: false,
  tooltipText: '',
});
</script>

<style scoped lang="scss">
.dynamic-cell-text {
  &--muted {
    color: $unnnic-color-fg-muted;
  }
}
</style>
