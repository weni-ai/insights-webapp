<template>
  <table class="progress-table">
    <tbody class="progress-table__body">
      <ProgressItem
        v-for="item in progressItems"
        :key="item.label"
        :label="item.label"
        :value="item.value"
        :description="item.description"
        :backgroundColor="item.backgroundColor"
        :progressColor="item.color"
        data-testid="progress-widget-progress-item"
      />
    </tbody>
  </table>
</template>

<script setup lang="ts">
import ProgressItem from './ProgressTableRow.vue';

defineProps<{
  progressItems: {
    label: string;
    value: number;
    description: string;
    backgroundColor: string;
    color: string;
  }[];
}>();
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
