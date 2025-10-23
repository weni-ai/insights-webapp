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

const cardDefinitions: CardData[] = [
  {
    id: 'average_time_is_waiting',
    titleKey: 'human_support_dashboard.time_metrics.average_time_is_waiting',
    tooltipKey:
      'human_support_dashboard.time_metrics.tooltips.average_time_is_waiting',
  },
  {
    id: 'average_time_first_response',
    titleKey:
      'human_support_dashboard.time_metrics.average_time_first_response',
    tooltipKey:
      'human_support_dashboard.time_metrics.tooltips.average_time_first_response',
  },
  {
    id: 'average_response_time',
    titleKey: 'human_support_dashboard.time_metrics.average_response_time',
    tooltipKey:
      'human_support_dashboard.time_metrics.tooltips.average_response_time',
  },
  {
    id: 'average_time_chat',
    titleKey: 'human_support_dashboard.time_metrics.average_time_chat',
    tooltipKey:
      'human_support_dashboard.time_metrics.tooltips.average_time_chat',
  },
  {
    id: 'finished',
    titleKey: 'human_support_dashboard.support_status.is_closed',
    tooltipKey:
      'human_support_dashboard.support_status.tooltips.is_closed_by_date',
  },
];

const humanSupportAnalysis = useHumanSupportAnalysis();
const { loadServiceStatusData, setActiveDetailedTab } = humanSupportAnalysis;
const { serviceStatusData, loadingServiceStatusData } =
  storeToRefs(humanSupportAnalysis);

const isLoadingCards = computed(() => loadingServiceStatusData.value);

const getBorderRadius = (index: number, totalCards: number) => {
  if (index === 0) return 'left';
  if (index === totalCards - 1) return 'right';
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
