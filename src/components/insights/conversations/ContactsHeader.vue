<template>
  <section
    class="dashboard-conversational__contacts-header"
    data-testid="contacts-header"
  >
    <section
      class="header__cards"
      data-testid="contacts-header-left"
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
          :tooltipSide="handleTooltipSide(card.id)"
          :isLoading="card.isLoading"
        />
      </template>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import CardConversations from '@/components/insights/cards/CardConversations.vue';
import Unnnic from '@weni/unnnic-system';
import { useI18n } from 'vue-i18n';
import { useWidgetFormatting } from '@/composables/useWidgetFormatting';
import conversationalContactsApi from '@/services/api/resources/conversational/contacts';
import { MOCK_CONTACTS_DATA } from '@/services/api/resources/conversational/mocks';
import { useRoute } from 'vue-router';
import { useConversational } from '@/store/modules/conversational/conversational';
import { useDashboards } from '@/store/modules/dashboards';
import { storeToRefs } from 'pinia';
import type { ContactMetricId } from '@/services/api/resources/conversational/contacts';

const { formatPercentage, formatNumber } = useWidgetFormatting();

const { t } = useI18n();

const route = useRoute();

const dashboardsStore = useDashboards();
const conversationalStore = useConversational();
const { shouldUseMock } = storeToRefs(conversationalStore);

const cardDefinitions: {
  id: ContactMetricId;
  titleKey: string;
  tooltipKey: string;
}[] = [
  {
    id: 'unique',
    titleKey: 'conversations_dashboard.contacts_header.unique',
    tooltipKey: 'conversations_dashboard.contacts_header.tooltips.unique',
  },
  {
    id: 'returning',
    titleKey: 'conversations_dashboard.contacts_header.returning',
    tooltipKey: 'conversations_dashboard.contacts_header.tooltips.returning',
  },
  {
    id: 'avg_conversations_per_contact',
    titleKey: 'conversations_dashboard.contacts_header.avg',
    tooltipKey: 'conversations_dashboard.contacts_header.tooltips.avg',
  },
];

const createInitialCardData = () => ({
  value: '-',
  description: null as string | null,
  isLoading: true,
});

const cardsData = ref(
  cardDefinitions.map((def) => ({
    id: def.id,
    ...createInitialCardData(),
  })),
);

const formatMetricValue = (
  id: ContactMetricId,
  metric: { value: number; percentage?: number },
) => {
  if (id === 'returning') {
    return {
      value: formatNumber(metric.value),
      description:
        typeof metric.percentage === 'number'
          ? `${formatPercentage(metric.percentage)} ${t(
              'conversations_dashboard.contacts_header.returning_description_suffix',
            )}`
          : null,
    };
  }

  return { value: formatNumber(metric.value), description: null };
};

const mockCards = computed(() => {
  return cardDefinitions.map((def) => {
    const metric = MOCK_CONTACTS_DATA.find((m) => m.id === def.id);
    const formatted = metric
      ? formatMetricValue(def.id, metric)
      : { value: '-', description: null };

    return {
      id: def.id,
      title: t(def.titleKey),
      tooltipInfo: t(def.tooltipKey),
      isLoading: false,
      ...formatted,
    };
  });
});

const apiCards = computed(() =>
  cardDefinitions.map((def, index) => ({
    id: def.id,
    title: t(def.titleKey),
    value: cardsData.value[index].value,
    description: cardsData.value[index].description,
    tooltipInfo: t(def.tooltipKey),
    isLoading: cardsData.value[index].isLoading,
  })),
);

const cards = computed(() =>
  shouldUseMock.value ? mockCards.value : apiCards.value,
);

let loadCardDataAbortController: AbortController | null = null;

watch(
  () => route.query,
  () => {
    if (shouldUseMock.value) return;
    dashboardsStore.updateLastUpdatedRequest();
    loadCardData();
  },
);

watch(
  () => conversationalStore.refreshDataConversational,
  (newValue) => {
    if (newValue && !shouldUseMock.value) {
      dashboardsStore.updateLastUpdatedRequest();
      conversationalStore.setIsLoadingConversationalData(
        'contactsHeader',
        true,
      );
      loadCardData().finally(() => {
        conversationalStore.setIsLoadingConversationalData(
          'contactsHeader',
          false,
        );
      });
    }
  },
);

const getBorderRadius = (index: number, totalCards: number) => {
  if (totalCards === 1) return 'full';
  if (index === 0) return 'left';
  if (index === totalCards - 1) return 'right';
  return 'none';
};

const handleTooltipSide = (cardId: ContactMetricId) => {
  if (cardId === 'avg_conversations_per_contact') return 'left';
  return 'top';
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

const applyMetrics = (metrics: typeof MOCK_CONTACTS_DATA) => {
  metrics.forEach((metric) => {
    const cardToUpdate = cardsData.value.find((card) => card.id === metric.id);

    if (cardToUpdate) {
      const formatted = formatMetricValue(metric.id, metric);
      cardToUpdate.value = formatted.value;
      cardToUpdate.description = formatted.description;
    }
  });
};

const loadCardData = async () => {
  if (loadCardDataAbortController) {
    loadCardDataAbortController.abort();
  }
  loadCardDataAbortController = new AbortController();
  const { signal } = loadCardDataAbortController;

  cardsData.value.forEach((card) => {
    card.isLoading = true;
  });

  try {
    const response = await conversationalContactsApi.getConversationalContacts(
      {},
      { signal },
    );

    if (signal.aborted) return;

    applyMetrics(response);
    conversationalStore.setEndpointError('contacts', false);
    if (response.length > 0) {
      conversationalStore.setHasEndpointData(true);
    }
  } catch (error) {
    if (signal.aborted) return;

    conversationalStore.setEndpointError('contacts', true);
    console.error('Error loading conversational contacts data:', error);

    cardsData.value.forEach((card) => {
      card.value = '-';
      card.description = null;
    });
    if (!conversationalStore.shouldUseMock) {
      showErrorToast();
    }
  } finally {
    if (!signal.aborted) {
      cardsData.value.forEach((card) => {
        card.isLoading = false;
      });
    }
  }
};

onMounted(() => {
  dashboardsStore.updateLastUpdatedRequest();
  loadCardData();
});

onUnmounted(() => {
  if (loadCardDataAbortController) {
    loadCardDataAbortController.abort();
    loadCardDataAbortController = null;
  }
});
</script>

<style scoped lang="scss">
$min-height: 134px;

.dashboard-conversational__contacts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $unnnic-space-4;

  width: 100%;

  .header__cards {
    display: flex;
    width: 100%;
    min-height: $min-height;
  }
}
</style>
