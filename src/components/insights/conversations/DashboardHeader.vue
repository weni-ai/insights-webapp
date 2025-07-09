<template>
  <section
    class="dashboard-conversational"
    data-testid="dashboard-conversational"
  >
    <section
      class="dashboard-conversational__header"
      data-testid="dashboard-header"
    >
      <section
        class="dashboard-conversational__cards"
        data-testid="dashboard-header-left"
      >
        <template
          v-for="(card, index) in cards"
          :key="card.id"
        >
          <CardConversations
            :title="card.title"
            :value="card.value"
            :description="card.description"
            :tooltipInfo="card.tooltipInfo"
            :borderRadius="getBorderRadius(index, cards.length)"
            :isLoading="card.isLoading"
          />
        </template>
      </section>
      <section
        class="dashboard-conversational__summary"
        data-testid="dashboard-header-right"
      >
        <CardConversations
          :title="rightCard.title"
          :value="rightCard.value"
          :description="rightCard.description"
          :tooltipInfo="rightCard.tooltipInfo"
          :isLoading="rightCard.isLoading"
        />
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import CardConversations from '@/components/insights/cards/CardConversations.vue';
import Unnnic from '@/utils/plugins/UnnnicSystem';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const cardDefinitions = [
  {
    id: 'total_conversations',
    titleKey: 'conversations_dashboard.header.total',
    tooltipKey: 'conversations_dashboard.header.tooltips.total',
  },
  {
    id: 'resolved',
    titleKey: 'conversations_dashboard.header.resolved',
    tooltipKey: 'conversations_dashboard.header.tooltips.resolved',
  },
  {
    id: 'unresolved',
    titleKey: 'conversations_dashboard.header.unresolved',
    tooltipKey: 'conversations_dashboard.header.tooltips.unresolved',
  },
  {
    id: 'unengaged',
    titleKey: 'conversations_dashboard.header.unengaged',
    tooltipKey: 'conversations_dashboard.header.tooltips.unengaged',
  },
];

const createInitialCardData = () => ({
  value: '-',
  description: null,
  isLoading: true,
});

const cardsData = ref(
  cardDefinitions.map((def) => ({
    id: def.id,
    ...createInitialCardData(),
  })),
);

const rightCardData = ref(createInitialCardData());

const cards = computed(() =>
  cardDefinitions.map((def, index) => ({
    id: def.id,
    title: t(def.titleKey),
    value: cardsData.value[index].value,
    description: cardsData.value[index].description,
    tooltipInfo: t(def.tooltipKey),
    isLoading: cardsData.value[index].isLoading,
  })),
);

const rightCard = computed(() => ({
  title: t('conversations_dashboard.header.transferred'),
  value: rightCardData.value.value,
  description: rightCardData.value.description,
  tooltipInfo: t('conversations_dashboard.header.tooltips.transferred'),
  isLoading: rightCardData.value.isLoading,
}));

const mockApiCalls = {
  async fetchTotalConversations() {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return {
      value: '48.179',
      description: null,
    };
  },

  async fetchResolvedConversations() {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return {
      value: '85.75%',
      description: `41.313 ${t('conversations_dashboard.conversations')}`,
    };
  },

  async fetchUnresolvedConversations() {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return {
      value: '5.25%',
      description: `2.529 ${t('conversations_dashboard.conversations')}`,
    };
  },

  async fetchUnengagedConversations() {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return {
      value: '9.00%',
      description: `4.338 ${t('conversations_dashboard.conversations')}`,
    };
  },

  async fetchTransferredConversations() {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return {
      value: '12.22%',
      description: `5.887 ${t('conversations_dashboard.conversations')}`,
    };
  },
};

const getBorderRadius = (index: number, totalCards: number) => {
  if (totalCards === 1) return 'full';
  if (index === 0) return 'left';
  if (index === totalCards - 1) return 'right';
  return 'none';
};

const showErrorToast = () => {
  Unnnic.unnnicCallAlert({
    props: {
      text: t('widgets.graph_funnel.error.title'),
      type: 'error',
    },
    seconds: 5,
  });
};

const loadData = async (
  fetchFn: () => Promise<{ value: any; description: string | null }>,
  targetRef: { value: any; description: string | null; isLoading: boolean },
  errorMessage: string,
) => {
  try {
    const data = await fetchFn();
    targetRef.value = data.value;
    targetRef.description = data.description;
    targetRef.isLoading = false;
  } catch (error) {
    console.error(errorMessage, error);
    targetRef.value = '--';
    targetRef.description = null;
    targetRef.isLoading = false;
    showErrorToast();
  }
};

const loadCardData = async () => {
  await Promise.all([
    loadData(
      mockApiCalls.fetchTotalConversations,
      cardsData.value[0],
      'Error loading total conversations:',
    ),
    loadData(
      mockApiCalls.fetchResolvedConversations,
      cardsData.value[1],
      'Error loading resolved conversations:',
    ),
    loadData(
      mockApiCalls.fetchUnresolvedConversations,
      cardsData.value[2],
      'Error loading unresolved conversations:',
    ),
    loadData(
      mockApiCalls.fetchUnengagedConversations,
      cardsData.value[3],
      'Error loading unengaged conversations:',
    ),
    loadData(
      mockApiCalls.fetchTransferredConversations,
      rightCardData.value,
      'Error loading transferred conversations:',
    ),
  ]);
};

onMounted(() => {
  loadCardData();
});
</script>

<style scoped lang="scss">
.dashboard-conversational {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: $unnnic-spacing-sm;
  }

  &__cards {
    display: flex;
    flex: 8;
  }

  &__summary {
    display: flex;
    flex: 2;
  }
}
</style>
