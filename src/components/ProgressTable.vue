<template>
  <section
    v-if="isLoading"
    class="progress-table__loading"
  >
    <UnnnicSkeletonLoading
      v-for="i in 5"
      :key="i"
      width="100%"
      height="51.5px"
      data-testid="progress-table-skeleton"
    />
  </section>
  <table
    v-else
    class="progress-table"
    data-testid="progress-table"
  >
    <tbody
      class="progress-table__body"
      data-testid="progress-table-body"
    >
      <ProgressItem
        v-for="item in progressItems"
        :key="item.label"
        data-testid="progress-table-item"
        :label="item.label"
        :value="item.value"
        :description="item.description"
        :backgroundColor="item.backgroundColor"
        :color="item.color"
        :isExpandable="item.subItems?.length > 0"
        :expandableDescription="`${item.subItems?.length} ${subItemsDescription || ''}`"
        :expanded="expandedItems.includes(item.label)"
        :subItems="item.subItems"
        @expand="expandItem(item.label, $event)"
      />
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ProgressTableRowItem } from './ProgressTableRowItem.vue';
import ProgressItem from './ProgressTableRow.vue';

const props = defineProps<{
  isLoading?: boolean;
  progressItems: ProgressTableRowItem[];
  subItemsDescription?: string;
  expandedItems?: string[];
}>();

const expandedItems = ref(props.expandedItems || []);

function expandItem(label: string, expanded: boolean) {
  if (expanded) {
    expandedItems.value.push(label);
  } else {
    expandedItems.value = expandedItems.value.filter((item) => item !== label);
  }
}
</script>

<style scoped lang="scss">
.progress-table__loading {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-nano;
}

.progress-table {
  width: 100%;
  border-collapse: collapse;

  &__body {
    width: 100%;
  }
}
</style>
