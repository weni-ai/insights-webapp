<template>
  <section class="conversational-dynamic-widget">
    <ProgressWidget
      :title="titleWidget"
      :actions="actions"
      :progressItems="renderProgressItems"
      :card="renderCard"
      :footerText="renderFooterText"
      :isLoading="isLoading && isLoadingEmptyData"
      :isLoadingProgress="isLoading"
      :currentTab="handleCurrentTab"
      :isOnlyTab="isOnlyTab"
      :isExpanded="isExpanded"
      :isError="isError"
      :actionError="actionError"
      :type="type"
      @open-expanded="handleOpenExpanded"
      @tab-change="handleTabChange"
    >
      <template #setup-widget>
        <SetupWidget
          v-if="isSetupWidget"
          class="conversational-dynamic-widget__setup-widget"
          :title="
            $t('conversations_dashboard.setup_csat_or_nps_widget.title', {
              type: type.toUpperCase(),
              tab: tabName,
            })
          "
          :description="
            $t('conversations_dashboard.setup_csat_or_nps_widget.description', {
              type: type.toUpperCase(),
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

    <AddCustomizableWidget
      v-if="type === 'add'"
      @add="handleOpenDrawer(true)"
    />

    <ModalRemoveWidget
      v-if="isRemoveWidgetModalOpen && type !== 'add'"
      v-model="isRemoveWidgetModalOpen"
      :type="type"
      :uuid="uuid"
      :name="titleWidget"
    />

    <SeeAllDrawer
      v-if="isSeeAllDrawerOpen"
      v-model="isSeeAllDrawerOpen"
      :data="getCustomWidgetByUuid(props.uuid as string)?.data?.results || []"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import ProgressWidget from '@/components/insights/widgets/ProgressWidget.vue';
import AddCustomizableWidget from '@/components/insights/conversations/CustomizableWidget/AddCustomizableWidget.vue';
import ModalRemoveWidget from '@/components/insights/conversations/CustomizableWidget/ModalRemoveWidget.vue';
import { useI18n } from 'vue-i18n';
import SetupWidget from './SetupWidget.vue';
import SeeAllDrawer from './CustomizableWidget/SeeAllDrawer.vue';

const { t } = useI18n();
import { useConversationalWidgets } from '@/store/modules/conversational/widgets';
import { storeToRefs } from 'pinia';
import {
  CsatResponse,
  NpsResponse,
  CustomWidgetResponse,
} from '@/services/api/resources/conversational/widgets';
import { Tab } from './BaseConversationWidget.vue';
import { useConversational } from '@/store/modules/conversational/conversational';
import { useRoute } from 'vue-router';
import { useCustomWidgets } from '@/store/modules/conversational/customWidgets';

const props = defineProps<{
  type: 'csat' | 'nps' | 'add' | 'sales_funnel' | 'custom';
  uuid?: string;
}>();

const isSeeAllDrawerOpen = ref(false);
const isRemoveWidgetModalOpen = ref(false);
const conversational = useConversational();
const { setIsDrawerCustomizableOpen } = conversational;
const route = useRoute();

const conversationalWidgets = useConversationalWidgets();
const conversationalCustomWidgets = useCustomWidgets();
const {
  loadCustomWidgetData,
  getCustomWidgetByUuid,
  getIsLoadingByUuid,
  setCustomForm,
} = conversationalCustomWidgets;

const { customWidgetDataErrorByUuid } = storeToRefs(
  conversationalCustomWidgets,
);

const {
  loadCsatWidgetData,
  loadNpsWidgetData,
  setCsatWidgetType,
  setNpsWidgetType,
  loadSalesFunnelWidgetData,
} = conversationalWidgets;

const {
  currentCsatWidget,
  currentNpsWidget,
  isLoadingCsatWidgetData,
  isLoadingNpsWidgetData,
  isLoadingSalesFunnelWidgetData,
  csatWidgetData,
  npsWidgetData,
  salesFunnelWidgetData,
  csatWidgetType,
  npsWidgetType,
  isCsatHumanConfig,
  isCsatAiConfig,
  isNpsHumanConfig,
  isNpsAiConfig,
  isCsatWidgetDataError,
  isNpsWidgetDataError,
} = storeToRefs(conversationalWidgets);

const isCsatOrNps = computed(() => {
  return ['csat', 'nps'].includes(props.type);
});

const actionError = computed(() => {
  return {
    title: t('conversations_dashboard.widget_error.title'),
    buttonText: t('conversations_dashboard.widget_error.button'),
    onClick: () => handleOpenDrawer(false),
  };
});

const isError = computed(() => {
  // TODO: sales funnel error
  if (props.type === 'csat') {
    return isCsatWidgetDataError.value;
  }

  if (props.type === 'nps') {
    return isNpsWidgetDataError.value;
  }

  if (props.type === 'custom') {
    return customWidgetDataErrorByUuid.value[props.uuid as string] || false;
  }

  return false;
});

const widgetType = computed(() => {
  const widgetTypes = {
    csat: 'csat',
    nps: 'nps',
    sales_funnel: 'sales_funnel',
    custom: 'custom',
  };

  return widgetTypes[props.type];
});

const isLoading = computed(() => {
  const isLoadingTypes = {
    csat: isLoadingCsatWidgetData.value,
    nps: isLoadingNpsWidgetData.value,
    sales_funnel: isLoadingSalesFunnelWidgetData.value,
    custom: getIsLoadingByUuid(props.uuid as string),
  };

  return isLoadingTypes[props.type];
});

const isLoadingEmptyData = computed(() => {
  const dataMapper = {
    csat: csatWidgetData.value,
    nps: npsWidgetData.value,
    sales_funnel: salesFunnelWidgetData.value,
    custom: getIsLoadingByUuid(props.uuid as string),
  };

  return !dataMapper[props.type] || false;
});

const widgetData = computed(() => {
  const widgetDataTypes = {
    csat: handleCsatWidgetData(currentCsatWidget.value?.data || null),
    nps: handleNpsWidgetData(currentNpsWidget.value?.data || null),
    custom: handleCustomWidgetData(
      getCustomWidgetByUuid(props.uuid as string)?.data || { results: [] },
    ),
  };

  return widgetDataTypes[props.type];
});

const renderProgressItems = computed(() => {
  if (props.type === 'csat') {
    if (
      (csatWidgetType.value === 'AI' && !isCsatAiConfig.value) ||
      (csatWidgetType.value === 'HUMAN' && !isCsatHumanConfig.value)
    ) {
      return [];
    }

    return widgetData.value.progressItems;
  }

  if (props.type === 'nps') {
    if (
      (npsWidgetType.value === 'AI' && !isNpsAiConfig.value) ||
      (npsWidgetType.value === 'HUMAN' && !isNpsHumanConfig.value)
    ) {
      return [];
    }
    return widgetData.value.progressItems;
  }

  if (props.type === 'custom') {
    return widgetData.value.progressItems;
  }

  return MOCK_DATA;
});

const tabName = computed(() => {
  const type =
    props.type === 'csat' ? csatWidgetType.value : npsWidgetType.value;
  const tabTranslations = {
    AI: 'artificial_intelligence',
    HUMAN: 'human_support',
  };

  return t(`conversations_dashboard.${tabTranslations[type]}`);
});

const renderCard = computed(() => {
  if (props.type === 'csat') {
    return widgetData.value.card;
  }

  if (props.type === 'nps') {
    return widgetData.value.card;
  }

  return null;
});

const renderFooterText = computed(() => {
  if (isCsatOrNps.value) {
    return `${widgetData.value.reviews} ${t('conversations_dashboard.reviews')}`;
  }

  return null;
});

const isSetupWidget = computed(() => {
  const isCsat = props.type === 'csat';
  const isNps = props.type === 'nps';
  const isCsatAi =
    isCsat && csatWidgetType.value === 'AI' && !isCsatAiConfig.value;
  const isCsatHuman =
    isCsat && csatWidgetType.value === 'HUMAN' && !isCsatHumanConfig.value;
  const isNpsAi = isNps && npsWidgetType.value === 'AI' && !isNpsAiConfig.value;
  const isNpsHuman =
    isNps && npsWidgetType.value === 'HUMAN' && !isNpsHumanConfig.value;

  if (isCsatAi || isCsatHuman) {
    return true;
  }

  if (isNpsAi || isNpsHuman) {
    return true;
  }

  return false;
});

const handleCurrentTab = computed(() => {
  const tabs = {
    csat: {
      AI: 'artificial-intelligence',
      HUMAN: 'human-support',
    },
    nps: {
      AI: 'artificial-intelligence',
      HUMAN: 'human-support',
    },
  };

  if (props.type === 'csat') {
    return tabs[props.type][csatWidgetType.value];
  }

  if (props.type === 'nps') {
    return tabs[props.type][npsWidgetType.value];
  }

  if (props.type === 'custom') {
    return 'artificial-intelligence';
  }

  return '';
});

const isOnlyTab = computed(() => {
  if (props.type === 'custom') return true;

  return false;
});

const isExpanded = computed(() => {
  if (props.type === 'custom') {
    const customWidget = getCustomWidgetByUuid(props.uuid as string);

    return customWidget?.data?.results?.length > 5 || false;
  }

  return false;
});

const titleWidget = computed(() => {
  const defaultTitle = widgetType.value?.toUpperCase() || '-';

  if (props.type === 'custom') {
    return getCustomWidgetByUuid(props.uuid as string)?.name || defaultTitle;
  }

  if (props.type === 'sales_funnel') {
    return t('conversations_dashboard.sales_funnel');
  }

  return defaultTitle;
});

const handleOpenExpanded = () => {
  isSeeAllDrawerOpen.value = true;
};

onMounted(() => {
  if (props.type === 'csat') {
    if (csatWidgetType.value === 'AI' && !isCsatAiConfig.value) {
      setCsatWidgetType('HUMAN');
    }
    loadCsatWidgetData();
  }

  if (props.type === 'nps') {
    if (npsWidgetType.value === 'AI' && !isNpsAiConfig.value) {
      setNpsWidgetType('HUMAN');
    }
    loadNpsWidgetData();
  }

  if (props.type === 'sales_funnel') {
    loadSalesFunnelWidgetData();
  }

  if (props.type === 'custom') {
    loadCustomWidgetData(props.uuid as string);
  }
});

const actions = computed(() => {
  const editOption = {
    icon: 'edit_square',
    text: t(
      'conversations_dashboard.customize_your_dashboard.edit_csat_or_nps',
      {
        type: ['csat', 'nps'].includes(props.type)
          ? props.type.toUpperCase()
          : '',
      },
    ),
    onClick: () => handleOpenDrawer(false),
  };

  const deleteOption = {
    icon: 'delete',
    text: t('conversations_dashboard.customize_your_dashboard.remove_widget'),
    onClick: () => (isRemoveWidgetModalOpen.value = true),
    scheme: 'aux-red-500',
  };

  if (props.type === 'sales_funnel') {
    return [deleteOption];
  }

  return [editOption, deleteOption];
});

const handleCustomWidgetData = (data: CustomWidgetResponse) => {
  const defaultColors = {
    color: '#3182CE',
    backgroundColor: '#BEE3F8',
  };

  if (data?.results?.length === 0) {
    return {
      progressItems: [5, 4, 3, 2, 1]?.map(() => ({
        text: '-',
        value: 0,
        color: defaultColors.color,
        backgroundColor: defaultColors.backgroundColor,
      })),
    };
  }

  const orderByValue = data?.results?.sort((a, b) => b.value - a.value);

  return {
    progressItems: orderByValue?.slice(0, 5)?.map((result) => ({
      text: result?.label,
      value: result?.value,
      color: defaultColors.color,
      backgroundColor: defaultColors.backgroundColor,
    })),
  };
};

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
  if (props.type === 'custom') {
    if (!isNew) {
      const customWidget = getCustomWidgetByUuid(props.uuid as string);

      setCustomForm({
        agent_uuid: customWidget?.config?.datalake_config?.agent_uuid,
        agent_name: '',
        key: customWidget?.config?.datalake_config?.key,
        widget_uuid: customWidget?.uuid,
        widget_name: customWidget?.name,
      });
    }
  }

  setIsDrawerCustomizableOpen(true, props.type, isNew);
};

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
    value: data?.score,
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
        value: 0,
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

const handleTabChange = (tab: Tab) => {
  if (props.type === 'custom') return;

  const setWidgetType = {
    csat: setCsatWidgetType,
    nps: setNpsWidgetType,
  };

  if (tab === 'artificial-intelligence') {
    setWidgetType[props.type]('AI');
  } else {
    setWidgetType[props.type]('HUMAN');
  }
};

watch(
  csatWidgetType,
  (value, oldValue) => {
    if (props.type !== 'csat') return;
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
  npsWidgetType,
  (value, oldValue) => {
    if (props.type !== 'nps') return;
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
    if (props.type === 'add') return;

    if (props.type === 'csat') {
      loadCsatWidgetData();
    } else if (props.type === 'nps') {
      loadNpsWidgetData();
    } else if (props.type === 'custom' && props.uuid) {
      loadCustomWidgetData(props.uuid);
    } else if (props.type === 'sales_funnel') {
      loadSalesFunnelWidgetData();
    }
  },
  { deep: true },
);

const MOCK_DATA = [
  {
    text: '🤩 Very satisfied',
    value: 57,
    color: '#805AD5',
    backgroundColor: '#E9D8FD',
  },
  {
    text: '😁 Satisfied',
    value: 25,
    color: '#805AD5',
    backgroundColor: '#E9D8FD',
  },
  {
    text: '😐 Neutral',
    value: 12,
    color: '#805AD5',
    backgroundColor: '#E9D8FD',
  },
  {
    text: '☹️ Dissatisfied',
    value: 5,
    color: '#805AD5',
    backgroundColor: '#E9D8FD',
  },
  {
    text: '😡 Very dissatisfied',
    value: 1,
    color: '#805AD5',
    backgroundColor: '#E9D8FD',
  },
];
</script>

<style lang="scss" scoped>
.conversational-dynamic-widget {
  position: relative;
  min-height: 490px;

  &__setup-widget {
    $header-height: 120px;
    height: calc(100% - $header-height);
    top: $header-height / 2;
  }
}
</style>
