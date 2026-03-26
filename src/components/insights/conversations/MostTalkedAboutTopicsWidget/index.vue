<template>
  <section
    class="most-talked-about-topics"
    :class="{ 'most-talked-about-topics--mock-hover': shouldUseMock }"
    data-testid="most-talked-about-topics"
  >
    <BaseConversationWidget
      class="most-talked-about-topics__conversation-widget"
      data-testid="topics-base-widget"
      :title="$t('conversations_dashboard.most_talked_about_topics.title')"
      :actions="shouldUseMock ? [] : actions"
      :hiddenTabs="shouldUseMock"
      @tab-change="handleTabChange"
    >
      <TreemapChart
        :isLoading="isLoadingTopicsDistribution"
        :data="treemapData"
        data-testid="topics-treemap-chart"
        @click="handleSeeAllDrawer($event.label)"
      />

      <UnnnicButton
        v-if="treemapData.length > 0 && !shouldUseMock"
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
      v-if="showAddWidget"
      class="most-talked-about-topics__add-widget"
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
import { useI18n } from 'vue-i18n';
import BaseConversationWidget from '@/components/insights/conversations/BaseConversationWidget.vue';
import TreemapChart from '@/components/insights/charts/TreemapChart.vue';
import SeeAllDrawer from './SeeAllDrawer.vue';
import AddWidget from '../AddWidget.vue';
import { useConversationalTopics } from '@/store/modules/conversational/topics';
import DrawerTopics from '../topics/DrawerTopics.vue';
import type { Tab } from '../BaseConversationWidget.vue';
import { useRoute } from 'vue-router';
import { useConversational } from '@/store/modules/conversational/conversational';
import { getMockTopicsDistribution } from '@/services/api/resources/conversational/mocks';

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
  if (shouldUseMock.value) return getMockTopicsDistribution().topics;

  if (topicsDistributionCount.value === 0) return [];

  return [...topicsDistribution.value].sort(
    (a, b) => b?.percentage - a?.percentage,
  );
});

const { t } = useI18n();

const actions = computed(() => [
  {
    icon: 'edit_square',
    text: t(
      'conversations_dashboard.most_talked_about_topics.edit_topics_and_subtopics',
    ),
    onClick: toggleAddTopicsDrawer,
  },
]);

const showAddWidget = computed(() => {
  if (isLoadingTopicsDistribution.value) return false;
  if (shouldUseMock.value) return true;
  return treemapData.value.length === 0;
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

  padding-bottom: $unnnic-space-4;

  overflow: hidden;

  min-width: 100%;
  height: 380px;

  &__conversation-widget {
    height: 100%;

    gap: $unnnic-space-3;
  }

  &__add-widget {
    transition: opacity 0.2s ease;
  }

  &--mock-hover {
    .most-talked-about-topics__add-widget {
      opacity: 0;
    }

    &:hover .most-talked-about-topics__add-widget {
      opacity: 1;
    }
  }
}
</style>
