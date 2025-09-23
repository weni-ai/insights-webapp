<template>
  <section class="time-metrics">
    <p class="time-metrics__title">
      {{ $t('human_support_dashboard.time_metrics.title') }}
    </p>
    <section class="time-metrics__cards">
      <template
        v-for="(card, index) in cardDefinitions"
        :key="`${card.id}-${index}`"
      >
        <CardConversations
          class="time-metrics__card"
          :title="$t(card.titleKey)"
          :value="getCardValue(card.id)"
          :description="getCardSubValue(card.id)"
          :tooltipInfo="$t(card.tooltipKey)"
          borderRadius="full"
          activeDescriptionGap
          enableTimeIcon
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
import { useI18n } from 'vue-i18n';
import { formatSecondsToTime } from '@/utils/time';

type CardId =
  | 'average_time_is_waiting'
  | 'average_time_first_response'
  | 'average_time_chat';

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
    id: 'average_time_chat',
    titleKey: 'human_support_dashboard.time_metrics.average_time_chat',
    tooltipKey:
      'human_support_dashboard.time_metrics.tooltips.average_time_chat',
  },
];

const { t } = useI18n();

const humanSupportMonitoring = useHumanSupportMonitoring();
const { loadTimeMetricsData } = humanSupportMonitoring;
const { timeMetricsData, loadingTimeMetricsData } = storeToRefs(
  humanSupportMonitoring,
);

const isLoadingCards = computed(() => loadingTimeMetricsData.value);

const getCardValue = (id: CardId) => {
  const data = timeMetricsData.value[id];
  return formatSecondsToTime(data?.average);
};

const getCardSubValue = (id: CardId) => {
  const data = timeMetricsData.value[id];
  if (data?.max !== null && data?.max !== undefined) {
    return `${t('human_support_dashboard.time_metrics.max')}: ${formatSecondsToTime(data.max)}`;
  }
  return '';
};

const getTooltipSide = (index: number) => {
  const lastIndex = cardDefinitions.length - 1;

  if (lastIndex === index) return 'left';

  return 'top';
};

onMounted(() => {
  loadTimeMetricsData();
});
</script>

<style scoped lang="scss">
$min-height: 134px;

.time-metrics {
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
