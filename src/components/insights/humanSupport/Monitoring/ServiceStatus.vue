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
        />
      </template>
    </section>
  </section>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';

import CardConversations from '@/components/insights/cards/CardConversations.vue';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { storeToRefs } from 'pinia';

type CardId = 'is_awaiting' | 'in_progress' | 'finished';

interface CardData {
  id: CardId;
  titleKey: string;
  tooltipKey: string;
}

const cardDefinitions: CardData[] = [
  {
    id: 'is_awaiting',
    titleKey: 'human_support_dashboard.support_status.is_awaiting',
    tooltipKey: 'human_support_dashboard.support_status.tooltips.is_awaiting',
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
const { loadServiceStatusData } = humanSupportMonitoring;
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
