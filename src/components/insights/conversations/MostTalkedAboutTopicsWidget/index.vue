<template>
  <section
    class="most-talked-about-topics"
    data-testid="most-talked-about-topics"
  >
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

    <DrawerTopics data-testid="topics-drawer" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import BaseConversationWidget from '@/components/insights/conversations/BaseConversationWidget.vue';
import TreemapChart from '@/components/insights/charts/TreemapChart.vue';
import SeeAllDrawer from './SeeAllDrawer.vue';
import { useConversationalTopics } from '@/store/modules/conversational/topics';
import DrawerTopics from '../topics/DrawerTopics.vue';
import type { Tab } from '../BaseConversationWidget.vue';
import { useRoute } from 'vue-router';
import { useConversational } from '@/store/modules/conversational/conversational';
import { MOCK_TOPICS_DISTRIBUTION } from '@/services/api/resources/conversational/mocks';

const conversationalTopicsStore = useConversationalTopics();
const conversationalStore = useConversational();
const { shouldUseMock } = storeToRefs(conversationalStore);

const route = useRoute();

const {
  topicsDistributionCount,
  topicsDistribution,
  isLoadingTopicsDistribution,
  topicType,
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
  if (shouldUseMock.value) return MOCK_TOPICS_DISTRIBUTION.topics;

  if (topicsDistributionCount.value === 0) return [];

  return [...topicsDistribution.value].sort(
    (a, b) => b?.percentage - a?.percentage,
  );
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

watch(
  () => conversationalStore.refreshDataConversational,
  (newValue) => {
    if (newValue) {
      conversationalStore.setIsLoadingConversationalData(
        'mostTalkedAboutTopics',
        true,
      );
      loadTopicsDistribution().finally(() => {
        conversationalStore.setIsLoadingConversationalData(
          'mostTalkedAboutTopics',
          false,
        );
      });
    }
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
