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
          :title="card.title"
          :value="card.value"
          :description="card.description"
          :tooltipInfo="card.tooltipInfo"
          :borderRadius="getBorderRadius(index, cards.length)"
          :tooltipSide="'top'"
          :isLoading="card.isLoading"
        />
      </template>
    </section>
    <section
      class="header__summary"
      data-testid="dashboard-header-right"
    >
      <CardConversations
        :title="rightCard.title"
        :value="rightCard.value"
        :description="rightCard.description"
        :tooltipInfo="rightCard.tooltipInfo"
        :tooltipSide="'left'"
        :isLoading="rightCard.isLoading"
      />
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
  rightCardData.value.isLoading = true;

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
      } else if (metric.id === 'transferred_to_human') {
        rightCardData.value.value = formatPercentage(metric.percentage);
        rightCardData.value.description = `${formatNumber(metric.value)} ${t(
          'conversations_dashboard.conversations',
        )}`;
      }
    });
  } catch (error) {
    console.error('Error loading conversational header data:', error);

    cardsData.value.forEach((card) => {
      card.value = '-';
      card.description = `0 ${t('conversations_dashboard.conversations')}`;
    });

    rightCardData.value.value = '-';
    rightCardData.value.description = `0 ${t(
      'conversations_dashboard.conversations',
    )}`;

    showErrorToast();
  } finally {
    cardsData.value.forEach((card) => {
      card.isLoading = false;
    });
    rightCardData.value.isLoading = false;
  }
};

onMounted(() => {
  loadCardData();
});
</script>

<style scoped lang="scss">
.dashboard-conversational__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $unnnic-spacing-sm;

  width: 100%;

  .header__cards {
    display: flex;
    flex: 9;
  }

  .header__summary {
    display: flex;
    flex: 3;
  }
}
</style>
