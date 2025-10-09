<template>
  <section
    class="service-status"
    data-testid="service-status"
  >
    <p
      class="service-status__title"
      data-testid="service-status-title"
    >
      {{ $t('human_support_dashboard.support_status.title') }}
    </p>
    <section
      class="service-status__cards"
      data-testid="service-status-cards"
    >
      <template
        v-for="(card, index) in cardDefinitions"
        :key="`${card.id}-${index}`"
      >
        <CardConversations
          class="service-status__card"
          :title="$t(card.titleKey)"
          :value="getCardValue(card.id)"
          :tooltipInfo="$t(card.tooltipKey)"
          borderRadius="full"
          :tooltipSide="getTooltipSide(index)"
          :isLoading="isLoadingCards"
          :isClickable="['is_waiting', 'in_progress'].includes(card.id)"
          @click="handleCardClick(card.id)"
        />
      </template>
    </section>
  </section>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';

import CardConversations from '@/components/insights/cards/CardConversations.vue';
import {
  ActiveDetailedTab,
  useHumanSupportMonitoring,
} from '@/store/modules/humanSupport/monitoring';
import { storeToRefs } from 'pinia';

type CardId = 'is_waiting' | 'in_progress' | 'finished';

interface CardData {
  id: CardId;
  titleKey: string;
  tooltipKey: string;
}

const cardDefinitions: CardData[] = [
  {
    id: 'is_waiting',
    titleKey: 'human_support_dashboard.support_status.is_waiting',
    tooltipKey: 'human_support_dashboard.support_status.tooltips.is_waiting',
  },
  {
    id: 'in_progress',
    titleKey: 'human_support_dashboard.support_status.is_in_progress',
    tooltipKey:
      'human_support_dashboard.support_status.tooltips.is_in_progress',
  },
  {
    id: 'finished',
    titleKey: 'human_support_dashboard.support_status.is_closed',
    tooltipKey: 'human_support_dashboard.support_status.tooltips.is_closed',
  },
];

const humanSupportMonitoring = useHumanSupportMonitoring();
const { loadServiceStatusData, setActiveDetailedTab } = humanSupportMonitoring;
const { serviceStatusData, loadingServiceStatusData } = storeToRefs(
  humanSupportMonitoring,
);

const isLoadingCards = computed(() => loadingServiceStatusData.value);

const getCardValue = (id: CardId) => {
  return serviceStatusData.value[id]?.toString() || '-';
};

const getTooltipSide = (index: number) => {
  const lastIndex = cardDefinitions.length - 1;

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
  if (id === 'finished') return;

  const status = {
    is_waiting: 'in_awaiting',
    in_progress: 'in_progress',
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

.service-status {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-3;

  &__title {
    font: $unnnic-font-display-2;
  }

  &__cards {
    display: flex;
    gap: $unnnic-space-4;
    min-height: $min-height;
  }
}
</style>
