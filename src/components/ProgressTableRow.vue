<template>
  <ProgressTableRowItem
    :key="label"
    :label="label"
    :value="value"
    :description="description"
    :progressColor="color"
    :backgroundColor="backgroundColor"
    :isExpandable="isExpandable"
    :expandableDescription="expandableDescription"
    :expanded="expanded"
    @expand="emit('expand', $event)"
  >
    <template
      v-if="isExpandable && expanded"
      #sub-items
    >
      <ProgressTableRowItem
        v-for="item in subItems"
        :key="item.label"
        :label="item.label"
        :value="item.value"
        :description="item.description"
        :progressColor="item.color"
        :backgroundColor="item.backgroundColor"
        :isExpandable="false"
      />
    </template>
  </ProgressTableRowItem>
</template>

<script setup lang="ts">
import ProgressTableRowItem from './ProgressTableRowItem.vue';

const emit = defineEmits<{
  (_e: 'expand', _expanded: boolean): void;
}>();

defineProps<{
  label: string;
  value: number;
  description: string;
  color?: string;
  backgroundColor?: string;
  isExpandable?: boolean;
  expandableDescription?: string;
  expanded?: boolean;
  subItems?: {
    label: string;
    value: number;
    description: string;
    color?: string;
    backgroundColor?: string;
  }[];
}>();
</script>
