<template>
  <UnnnicDrawer
    class="see-all-drawer"
    data-testid="topics-see-all-drawer"
    :modelValue="modelValue"
    :title="$t('conversations_dashboard.most_talked_about_topics.title')"
    size="lg"
    @close="emit('update:modelValue', false)"
  >
    <template #content>
      <ProgressTable
        :progressItems="formattedData"
        :subItemsDescription="
          $t('conversations_dashboard.most_talked_about_topics.subtopics')
        "
        :expandedItems="expandedItems"
        data-testid="topics-see-all-table"
      />
    </template>
  </UnnnicDrawer>
</template>

<script setup lang="ts">
import ProgressTable from '@/components/ProgressTable.vue';
import { addColors } from '@/utils/treemap';
import { useWidgetFormatting } from '@/composables/useWidgetFormatting';
import type { topicDistributionMetric } from '@/services/api/resources/conversational/topics';

const { formatPercentage, formatNumber } = useWidgetFormatting();

const props = defineProps<{
  modelValue: boolean;
  data: topicDistributionMetric[];
}>();

const emit = defineEmits<{
  (_e: 'update:modelValue', _value: boolean): void;
}>();

const coloredData = addColors(props.data);

const formattedData = coloredData.map((item) => ({
  label: item.label,
  value: item.percentage,
  description: `${formatPercentage(item.percentage)} (${formatNumber(item.value)})`,
  backgroundColor: item.color,
  color: item.hoverColor,
  subItems: item.subtopics?.map((subItem) => {
    return {
      label: subItem.label,
      value: subItem.percentage,
      description: `${formatPercentage(subItem.percentage)} (${formatNumber(subItem.value)})`,
      backgroundColor: item.color,
      color: item.hoverColor,
    };
  }),
}));

const expandedItems = defineModel<string[]>('expandedItems', {
  default: () => [],
});
</script>
