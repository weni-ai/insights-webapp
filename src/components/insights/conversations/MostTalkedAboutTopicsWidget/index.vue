<template>
  <section class="most-talked-about-topics" data-testid="most-talked-about-topics">
    <BaseConversationWidget
      class="most-talked-about-topics__conversation-widget"
      data-testid="topics-base-widget"
      :title="$t('conversations_dashboard.most_talked_about_topics.title')"
      :actions="[
        {
          icon: 'edit_square',
          text: $t(
            'conversations_dashboard.most_talked_about_topics.edit_topics_and_subtopics',
          ),
          onClick: toggleAddTopicsDrawer,
        },
      ]"
      @tab-change="handleTabChange"
    >
      <TreemapChart
        :isLoading="isLoadingTopicsDistribution"
        :data="treemapData"
        data-testid="topics-treemap-chart"
        @click="handleSeeAllDrawer($event.label)"
      />

      <UnnnicButton
        v-if="treemapData.length > 0"
        type="tertiary"
        size="small"
        :disabled="isLoadingTopicsDistribution"
        :text="$t('conversations_dashboard.most_talked_about_topics.see_all')"
        data-testid="topics-see-all-button"
        @click="handleSeeAllDrawer()"
      />

      <SeeAllDrawer
        v-if="isSeeAllDrawerOpen"
        v-model="isSeeAllDrawerOpen"
        :data="treemapData"
        :expandedItems="expandedItems"
        data-testid="topics-see-all-drawer"
      />
    </BaseConversationWidget>

    <AddWidget
      v-if="!hasExistingTopics && !isLoadingTopicsDistribution"
      :title="$t('conversations_dashboard.most_talked_about_topics.no_topics')"
      :description="
        $t(
          'conversations_dashboard.most_talked_about_topics.no_topics_description',
        )
      "
      :actionText="
        $t('conversations_dashboard.most_talked_about_topics.add_first_topic')
      "
      data-testid="topics-add-widget"
      @action="toggleAddTopicsDrawer"
    />

    <DrawerTopics data-testid="topics-drawer" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import BaseConversationWidget from '@/components/insights/conversations/BaseConversationWidget.vue';
import TreemapChart from '@/components/insights/charts/TreemapChart.vue';
import SeeAllDrawer from './SeeAllDrawer.vue';
import AddWidget from '../AddWidget.vue';
import { useConversationalTopics } from '@/store/modules/conversational/topics';
import DrawerTopics from '../topics/DrawerTopics.vue';
import type { topicDistributionMetric } from '@/services/api/resources/conversational/topics';
import type { Tab } from '../BaseConversationWidget.vue';
import { useRoute } from 'vue-router';

const conversationalTopicsStore = useConversationalTopics();

const route = useRoute();

const MOCK_DATA: topicDistributionMetric[] = [
  {
    label: 'Entrega atrasada',
    value: 6973,
    percentage: 29,
    uuid: '',
  },
  {
    label: 'Produto defeituoso',
    value: 5500,
    percentage: 23,
    uuid: '',
  },
  {
    label: 'Dúvidas sobre preço',
    value: 1600,
    percentage: 16,
    uuid: '',
  },
  {
    label: 'Cancelamento',
    value: 1400,
    percentage: 14,
    uuid: '',
  },
  {
    label: 'Unclassified',
    value: 1000,
    percentage: 13,
    uuid: '',
  },
  {
    label: 'Outros',
    value: 500,
    percentage: 5,
    uuid: '',
  },
];

const {
  topicsDistributionCount,
  topicsDistribution,
  isLoadingTopicsDistribution,
  topicType,
  hasExistingTopics,
} = storeToRefs(conversationalTopicsStore);

const { loadTopicsDistribution, toggleAddTopicsDrawer, setTopicType } =
  conversationalTopicsStore;

const expandedItems = ref<string[]>([]);

const isSeeAllDrawerOpen = ref(false);
const handleSeeAllDrawer = (expandedItem?: string) => {
  if (isLoadingTopicsDistribution.value) return;

  expandedItems.value = expandedItem ? [expandedItem] : [];

  isSeeAllDrawerOpen.value = !isSeeAllDrawerOpen.value;
};

const treemapData = computed(() => {
  if (!hasExistingTopics.value) return MOCK_DATA;

  if (topicsDistributionCount.value === 0) return [];

  return topicsDistribution.value;
});

const handleTabChange = (tab: Tab) => {
  setTopicType(tab === 'artificial-intelligence' ? 'AI' : 'HUMAN');
};

watch(topicType, () => {
  loadTopicsDistribution();
});

watch(
  () => route.query,
  () => {
    loadTopicsDistribution();
  },
);

onMounted(() => {
  loadTopicsDistribution();
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
