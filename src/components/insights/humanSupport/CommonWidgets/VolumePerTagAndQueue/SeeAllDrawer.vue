<template>
  <UnnnicDrawer
    class="see-all-drawer"
    data-testid="see-all-drawer"
    :modelValue="true"
    :title="title"
    size="lg"
    @close="emit('update:modelValue', false)"
  >
    <template #content>
      <ProgressTable :progressItems="props.items" />
    </template>
  </UnnnicDrawer>
</template>

<script setup lang="ts">
import ProgressTable from '@/components/ProgressTable.vue';
import { ProgressTableRowItem } from '@/components/ProgressTableRowItem.vue';
defineOptions({
  name: 'SeeAllDrawer',
});

interface SeeAllDrawerProps {
  isLoading?: boolean;
  title?: string;
  items: ProgressTableRowItem[];
}

const props = withDefaults(defineProps<SeeAllDrawerProps>(), {
  isLoading: false,
  title: '',
});
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();
</script>
