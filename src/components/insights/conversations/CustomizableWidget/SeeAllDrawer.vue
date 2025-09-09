<template>
  <UnnnicDrawer
    class="see-all-drawer"
    data-testid="see-all-drawer"
    :modelValue="modelValue"
    title="CUSTOM"
    size="lg"
    @close="emit('update:modelValue', false)"
  >
    <template #content>
      <ProgressTable
        :progressItems="formattedData"
        data-testid="see-all-drawer-table"
      />
    </template>
  </UnnnicDrawer>
</template>

<script setup lang="ts">
import ProgressTable from '@/components/ProgressTable.vue';
import { useWidgetFormatting } from '@/composables/useWidgetFormatting';
import type { CsatResult } from '@/services/api/resources/conversational/widgets';

const { formatPercentage, formatNumber } = useWidgetFormatting();

const props = defineProps<{
  modelValue: boolean;
  data: CsatResult[];
}>();

const emit = defineEmits<{
  (_e: 'update:modelValue', _value: boolean): void;
}>();

const defaultColor = '#3182CE';
const defaultBackgroundColor = '#BEE3F8';

const formattedData = props.data.map((item) => ({
  label: item.label,
  value: item.value,
  description: `${formatPercentage(item.value)} (${formatNumber(item.full_value)})`,
  backgroundColor: defaultBackgroundColor,
  color: defaultColor,
  subItems: [],
}));
</script>
