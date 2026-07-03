<template>
  <section
    ref="timeMetrics"
    class="time-metrics"
    data-testid="time-metrics"
  >
    <BlurSetupWidget
      v-if="showSetup"
      v-bind="widgetSetupProps"
    />
    <p
      class="time-metrics__title"
      data-testid="time-metrics-title"
    >
      {{ $t('human_support_dashboard.time_metrics.title') }}
    </p>
    <section
      class="time-metrics__cards"
      data-testid="time-metrics-cards"
    >
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
          :alert="getCardAlert(card.id)"
          isClickable
          @click="handleCardClick(card.id)"
        />
      </template>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useMouseInElement } from '@vueuse/core';

import CardConversations from '@/components/insights/cards/CardConversations.vue';
import BlurSetupWidget from '@/components/insights/Layout/BlurSetupWidget.vue';

import { useLazyData } from '@/composables/useLazyData';

import {
  ActiveDetailedTab,
  useHumanSupportMonitoring,
} from '@/store/modules/humanSupport/monitoring';
import { useProject } from '@/store/modules/project';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { useFeatureFlag } from '@/store/modules/featureFlag';
import { useMetricGoalAlerts } from '@/store/modules/humanSupport/metricGoalAlerts';
import {
  MetricGoalBreach,
  TimeUnit,
} from '@/services/api/resources/humanSupport/monitoring/timeMetrics';
import type { MetricKey } from '@/services/api/resources/humanSupport/monitoring/metricGoals';

import { formatSecondsToTime } from '@/utils/time';
import { monitoringTimeMetricsMock } from './mocks';

type CardId =
  | 'average_time_is_waiting'
  | 'average_time_first_response'
  | 'average_time_chat';

type GoalKey =
  | 'waiting_time_goal'
  | 'first_response_time_goal'
  | 'conversation_duration_goal';

type AlertScheme = 'red' | 'orange' | 'yellow';

interface CardData {
  id: CardId;
  titleKey: string;
  tooltipKey: string;
}

const project = useProject();
const { hasSectorsConfigured } = storeToRefs(project);

const humanSupport = useHumanSupport();
const { widgetSetupProps } = storeToRefs(humanSupport);

const timeMetricsRef = useTemplateRef<HTMLDivElement>('timeMetrics');
const { isOutside } = useMouseInElement(timeMetricsRef);

const showSetup = computed(() => {
  return !hasSectorsConfigured.value && !isOutside.value;
});

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
const { loadTimeMetricsData, setActiveDetailedTab, setForceLoadDetailed } =
  humanSupportMonitoring;
const { timeMetricsData, loadingTimeMetricsData } = storeToRefs(
  humanSupportMonitoring,
);

const { isFeatureFlagEnabled } = useFeatureFlag();

const metricGoalAlertsStore = useMetricGoalAlerts();
const { liveBreaches } = storeToRefs(metricGoalAlertsStore);

const METRIC_BY_GOAL_KEY: Record<GoalKey, MetricKey> = {
  waiting_time_goal: 'waiting_time',
  first_response_time_goal: 'first_response_time',
  conversation_duration_goal: 'conversation_duration',
};

const cardAlertConfig: Record<
  CardId,
  { goalKey: GoalKey; scheme: AlertScheme }
> = {
  average_time_is_waiting: { goalKey: 'waiting_time_goal', scheme: 'red' },
  average_time_first_response: {
    goalKey: 'first_response_time_goal',
    scheme: 'orange',
  },
  average_time_chat: {
    goalKey: 'conversation_duration_goal',
    scheme: 'yellow',
  },
};

useLazyData({ load: loadTimeMetricsData });

const widgetData = computed(() => {
  if (!hasSectorsConfigured.value) {
    return monitoringTimeMetricsMock;
  }
  return timeMetricsData.value;
});

const isLoadingCards = computed(() => loadingTimeMetricsData.value);

const getCardValue = (id: CardId) => {
  const data = widgetData.value[id];
  return formatSecondsToTime(data?.average);
};

const getCardSubValue = (id: CardId) => {
  const data = widgetData.value[id];
  if (data?.max !== null && data?.max !== undefined) {
    return `${t('human_support_dashboard.time_metrics.max')}: ${formatSecondsToTime(data.max)}`;
  }
  return '';
};

const getCardAlert = (id: CardId) => {
  if (!isFeatureFlagEnabled('insightsOperationalAlerts')) return undefined;

  const { goalKey, scheme } = cardAlertConfig[id];
  const apiGoal = widgetData.value[goalKey] as MetricGoalBreach | undefined;
  const metric = METRIC_BY_GOAL_KEY[goalKey];
  const liveGoal = liveBreaches.value[metric];

  let goal: MetricGoalBreach | undefined;
  if (apiGoal?.isBreached) {
    goal = apiGoal;
  } else if (liveGoal?.isBreached) {
    goal = liveGoal;
  }

  if (!goal) return undefined;

  const unit = t(
    `operational_alerts.unit_word${goal.thresholdValue === 1 ? '_singular' : 's'}.${goal.unit as TimeUnit}`,
  ).toLowerCase();

  return {
    scheme,
    text: t('operational_alerts.card_alert', {
      count: goal.breachedRoomsCount,
      value: goal.thresholdValue,
      unit,
    }),
  };
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
  const status = {
    average_time_is_waiting: 'in_awaiting',
    average_time_first_response: 'in_progress',
    average_time_chat: 'in_progress',
  };

  setActiveDetailedTab(status[id] as ActiveDetailedTab);
  setForceLoadDetailed(true);
  setTimeout(scrollToDetailedMonitoring, 100);
};
</script>

<style scoped lang="scss">
$min-height: 134px;

.time-metrics {
  position: relative;
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
