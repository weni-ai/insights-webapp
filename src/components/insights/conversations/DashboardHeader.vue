<template>
  <section
    class="dashboard-conversational__header"
    data-testid="dashboard-header"
  >
    <section
      class="header__cards"
      data-testid="dashboard-header-left"
    >
      <template
        v-for="(card, index) in cards"
        :key="card.id"
      >
        <CardConversations
          class="header__card"
          :title="card.title"
          :value="card.value"
          :description="card.description"
          :tooltipInfo="card.tooltipInfo"
          :borderRadius="getBorderRadius(index, cards.length)"
          :tooltipSide="'top'"
          :isLoading="card.isLoading"
          @click="handleCardClick(card.id)"
        />
      </template>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import CardConversations from '@/components/insights/cards/CardConversations.vue';
import Unnnic from '@weni/unnnic-system';
import { useI18n } from 'vue-i18n';
import { useWidgetFormatting } from '@/composables/useWidgetFormatting';
import conversationalHeaderApi from '@/services/api/resources/conversational/header';
import { useRoute } from 'vue-router';

const { formatPercentage, formatNumber } = useWidgetFormatting();

const { t } = useI18n();

const route = useRoute();

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
    id: 'transferred_to_human',
    titleKey: 'conversations_dashboard.header.transferred',
    tooltipKey: 'conversations_dashboard.header.tooltips.transferred',
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

watch(
  () => route.query,
  () => {
    loadCardData();
  },
);

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
    containerRef: null,
  });
};

const loadCardData = async () => {
  cardsData.value.forEach((card) => {
    card.isLoading = true;
  });

  try {
    const response =
      await conversationalHeaderApi.getConversationalHeaderTotals();

    response.forEach((metric) => {
      const cardToUpdate = cardsData.value.find(
        (card) => card.id === metric.id,
      );

      if (cardToUpdate) {
        if (metric.id === 'total_conversations') {
          cardToUpdate.value = formatNumber(metric.value);
          cardToUpdate.description = null;
        } else {
          cardToUpdate.value = formatPercentage(metric.percentage);
          cardToUpdate.description = `${formatNumber(metric.value)} ${t(
            'conversations_dashboard.conversations',
          )}`;
        }
      }
    });
  } catch (error) {
    console.error('Error loading conversational header data:', error);

    cardsData.value.forEach((card) => {
      card.value = '-';
      card.description = `0 ${t('conversations_dashboard.conversations')}`;
    });

    showErrorToast();
  } finally {
    cardsData.value.forEach((card) => {
      card.isLoading = false;
    });
  }
};

const handleCardClick = (cardId: string) => {
  const statusMap = {
    total_conversations: '',
    resolved: 'optimized_resolution',
    unresolved: 'other_conclusion',
    transferred_to_human: 'transferred_to_human_support',
  };

  window.parent.postMessage(
    {
      event: 'redirect',
      path: `ai-conversations:?status=${statusMap[cardId]}`,
    },
    '*',
  );
};

onMounted(() => {
  loadCardData();
});
</script>

<style scoped lang="scss">
$min-height: 134px;

.dashboard-conversational__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $unnnic-spacing-sm;

  width: 100%;

  .header__cards {
    display: flex;
    width: 100%;
    min-height: $min-height;
  }

  :deep(.header__card) {
    cursor: pointer;
  }
}
</style>
