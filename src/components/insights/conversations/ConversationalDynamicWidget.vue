<template>
  <section class="conversational-dynamic-widget">
    <ProgressWidget
      :title="widgetType?.toUpperCase() || '-'"
      :actions="actions"
      :progressItems="renderProgressItems"
      :card="renderCard"
      :footerText="renderFooterText"
      :isLoading="
        isLoading && (type === 'nps' ? !npsWidgetData : !csatWidgetData)
      "
      :isLoadingProgress="isLoading"
      @tab-change="handleTabChange"
    >
      <template #setup-widget>
        <SetupWidget
          v-if="isSetupWidget"
          class="conversational-dynamic-widget__setup-widget"
          :title="
            $tc('conversations_dashboard.setup_csat_or_nps_widget.title', {
              type: type.toUpperCase(),
              tab: type === 'csat' ? csatWidgetType : npsWidgetType,
            })
          "
          :description="
            $tc(
              'conversations_dashboard.setup_csat_or_nps_widget.description',
              {
                type: type.toUpperCase(),
                tab: type === 'csat' ? csatWidgetType : npsWidgetType,
              },
            )
          "
          :actionText="
            $t('conversations_dashboard.setup_csat_or_nps_widget.action_text')
          "
          @action="handleOpenDrawer"
        />
      </template>
    </ProgressWidget>
    <AddCsatOrNpsWidget
      v-if="type === 'add'"
      @add="handleOpenDrawer"
    />

    <CsatOrNpsDrawer
      v-if="isDrawerOpen"
      :modelValue="isDrawerOpen"
      :type="type === 'add' ? null : type"
      :isNew="type === 'add'"
      @update:model-value="isDrawerOpen = $event"
    />
    <ModalRemoveWidget
      v-if="isRemoveWidgetModalOpen && type !== 'add'"
      v-model="isRemoveWidgetModalOpen"
      :type="type"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import ProgressWidget from '@/components/insights/widgets/ProgressWidget.vue';
import AddCsatOrNpsWidget from '@/components/insights/conversations/CsatOrNpsWidget/AddCsatOrNpsWidget.vue';
import CsatOrNpsDrawer from '@/components/insights/conversations/CsatOrNpsWidget/CsatOrNpsDrawer.vue';
import ModalRemoveWidget from './CsatOrNpsWidget/ModalRemoveWidget.vue';
import { useI18n } from 'vue-i18n';
import SetupWidget from './SetupWidget.vue';

const { t } = useI18n();
import { useConversationalWidgets } from '@/store/modules/conversational/widgets';
import { storeToRefs } from 'pinia';
import {
  CsatResponse,
  NpsResponse,
} from '@/services/api/resources/conversational/widgets';
import { Tab } from './BaseConversationWidget.vue';

const props = defineProps<{
  type: 'csat' | 'nps' | 'add';
}>();

const isDrawerOpen = ref(false);
const isRemoveWidgetModalOpen = ref(false);
function handleOpenDrawer() {
  isDrawerOpen.value = true;
}
const conversationalWidgets = useConversationalWidgets();
const {
  loadCsatWidgetData,
  loadNpsWidgetData,
  setCsatWidgetType,
  setNpsWidgetType,
} = conversationalWidgets;
const {
  csatWidget,
  npsWidget,
  isLoadingCsatWidgetData,
  isLoadingNpsWidgetData,
  csatWidgetData,
  npsWidgetData,
  csatWidgetType,
  npsWidgetType,
  isCsatHumanConfig,
  isCsatAiConfig,
  isNpsHumanConfig,
  isNpsAiConfig,
} = storeToRefs(conversationalWidgets);

const isCsatOrNps = computed(() => {
  return ['csat', 'nps'].includes(props.type);
});

const widgetType = computed(() => {
  const widgetTypes = {
    csat: 'csat',
    nps: 'nps',
  };

  return widgetTypes[props.type];
});

const widget = computed(() => {
  const widgetTypes = {
    csat: csatWidget.value,
    nps: npsWidget.value,
  };

  return widgetTypes[props.type];
});

const isLoading = computed(() => {
  const isLoadingTypes = {
    csat: isLoadingCsatWidgetData.value,
    nps: isLoadingNpsWidgetData.value,
  };

  return isLoadingTypes[props.type];
});

const widgetData = computed(() => {
  const widgetDataTypes = {
    csat: handleCsatWidgetData(csatWidget.value?.data),
    nps: handleNpsWidgetData(npsWidget.value?.data),
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

  return MOCK_DATA;
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

onMounted(() => {
  const isCsatOrNps = ['csat', 'nps'].includes(props.type);

  if (isCsatOrNps) {
    const loadWidgetData = {
      csat: loadCsatWidgetData,
      nps: loadNpsWidgetData,
    };
    loadWidgetData[props.type]();
  }
});

const actions = [
  {
    icon: 'edit_square',
    text: t(
      'conversations_dashboard.customize_your_dashboard.edit_csat_or_nps',
      { type: props.type },
    ),
    onClick: () => handleOpenDrawer(),
  },
  {
    icon: 'delete',
    text: t('conversations_dashboard.customize_your_dashboard.remove_widget'),
    onClick: () => (isRemoveWidgetModalOpen.value = true),
    scheme: 'aux-red-500',
  },
];

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

watch(csatWidgetType, (value) => {
  if (value === 'HUMAN' && isCsatHumanConfig.value) {
    loadCsatWidgetData();
  }

  if (value === 'AI' && isCsatAiConfig.value) {
    loadCsatWidgetData();
  }
});

watch(npsWidgetType, (value) => {
  if (value === 'HUMAN' && isNpsHumanConfig.value) {
    loadNpsWidgetData();
  }

  if (value === 'AI' && isNpsAiConfig.value) {
    loadNpsWidgetData();
  }
});

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

  &__setup-widget {
    $header-height: 120px;
    height: calc(100% - $header-height);
    top: $header-height / 2;
  }
}
</style>
