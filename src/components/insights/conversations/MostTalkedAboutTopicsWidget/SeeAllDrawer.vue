<template>
  <UnnnicDrawer
    class="see-all-drawer"
    :modelValue="modelValue"
    :title="$t('conversations_dashboard.most_talked_about_topics.title')"
    size="lg"
    @close="emit('update:modelValue', false)"
  >
    <template #content>
      <ProgressTable
        :progressItems="MOCK_DATA_PROGRESS_TABLE"
        :subItemsDescription="
          $t('conversations_dashboard.most_talked_about_topics.subtopics')
        "
        :expandedItems="expandedItems"
      />
    </template>
  </UnnnicDrawer>
</template>

<script setup lang="ts">
import ProgressTable from '@/components/ProgressTable.vue';
import { addColors } from '@/utils/treemap';
import { useWidgetFormatting } from '@/composables/useWidgetFormatting';

const { formatPercentage, formatNumber } = useWidgetFormatting();

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (_e: 'update:modelValue', _value: boolean): void;
}>();

const MOCK_DATA = [
  {
    label: 'Entrega atrasada',
    value: 6973,
    percentage: 29,
    subItems: [
      {
        label: 'Atraso no transporte',
        value: 5229,
        percentage: 75,
      },
      {
        label: 'Problema na preparação',
        value: 1000,
        percentage: 25,
      },
    ],
  },
  {
    label: 'Produto defeituoso',
    value: 5500,
    percentage: 23,
  },
  {
    label: 'Dúvidas sobre preço',
    value: 1600,
    percentage: 16,
    subItems: [
      {
        label: 'Desconto no valor',
        value: 1825,
        percentage: 35,
      },
      {
        label: 'Desconto no frete',
        value: 375,
        percentage: 65,
      },
    ],
  },
  {
    label: 'Cancelamento',
    value: 1400,
    percentage: 14,
  },
  {
    label: 'Unclassified',
    value: 1000,
    percentage: 13,
  },
  {
    label: 'Outros',
    value: 500,
    percentage: 5,
  },
];

const coloredData = addColors(MOCK_DATA);

const MOCK_DATA_PROGRESS_TABLE = coloredData.map((item) => ({
  label: item.label,
  value: item.percentage,
  description: `${formatPercentage(item.percentage)} (${formatNumber(item.value)})`,
  backgroundColor: item.color,
  color: item.hoverColor,
  subItems: MOCK_DATA.find(
    (mockItem) => mockItem.label === item.label,
  )?.subItems?.map((subItem) => ({
    label: subItem.label,
    value: subItem.percentage,
    description: `${formatPercentage(subItem.percentage)} (${formatNumber(subItem.value)})`,
    backgroundColor: item.color,
    color: item.hoverColor,
  })),
}));

const expandedItems = defineModel<string[]>('expandedItems', {
  default: () => [],
});
</script>
