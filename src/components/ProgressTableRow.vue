<template>
  <ProgressTableRowItem
    :key="label"
    data-testid="progress-table-row-item-main"
    :label="label"
    :value="value"
    :subtitle="subtitle"
    :description="description"
    :color="color"
    :backgroundColor="backgroundColor"
    :isExpandable="isExpandable"
    :expandableDescription="expandableDescription"
    :expanded="expanded"
    :tooltip="tooltip"
    @expand="emit('expand', $event)"
  >
    <template
      v-if="isExpandable && expanded"
      #sub-items
    >
      <ProgressTableRowItem
        v-for="item in subItems"
        :key="item.label"
        data-testid="progress-table-row-item-sub"
        :label="item.label"
        :value="item.value"
        :description="item.description"
        :color="item.color"
        :backgroundColor="item.backgroundColor"
      />
    </template>
  </ProgressTableRowItem>
</template>

<script setup lang="ts">
import type { ProgressTableRowItem as ProgressTableRowItemType } from './ProgressTableRowItem.vue';
import ProgressTableRowItem from './ProgressTableRowItem.vue';

const emit = defineEmits<{
  (_e: 'expand', _expanded: boolean): void;
}>();

defineProps<ProgressTableRowItemType>();
</script>
