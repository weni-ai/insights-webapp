<template>
  <ProgressWidget
    :title="titleWidget"
    :actions="actions"
    :progressItems="progressItems"
    :card="card"
    :footerText="footerText"
    :isLoading="isLoading && isLoadingEmptyData"
    :isLoadingProgress="isLoading"
    :currentTab="currentTab"
    :isError="isError"
    :actionError="actionError"
    type="nps"
    @tab-change="handleTabChange"
  >
    <template #setup-widget>
      <SetupWidget
        v-if="isSetupWidget"
        class="conversational-nps__setup-widget"
        :title="
          $t('conversations_dashboard.setup_csat_or_nps_widget.title', {
            type: 'NPS',
            tab: tabName,
          })
        "
        :description="
          $t('conversations_dashboard.setup_csat_or_nps_widget.description', {
            type: 'NPS',
            tab: tabName,
          })
        "
        :actionText="
          $t('conversations_dashboard.setup_csat_or_nps_widget.action_text')
        "
        @action="handleOpenDrawer(false)"
      />
    </template>
  </ProgressWidget>

  <ModalRemoveWidget
    v-if="isRemoveWidgetModalOpen"
    v-model="isRemoveWidgetModalOpen"
    type="nps"
    :name="titleWidget"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

import ProgressWidget from '@/components/insights/widgets/ProgressWidget.vue';
import SetupWidget from '@/components/insights/conversations/SetupWidget.vue';
import ModalRemoveWidget from '@/components/insights/conversations/CustomizableWidget/ModalRemoveWidget.vue';
import { useConversationalWidgets } from '@/store/modules/conversational/widgets';
import { useConversational } from '@/store/modules/conversational/conversational';
import type { NpsResponse } from '@/services/api/resources/conversational/widgets';
import { Tab } from '@/components/insights/conversations/BaseConversationWidget.vue';

const { t } = useI18n();
const route = useRoute();
const conversational = useConversational();
const { setIsDrawerCustomizableOpen } = conversational;
const { shouldUseMock } = storeToRefs(conversational);

const conversationalWidgets = useConversationalWidgets();
const { loadNpsWidgetData, setNpsWidgetType } = conversationalWidgets;

const {
  currentNpsWidget,
  isLoadingNpsWidgetData,
  npsWidgetData,
  npsWidgetType,
  isNpsHumanConfig,
  isNpsAiConfig,
  isNpsWidgetDataError,
} = storeToRefs(conversationalWidgets);

const isRemoveWidgetModalOpen = ref(false);

const titleWidget = computed(() => 'NPS');

const isLoading = computed(() => isLoadingNpsWidgetData.value);

const isLoadingEmptyData = computed(() => !npsWidgetData.value);

const isError = computed(() => isNpsWidgetDataError.value);

const actionError = computed(() => ({
  title: t('conversations_dashboard.widget_error.title'),
  buttonText: t('conversations_dashboard.widget_error.button'),
  onClick: () => handleOpenDrawer(false),
}));

const tabName = computed(() => {
  const tabTranslations = {
    AI: 'artificial_intelligence',
    HUMAN: 'human_support',
  };
  return t(`conversations_dashboard.${tabTranslations[npsWidgetType.value]}`);
});

const widgetData = computed(() => {
  const data = shouldUseMock.value
    ? npsWidgetData.value
    : currentNpsWidget.value?.data || null;
  return handleNpsWidgetData(data);
});

const progressItems = computed(() => {
  if (shouldUseMock.value) return widgetData.value.progressItems;

  if (
    (npsWidgetType.value === 'AI' && !isNpsAiConfig.value) ||
    (npsWidgetType.value === 'HUMAN' && !isNpsHumanConfig.value)
  ) {
    return [];
  }
  return widgetData.value.progressItems;
});

const card = computed(() => widgetData.value.card);

const footerText = computed(() => {
  return `${widgetData.value.reviews} ${t('conversations_dashboard.reviews')}`;
});

const isSetupWidget = computed(() => {
  const isNpsAi = npsWidgetType.value === 'AI' && !isNpsAiConfig.value;
  const isNpsHuman = npsWidgetType.value === 'HUMAN' && !isNpsHumanConfig.value;

  return isNpsAi || isNpsHuman;
});

const currentTab = computed(() => {
  const tabs = {
    AI: 'artificial-intelligence',
    HUMAN: 'human-support',
  };
  return tabs[npsWidgetType.value];
});

const actions = computed(() => {
  if (shouldUseMock.value) return [];

  const editOption = {
    icon: 'edit_square',
    text: t(
      'conversations_dashboard.customize_your_dashboard.edit_csat_or_nps',
      { type: 'NPS' },
    ),
    onClick: () => handleOpenDrawer(false),
  };

  const deleteOption = {
    icon: 'delete',
    text: t('conversations_dashboard.customize_your_dashboard.remove_widget'),
    onClick: () => (isRemoveWidgetModalOpen.value = true),
    scheme: 'aux-red-500',
  };

  return [editOption, deleteOption];
});

const handleNpsWidgetData = (data: NpsResponse) => {
  const colors = {
    promoters: {
      color: '#38A169',
      backgroundColor: '#C6F6D5',
    },
    passives: {
      color: '#D69E2E',
      backgroundColor: '#FEEBC8',
    },
    detractors: {
      color: '#E53E3E',
      backgroundColor: '#FED7D7',
    },
  };

  const formattedData = {
    promoters: t('conversations_dashboard.nps_widget.promoters'),
    passives: t('conversations_dashboard.nps_widget.passive'),
    detractors: t('conversations_dashboard.nps_widget.detractors'),
    current_score: t('conversations_dashboard.nps_widget.current_score'),
  };

  const currentScoreTypes = {
    low: t('conversations_dashboard.nps_widget.current_score_types.low'),
    good: t('conversations_dashboard.nps_widget.current_score_types.good'),
    great: t('conversations_dashboard.nps_widget.current_score_types.great'),
    excellent: t(
      'conversations_dashboard.nps_widget.current_score_types.excellent',
    ),
  };

  const handleCurrentScoreType = (score: number) => {
    if (score >= 71) return currentScoreTypes.excellent;
    if (score >= 31) return currentScoreTypes.great;
    if (score >= 1) return currentScoreTypes.good;
    return currentScoreTypes.low;
  };

  const card = {
    title: formattedData.current_score,
    value: data?.score?.toString(),
    valueDescription: handleCurrentScoreType(data?.score),
    tooltipInfo: `${t(
      'conversations_dashboard.nps_widget.tooltips.classification',
    )}
      ${t('conversations_dashboard.nps_widget.tooltips.low')}
      ${t('conversations_dashboard.nps_widget.tooltips.good')}
      ${t('conversations_dashboard.nps_widget.tooltips.great')}
      ${t('conversations_dashboard.nps_widget.tooltips.excellent')}
    `,
    isLoading: isLoadingNpsWidgetData.value,
  };

  if (data?.total_responses === 0) {
    return {
      reviews: 0,
      card: {
        title: formattedData.current_score,
        value: '0',
        valueDescription: '-',
        tooltipInfo: '-',
        isLoading: isLoadingNpsWidgetData.value,
      },
      progressItems: ['promoters', 'passives', 'detractors'].map((key) => ({
        text: formattedData[key],
        value: 0,
        color: colors[key].color,
        backgroundColor: colors[key].backgroundColor,
      })),
    };
  }

  return {
    reviews: data?.total_responses,
    card,
    progressItems: Object.entries(colors).map(([key, value]) => ({
      text: formattedData[key],
      value: data?.[key],
      color: value.color,
      backgroundColor: value.backgroundColor,
    })),
  };
};

const handleOpenDrawer = (isNew: boolean) => {
  setIsDrawerCustomizableOpen(true, 'nps', isNew);
};

const handleTabChange = (tab: Tab) => {
  if (tab === 'artificial-intelligence') {
    setNpsWidgetType('AI');
  } else {
    setNpsWidgetType('HUMAN');
  }
};

onMounted(() => {
  if (npsWidgetType.value === 'AI' && !isNpsAiConfig.value) {
    setNpsWidgetType('HUMAN');
  }
  loadNpsWidgetData();
});

watch(
  npsWidgetType,
  (value, oldValue) => {
    if (value !== oldValue) {
      if (value === 'HUMAN' && isNpsHumanConfig.value) {
        loadNpsWidgetData();
      } else if (value === 'AI' && isNpsAiConfig.value) {
        loadNpsWidgetData();
      }
    }
  },
  { flush: 'post' },
);

watch(
  () => route.query,
  () => {
    loadNpsWidgetData();
  },
  { deep: true },
);

watch(
  () => conversational.refreshDataConversational,
  (newValue) => {
    if (newValue) {
      conversational.setIsLoadingConversationalData('dynamicWidgets', true);
      loadNpsWidgetData().finally(() => {
        conversational.setIsLoadingConversationalData('dynamicWidgets', false);
      });
    }
  },
);
</script>

<style lang="scss" scoped>
.conversational-nps {
  &__setup-widget {
    $header-height: 120px;
    height: calc(100% - $header-height);
    top: $header-height / 2;
  }
}
</style>
