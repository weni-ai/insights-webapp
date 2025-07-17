<template>
  <BaseConversationWidget
    class="most-talked-about-topics"
    :title="$t('conversations_dashboard.most_talked_about_topics.title')"
  >
    <TreemapChart :data="MOCK_DATA" />

    <UnnnicButton
      type="tertiary"
      size="small"
      :text="$t('conversations_dashboard.most_talked_about_topics.see_all')"
      @click="handleSeeAllDrawer"
    />

    <SeeAllDrawer
      v-if="isSeeAllDrawerOpen"
      v-model="isSeeAllDrawerOpen"
      :data="MOCK_DATA"
    />
  </BaseConversationWidget>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseConversationWidget from '@/components/insights/conversations/BaseConversationWidget.vue';
import TreemapChart from '@/components/insights/charts/TreemapChart.vue';
import SeeAllDrawer from './SeeAllDrawer.vue';

const MOCK_DATA = [
  {
    label: 'Entrega atrasada',
    value: 6973,
    percentage: 29,
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

const isSeeAllDrawerOpen = ref(false);
const handleSeeAllDrawer = () => {
  isSeeAllDrawerOpen.value = !isSeeAllDrawerOpen.value;
};
</script>

<style lang="scss" scoped>
.most-talked-about-topics {
  padding-bottom: $unnnic-spacing-sm;

  overflow: hidden;

  min-width: 100%;
  height: 380px;

  gap: $unnnic-spacing-ant;
}
</style>
