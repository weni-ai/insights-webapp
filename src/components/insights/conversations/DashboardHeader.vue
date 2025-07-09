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
        class="dashboard-conversational__header-left"
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
            :valueDescription="card.valueDescription"
            :borderRadius="getBorderRadius(index, cards.length)"
            :isLoading="card.isLoading"
          />
        </template>
      </section>
      <section
        class="dashboard-conversational__header-right"
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

const cardsData = ref([
  {
    id: 'total_conversations',
    value: '-',
    description: null,
    isLoading: true,
  },
  {
    id: 'resolved',
    value: '-',
    description: null,
    isLoading: true,
  },
  {
    id: 'unresolved',
    value: '-',
    description: null,
    isLoading: true,
  },
  {
    id: 'unengaged',
    value: '-',
    description: null,
    isLoading: true,
  },
]);

const rightCardData = ref({
  value: '-',
  description: null,
  isLoading: true,
});

const cards = computed(() => [
  {
    id: 'total_conversations',
    title: t('conversations_dashboard.header.total'),
    value: cardsData.value[0].value,
    description: cardsData.value[0].description,
    tooltipInfo: t('conversations_dashboard.header.tooltips.total'),
    isLoading: cardsData.value[0].isLoading,
  },
  {
    id: 'resolved',
    title: t('conversations_dashboard.header.resolved'),
    value: cardsData.value[1].value,
    description: cardsData.value[1].description,
    tooltipInfo: t('conversations_dashboard.header.tooltips.resolved'),
    isLoading: cardsData.value[1].isLoading,
  },
  {
    id: 'unresolved',
    title: t('conversations_dashboard.header.unresolved'),
    value: cardsData.value[2].value,
    description: cardsData.value[2].description,
    tooltipInfo: t('conversations_dashboard.header.tooltips.unresolved'),
    isLoading: cardsData.value[2].isLoading,
  },
  {
    id: 'unengaged',
    title: t('conversations_dashboard.header.unengaged'),
    value: cardsData.value[3].value,
    description: cardsData.value[3].description,
    tooltipInfo: t('conversations_dashboard.header.tooltips.unengaged'),
    isLoading: cardsData.value[3].isLoading,
  },
]);

const rightCard = computed(() => ({
  title: t('conversations_dashboard.header.transferred'),
  value: rightCardData.value.value,
  description: rightCardData.value.description,
  tooltipInfo: t('conversations_dashboard.header.tooltips.transferred'),
  isLoading: rightCardData.value.isLoading,
}));

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

const loadCardData = async () => {
  const loadTotalConversations = async () => {
    try {
      const totalData = await mockApiCalls.fetchTotalConversations();
      cardsData.value[0].value = totalData.value;
      cardsData.value[0].description = totalData.description;
      cardsData.value[0].isLoading = false;
    } catch (error) {
      console.error('Error loading total conversations:', error);
      cardsData.value[0].value = '--';
      cardsData.value[0].description = null;
      cardsData.value[0].isLoading = false;
      showErrorToast();
    }
  };

  const loadResolvedConversations = async () => {
    try {
      const resolvedData = await mockApiCalls.fetchResolvedConversations();
      cardsData.value[1].value = resolvedData.value;
      cardsData.value[1].description = resolvedData.description;
      cardsData.value[1].isLoading = false;
    } catch (error) {
      console.error('Error loading resolved conversations:', error);
      cardsData.value[1].value = '--';
      cardsData.value[1].description = null;
      cardsData.value[1].isLoading = false;
      showErrorToast();
    }
  };

  const loadUnresolvedConversations = async () => {
    try {
      const unresolvedData = await mockApiCalls.fetchUnresolvedConversations();
      cardsData.value[2].value = unresolvedData.value;
      cardsData.value[2].description = unresolvedData.description;
      cardsData.value[2].isLoading = false;
    } catch (error) {
      console.error('Error loading unresolved conversations:', error);
      cardsData.value[2].value = '--';
      cardsData.value[2].description = null;
      cardsData.value[2].isLoading = false;
      showErrorToast();
    }
  };

  const loadUnengagedConversations = async () => {
    try {
      const unengagedData = await mockApiCalls.fetchUnengagedConversations();
      cardsData.value[3].value = unengagedData.value;
      cardsData.value[3].description = unengagedData.description;
      cardsData.value[3].isLoading = false;
    } catch (error) {
      console.error('Error loading unengaged conversations:', error);
      cardsData.value[3].value = '--';
      cardsData.value[3].description = null;
      cardsData.value[3].isLoading = false;
      showErrorToast();
    }
  };

  const loadTransferredConversations = async () => {
    try {
      const transferredData =
        await mockApiCalls.fetchTransferredConversations();
      rightCardData.value.value = transferredData.value;
      rightCardData.value.description = transferredData.description;
      rightCardData.value.isLoading = false;
    } catch (error) {
      console.error('Error loading transferred conversations:', error);
      rightCardData.value.value = '--';
      rightCardData.value.description = null;
      rightCardData.value.isLoading = false;
      showErrorToast();
    }
  };

  Promise.all([
    loadTotalConversations(),
    loadResolvedConversations(),
    loadUnresolvedConversations(),
    loadUnengagedConversations(),
    loadTransferredConversations(),
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

    &-left {
      display: flex;
      flex: 8;
    }

    &-right {
      display: flex;
      flex: 2;
    }
  }
}
</style>
