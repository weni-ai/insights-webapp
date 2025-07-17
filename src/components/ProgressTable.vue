<template>
  <table class="progress-table">
    <tbody class="progress-table__body">
      <ProgressItem
        v-for="item in progressItems"
        :key="item.label"
        data-testid="progress-widget-progress-item"
        :label="item.label"
        :value="item.value"
        :description="item.description"
        :backgroundColor="item.backgroundColor"
        :color="item.color"
        :isExpandable="!!item.subItems"
        :expandableDescription="`${item.subItems?.length} ${subItemsDescription || ''}`"
        :expanded="expandedRow === item.label"
        :subItems="item.subItems"
        @expand="expandedRow = $event ? item.label : ''"
      />
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ProgressTableRowItem } from './ProgressTableRowItem.vue';
import ProgressItem from './ProgressTableRow.vue';

const props = defineProps<{
  progressItems: ProgressTableRowItem[];
  subItemsDescription?: string;
  expandedItem?: string;
}>();

const expandedRow = ref(props.expandedItem || '');
</script>

<style scoped lang="scss">
.progress-table {
  width: 100%;
  border-collapse: collapse;

  &__body {
    width: 100%;
  }
}
</style>
