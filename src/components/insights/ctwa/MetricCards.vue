<template>
  <section
    class="metric-cards"
    data-testid="ctwa-metric-cards"
  >
    <template
      v-for="(card, index) in cardDefinitions"
      :key="card.id"
    >
      <CardConversations
        :title="$t(card.titleKey)"
        :value="getCardValue(card.id)"
        :description="getCardDescription(card.id)"
        :borderRadius="getBorderRadius(index, cardDefinitions.length)"
        :isLoading="isLoadingCards"
        activeDescriptionGap
      />
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import CardConversations from '@/components/insights/cards/CardConversations.vue';
import { useLazyData } from '@/composables/useLazyData';
import { useConfig } from '@/store/modules/config';
import { useCTWA } from '@/store/modules/ctwa';
import { formatCurrency, formatNumber } from '@/utils/numbers';

defineOptions({
  name: 'MetricCards',
});

type CardId =
  | 'attributed_revenue'
  | 'ctwa_conversations'
  | 'organic_conversations';

interface CardData {
  id: CardId;
  titleKey: string;
}

const cardsBaseKey = 'ctwa_dashboard.cards';

const cardDefinitions: CardData[] = [
  {
    id: 'attributed_revenue',
    titleKey: `${cardsBaseKey}.attributed_revenue.title`,
  },
  {
    id: 'ctwa_conversations',
    titleKey: `${cardsBaseKey}.ctwa_conversations.title`,
  },
  {
    id: 'organic_conversations',
    titleKey: `${cardsBaseKey}.organic_conversations.title`,
  },
];

const { t } = useI18n();
const { projectCurrency } = storeToRefs(useConfig());
const ctwaStore = useCTWA();
const { appliedDateRange, dashboardData, loadingDashboardData } =
  storeToRefs(ctwaStore);
const { loadDashboardData } = ctwaStore;

useLazyData({
  load: loadDashboardData,
  watchSources: [appliedDateRange],
});

const isLoadingCards = computed(() => loadingDashboardData.value);

const formatMetric = (value: number | null) =>
  value === null || value === undefined ? '-' : formatNumber(value);

const formatMoney = (value: number | null) =>
  value === null || value === undefined
    ? '-'
    : formatCurrency(value, projectCurrency.value);

const getBorderRadius = (index: number, totalCards: number) => {
  if (index === 0) return 'left';
  if (index === totalCards - 1) return 'right';
  return 'none';
};

const getCardValue = (id: CardId) => {
  if (id === 'attributed_revenue') {
    return formatMoney(dashboardData.value.attributed_revenue.value);
  }

  return formatMetric(dashboardData.value[id]);
};

const getCardDescription = (id: CardId) => {
  if (id === 'attributed_revenue') {
    return t(`${cardsBaseKey}.attributed_revenue.description`, {
      avg: formatMoney(dashboardData.value.attributed_revenue.avg),
    });
  }

  return t(`${cardsBaseKey}.${id}.description`);
};
</script>

<style scoped lang="scss">
$min-height: 112px;

.metric-cards {
  display: flex;
  min-height: $min-height;
}
</style>
