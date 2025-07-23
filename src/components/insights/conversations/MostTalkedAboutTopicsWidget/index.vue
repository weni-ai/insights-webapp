<template>
  <section class="most-talked-about-topics">
    <BaseConversationWidget
      class="most-talked-about-topics__conversation-widget"
      :title="$t('conversations_dashboard.most_talked_about_topics.title')"
    >
      <TreemapChart
        :data="treemapData"
        @click="handleSeeAllDrawer($event.label)"
      />

      <UnnnicButton
        v-if="treemapData.length > 0"
        type="tertiary"
        size="small"
        :text="$t('conversations_dashboard.most_talked_about_topics.see_all')"
        @click="handleSeeAllDrawer()"
      />

      <SeeAllDrawer
        v-if="isSeeAllDrawerOpen"
        v-model="isSeeAllDrawerOpen"
        :data="MOCK_DATA"
        :expandedItems="expandedItems"
      />
    </BaseConversationWidget>

    <AddWidget
      v-if="topicsStore.topicsCount === 0"
      :title="$t('conversations_dashboard.most_talked_about_topics.no_topics')"
      :description="
        $t(
          'conversations_dashboard.most_talked_about_topics.no_topics_description',
        )
      "
      :actionText="
        $t('conversations_dashboard.most_talked_about_topics.add_first_topic')
      "
      @action="topicsStore.toggleAddTopicsDrawer"
    />

    <DrawerTopics v-if="topicsStore.isAddTopicsDrawerOpen" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import BaseConversationWidget from '@/components/insights/conversations/BaseConversationWidget.vue';
import TreemapChart from '@/components/insights/charts/TreemapChart.vue';
import SeeAllDrawer from './SeeAllDrawer.vue';
import AddWidget from '../AddWidget.vue';
import { useConversationalTopics } from '@/store/modules/conversational/topics';
import DrawerTopics from '../topics/DrawerTopics.vue';

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

const MOCK_EMPTY_DATA = [];

const topicsStore = useConversationalTopics();

const expandedItems = ref<string[]>([]);

const isSeeAllDrawerOpen = ref(false);
const handleSeeAllDrawer = (expandedItem?: string) => {
  expandedItems.value = expandedItem ? [expandedItem] : [];

  isSeeAllDrawerOpen.value = !isSeeAllDrawerOpen.value;
};

const treemapData = computed(() => {
  return topicsStore.topicsCount > 0 ? MOCK_EMPTY_DATA : MOCK_DATA; // TODO: Change to real data instead of MOCK_EMPTY_DATA
});
</script>

<style lang="scss" scoped>
.most-talked-about-topics {
  position: relative;

  padding-bottom: $unnnic-spacing-sm;

  overflow: hidden;

  min-width: 100%;
  height: 380px;

  &__conversation-widget {
    height: 100%;

    gap: $unnnic-spacing-ant;
  }
}
</style>
