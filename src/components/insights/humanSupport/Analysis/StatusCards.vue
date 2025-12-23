<template>
  <section
    class="status-cards"
    data-testid="status-cards"
  >
    <section class="status-cards__finished">
      <template
        v-for="(card, index) in cardDefinitions.filter(
          (card) => card.id === 'finished',
        )"
        :key="`${card.id}-${index}`"
      >
        <CardConversations
          class="status-cards__finished-card"
          :title="$t(card.titleKey)"
          :value="getCardValue(card.id)"
          :tooltipInfo="$t(card.tooltipKey)"
          borderRadius="full"
          tooltipSide="right"
          :isLoading="isLoadingCards"
          :isClickable="card.id === 'finished'"
          @click="handleCardClick(card.id)"
        />
      </template>
    </section>
    <section
      class="status-cards__cards"
      data-testid="status-cards-cards"
    >
      <template
        v-for="(card, index) in cardDefinitions.filter(
          (card) => card.id !== 'finished',
        )"
        :key="`${card.id}-${index}`"
      >
        <CardConversations
          :title="$t(card.titleKey)"
          :value="getCardValue(card.id)"
          :tooltipInfo="$t(card.tooltipKey)"
          :borderRadius="getBorderRadius(index, cardDefinitions.length)"
          :tooltipSide="getTooltipSide(index)"
          :isLoading="isLoadingCards"
          enableTimeIcon
          activeDescriptionGap
        />
      </template>
    </section>
  </section>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';

import CardConversations from '@/components/insights/cards/CardConversations.vue';
import { storeToRefs } from 'pinia';
import {
  ActiveDetailedTab,
  useHumanSupportAnalysis,
} from '@/store/modules/humanSupport/analysis';
import { formatSecondsToTime } from '@/utils/time';

type CardId =
  | 'average_time_is_waiting'
  | 'average_time_first_response'
  | 'average_response_time'
  | 'average_time_chat'
  | 'finished';

interface CardData {
  id: CardId;
  titleKey: string;
  tooltipKey: string;
}

const baseTranslationKey = 'human_support_dashboard';
const timeMetricsBase = `${baseTranslationKey}.time_metrics`;

const createCard = (
  id: CardId,
  translationKey?: string,
  overrides: Partial<CardData> = {},
): CardData => {
  const key = translationKey || id;

  return {
    id,
    titleKey: `${timeMetricsBase}.${key}`,
    tooltipKey: `${timeMetricsBase}.tooltips.${key}`,
    ...overrides,
  };
};

const cardDefinitions: CardData[] = [
  createCard('average_time_is_waiting'),
  createCard('average_time_first_response'),
  createCard('average_response_time'),
  createCard('average_time_chat'),
  createCard('finished', undefined, {
    titleKey: `${baseTranslationKey}.support_status.is_closed`,
    tooltipKey: `${baseTranslationKey}.support_status.tooltips.is_closed_by_date`,
  }),
];

const humanSupportAnalysis = useHumanSupportAnalysis();
const { loadServiceStatusData, setActiveDetailedTab } = humanSupportAnalysis;
const { serviceStatusData, loadingServiceStatusData } =
  storeToRefs(humanSupportAnalysis);

const isLoadingCards = computed(() => loadingServiceStatusData.value);

const getBorderRadius = (index: number, totalCards: number) => {
  if (index === 0) return 'left';
  if (index === totalCards - 2) return 'right';
  return 'none';
};

const getCardValue = (id: CardId) => {
  if (
    [
      'average_time_is_waiting',
      'average_time_first_response',
      'average_response_time',
      'average_time_chat',
    ].includes(id)
  ) {
    return formatSecondsToTime(serviceStatusData.value[id]);
  }

  return serviceStatusData.value[id]?.toString() || '-';
};

const getTooltipSide = (index: number) => {
  const lastIndex = cardDefinitions.length - 2;

  if (lastIndex === index) return 'left';

  return 'top';
};

const scrollToDetailedMonitoring = () => {
  const detailedMonitoringElement = document.querySelector(
    '[id="detailed-monitoring"]',
  );

  if (detailedMonitoringElement) {
    detailedMonitoringElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
};

const handleCardClick = (id: CardId) => {
  if (id !== 'finished') return;

  const status = {
    finished: 'finished',
  };

  setActiveDetailedTab(status[id] as ActiveDetailedTab);
  setTimeout(scrollToDetailedMonitoring, 100);
};

onMounted(() => {
  loadServiceStatusData();
});
</script>

<style scoped lang="scss">
$min-height: 112px;

.status-cards {
  display: flex;
  gap: $unnnic-space-3;

  &__finished {
    flex: 1;
    min-height: $min-height;
  }

  &__cards {
    flex: 5;
    display: flex;
    min-height: $min-height;
  }
}
</style>
