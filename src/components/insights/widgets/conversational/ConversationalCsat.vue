<template>
  <ProgressWidget
    :title="titleWidget"
    :actions="actions"
    :progressItems="progressItems"
    :footerText="footerText"
    :isLoading="isLoading && isLoadingEmptyData"
    :isLoadingProgress="isLoading"
    :currentTab="currentTab"
    :isError="isError"
    :actionError="actionError"
    type="csat"
    @tab-change="handleTabChange"
  >
    <template #setup-widget>
      <SetupWidget
        v-if="isSetupWidget"
        class="conversational-csat__setup-widget"
        :title="
          $t('conversations_dashboard.setup_csat_or_nps_widget.title', {
            type: 'CSAT',
            tab: tabName,
          })
        "
        :description="
          $t('conversations_dashboard.setup_csat_or_nps_widget.description', {
            type: 'CSAT',
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
    type="csat"
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
import type { CsatResponse } from '@/services/api/resources/conversational/widgets';
import { Tab } from '@/components/insights/conversations/BaseConversationWidget.vue';

const { t } = useI18n();
const route = useRoute();
const conversational = useConversational();
const { setIsDrawerCustomizableOpen } = conversational;
const { shouldUseMock } = storeToRefs(conversational);

const conversationalWidgets = useConversationalWidgets();
const { loadCsatWidgetData, setCsatWidgetType } = conversationalWidgets;

const {
  currentCsatWidget,
  isLoadingCsatWidgetData,
  csatWidgetData,
  csatWidgetType,
  isCsatHumanConfig,
  isCsatAiConfig,
  isCsatWidgetDataError,
} = storeToRefs(conversationalWidgets);

const isRemoveWidgetModalOpen = ref(false);

const titleWidget = computed(() => 'CSAT');

const isLoading = computed(() => isLoadingCsatWidgetData.value);

const isLoadingEmptyData = computed(() => !csatWidgetData.value);

const isError = computed(() => isCsatWidgetDataError.value);

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
  return t(`conversations_dashboard.${tabTranslations[csatWidgetType.value]}`);
});

const widgetData = computed(() => {
  const data = shouldUseMock.value
    ? csatWidgetData.value
    : currentCsatWidget.value?.data || null;
  return handleCsatWidgetData(data);
});

const progressItems = computed(() => {
  if (shouldUseMock.value) return widgetData.value.progressItems;

  if (
    (csatWidgetType.value === 'AI' && !isCsatAiConfig.value) ||
    (csatWidgetType.value === 'HUMAN' && !isCsatHumanConfig.value)
  ) {
    return [];
  }
  return widgetData.value.progressItems;
});

const footerText = computed(() => {
  return `${widgetData.value.reviews} ${t('conversations_dashboard.reviews')}`;
});

const isSetupWidget = computed(() => {
  const isCsatAi = csatWidgetType.value === 'AI' && !isCsatAiConfig.value;
  const isCsatHuman =
    csatWidgetType.value === 'HUMAN' && !isCsatHumanConfig.value;

  return isCsatAi || isCsatHuman;
});

const currentTab = computed(() => {
  const tabs = {
    AI: 'artificial-intelligence',
    HUMAN: 'human-support',
  };
  return tabs[csatWidgetType.value];
});

const actions = computed(() => {
  if (shouldUseMock.value) return [];

  const editOption = {
    icon: 'edit_square',
    text: t(
      'conversations_dashboard.customize_your_dashboard.edit_csat_or_nps',
      { type: 'CSAT' },
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

const handleCsatWidgetData = (data: CsatResponse) => {
  const defaultColors = {
    color: '#805AD5',
    backgroundColor: '#E9D8FD',
  };

  const formattedData = {
    '5': `🤩 ${t('conversations_dashboard.csat_widget.very_satisfied')}`,
    '4': `😁 ${t('conversations_dashboard.csat_widget.satisfied')}`,
    '3': `😐 ${t('conversations_dashboard.csat_widget.neutral')}`,
    '2': `☹️ ${t('conversations_dashboard.csat_widget.dissatisfied')}`,
    '1': `😡 ${t('conversations_dashboard.csat_widget.very_dissatisfied')}`,
  };

  const order = ['5', '4', '3', '2', '1'];

  if (data?.results?.length === 0) {
    return {
      reviews: 0,
      progressItems: [5, 4, 3, 2, 1].map((result) => ({
        text: formattedData[result.toString()],
        value: 0,
        color: defaultColors.color,
        backgroundColor: defaultColors.backgroundColor,
      })),
    };
  }

  return {
    reviews: data?.results?.reduce((acc, result) => acc + result.full_value, 0),
    progressItems: data?.results
      ?.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label))
      .map((result) => ({
        text: formattedData[result.label],
        value: result.value,
        color: defaultColors.color,
        backgroundColor: defaultColors.backgroundColor,
      })),
  };
};

const handleOpenDrawer = (isNew: boolean) => {
  setIsDrawerCustomizableOpen(true, 'csat', isNew);
};

const handleTabChange = (tab: Tab) => {
  if (tab === 'artificial-intelligence') {
    setCsatWidgetType('AI');
  } else {
    setCsatWidgetType('HUMAN');
  }
};

onMounted(() => {
  if (csatWidgetType.value === 'AI' && !isCsatAiConfig.value) {
    setCsatWidgetType('HUMAN');
  }
  loadCsatWidgetData();
});

watch(
  csatWidgetType,
  (value, oldValue) => {
    if (value !== oldValue) {
      if (value === 'HUMAN' && isCsatHumanConfig.value) {
        loadCsatWidgetData();
      } else if (value === 'AI' && isCsatAiConfig.value) {
        loadCsatWidgetData();
      }
    }
  },
  { flush: 'post' },
);

watch(
  () => route.query,
  () => {
    loadCsatWidgetData();
  },
  { deep: true },
);

watch(
  () => conversational.refreshDataConversational,
  (newValue) => {
    if (newValue) {
      conversational.setIsLoadingConversationalData('dynamicWidgets', true);
      loadCsatWidgetData().finally(() => {
        conversational.setIsLoadingConversationalData('dynamicWidgets', false);
      });
    }
  },
);
</script>

<style lang="scss" scoped>
.conversational-csat {
  &__setup-widget {
    $header-height: 120px;
    height: calc(100% - $header-height);
    top: $header-height / 2;
  }
}
</style>
