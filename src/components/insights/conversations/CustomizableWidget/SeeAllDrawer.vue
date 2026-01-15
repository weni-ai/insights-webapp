<template>
  <UnnnicDrawer
    class="see-all-drawer"
    data-testid="see-all-drawer"
    :modelValue="modelValue"
    :title="title || 'CUSTOM'"
    size="lg"
    @close="emit('update:modelValue', false)"
  >
    <template #content>
      <ProgressTable
        :progressItems="isCrosstab ? formattedCrosstabData : formattedData"
        data-testid="see-all-drawer-table"
      />
    </template>
  </UnnnicDrawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ProgressTable from '@/components/ProgressTable.vue';
import { useWidgetFormatting } from '@/composables/useWidgetFormatting';
import type {
  CsatResult,
  CrosstabResultItem,
} from '@/services/api/resources/conversational/widgets';

import { getWidgetCrosstabTooltip } from '@/utils/widget';

const { formatPercentage, formatNumber } = useWidgetFormatting();

const props = defineProps<{
  modelValue: boolean;
  data: CsatResult[] | CrosstabResultItem[];
  isCrosstab?: boolean;
  title?: string;
}>();

const emit = defineEmits<{
  (_e: 'update:modelValue', _value: boolean): void;
}>();

const defaultColor = '#3182CE';
const defaultBackgroundColor = props.isCrosstab ? '#E5812A' : '#BEE3F8';

const formattedCrosstabData = computed(() => {
  return (props.data as CrosstabResultItem[]).map((item) => {
    const eventsKeys = Object.keys(item.events);
    return {
      label: item.title,
      color: '#3182CE',
      backgroundColor: eventsKeys.length ? '#E5812A' : '#ECEEF2',
      description: `${item.total}`,
      value: item.events[eventsKeys[0]]?.value || 0,
      tooltip: getWidgetCrosstabTooltip(item.events),
    };
  });
});

const formattedData = props.data.map((item) => ({
  label: item.label,
  value: item.value,
  description: `${formatPercentage(item.value)} (${formatNumber(item.full_value)})`,
  backgroundColor: defaultBackgroundColor,
  color: defaultColor,
  subItems: [],
}));
</script>
