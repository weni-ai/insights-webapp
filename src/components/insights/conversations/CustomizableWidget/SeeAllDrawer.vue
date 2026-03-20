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
import {
  colorBlue8,
  colorBlue2,
  colorOrange7,
  colorGray1,
} from '@weni/unnnic-system/tokens/colors';

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

const defaultColor = colorBlue8;
const defaultBackgroundColor = props.isCrosstab ? colorOrange7 : colorBlue2;

const formattedCrosstabData = computed(() => {
  return (props.data as CrosstabResultItem[]).map((item) => {
    const eventsKeys = Object.keys(item.events);
    return {
      label: item.title,
      color: colorBlue8,
      backgroundColor: eventsKeys.length ? colorOrange7 : colorGray1,
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
