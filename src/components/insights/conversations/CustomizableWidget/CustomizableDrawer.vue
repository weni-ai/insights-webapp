<template>
  <UnnnicDrawer
    v-if="isDrawerCustomizableOpen"
    :modelValue="isDrawerCustomizableOpen"
    :withoutOverlay="warningModalType !== ''"
    title="Widgets"
    class="add-widget-drawer"
    data-testid="add-widget-drawer"
    :primaryButtonText="
      drawerWidgetType !== 'add'
        ? $t('conversations_dashboard.customize_your_dashboard.save_changes')
        : ''
    "
    :secondaryButtonText="
      drawerWidgetType !== 'add' && isNewDrawerCustomizable
        ? $t('conversations_dashboard.customize_your_dashboard.return')
        : $t('cancel')
    "
    :disabledPrimaryButton="isDisabledPrimaryButton"
    :loadingPrimaryButton="isLoadingSaveButton"
    @primary-button-click="saveWidgetConfigs"
    @secondary-button-click="handleSecondaryButtonClick"
    @close="closeDrawer"
  >
    <template #content>
      <UnnnicTab
        v-if="drawerWidgetType === 'add'"
        data-testid="add-widget-drawer-tab"
        :tabs="availableTabs.map((tab) => tab.name)"
        :activeTab="activeTab"
      >
        <template
          v-for="tab in availableTabs"
          #[`tab-head-${tab.name}`]
          :key="`tab-head-${tab.name}`"
        >
          {{ $t(tab.name) }}
        </template>
        <template
          v-for="tab in availableTabs"
          #[`tab-panel-${tab.name}`]
          :key="`tab-panel-${tab.name}`"
        >
          <section class="add-widget-drawer__section">
            <p
              v-if="tab.key === 'customized'"
              class="add-widget-drawer__section-title"
            >
              {{
                $t(
                  'conversations_dashboard.customize_your_dashboard.select_chart_type',
                )
              }}
            </p>
            <ul class="add-widget-drawer__widget-list">
              <li
                v-for="widget in handleTabChoice(tab.key)"
                :key="widget.name"
                class="widget-list__item"
                data-testid="add-widget-drawer-item"
                @click="
                  clickWidgetOption(
                    widget.key as
                      | 'csat'
                      | 'nps'
                      | 'custom'
                      | 'sales_funnel'
                      | 'crosstab'
                      | 'search_term'
                      | 'added_to_cart',
                  )
                "
              >
                <h2
                  class="item__title"
                  data-testid="add-widget-drawer-item-title"
                >
                  {{ widget.name }}
                </h2>
                <p
                  class="item__description"
                  data-testid="add-widget-drawer-item-description"
                >
                  {{ widget.description }}
                </p>
              </li>
            </ul>
          </section>
        </template>
      </UnnnicTab>

      <ConfigCustomizableForm
        v-else
        data-testid="config-customizable-form"
        :type="drawerWidgetType"
        :isNew="isNewDrawerCustomizable"
      />
    </template>
  </UnnnicDrawer>

  <ModalAttention
    :modelValue="warningModalType !== ''"
    :type="warningModalType !== '' ? warningModalType : 'cancel'"
    data-testid="drawer-csat-or-nps-widget-modal"
    @primary-button-click="confirmAttentionModal"
    @secondary-button-click="closeWarningModal"
  />
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref, watch } from 'vue';
import ConfigCustomizableForm from './ConfigCustomizableForm.vue';
import ModalAttention from './ModalAttention.vue';
import i18n from '@/utils/plugins/i18n';
import { useConversationalWidgets } from '@/store/modules/conversational/widgets';
import { storeToRefs } from 'pinia';
import { useConversational } from '@/store/modules/conversational/conversational';
import { useCustomWidgets } from '@/store/modules/conversational/customWidgets';
import { useSentimentAnalysisForm } from '@/store/modules/conversational/sentimentForm';
import { useProject } from '@/store/modules/project';
import { useFeatureFlag } from '@/store/modules/featureFlag';
import { useDashboards } from '@/store/modules/dashboards';
import { WidgetType } from '@/models/types/WidgetTypes';
import WidgetConversationalService, {
  AvailableWidget,
} from '@/services/api/resources/conversational/widgets';
import DashboardsService from '@/services/api/resources/dashboards';
import { UnnnicCallAlert } from '@weni/unnnic-system';

const {
  resetNewWidget,
  saveNewWidget,
  updateConversationalWidget,
  restoreWidgetsFromDashboard,
} = useConversationalWidgets();
const {
  isEnabledSaveNewWidget,
  isCsatConfigured,
  isNpsConfigured,
  isSalesFunnelConfigured,
  isEnabledUpdateWidgetCsat,
  isEnabledUpdateWidgetNps,
  isLoadingSaveNewWidget,
  isLoadingUpdateWidget,
  isAbandonedCartRecoveryConfigured,
  isAgentInvocationConfigured,
  isToolResultConfigured,
  isSearchTermConfigured,
  isAddedToCartConfigured,
} = storeToRefs(useConversationalWidgets());

const projectStore = useProject();
const { getAgentsTeam, getProjectFlows } = projectStore;

const {
  hasValidSalesFunnelAgent,
  hasAbandonedCartRecoveryEnabled,
  isSearchTermAgentAvailable,
  isAddedToCartAgentAvailable,
} = storeToRefs(projectStore);

const { setIsDrawerCustomizableOpen } = useConversational();
const { isDrawerCustomizableOpen, drawerWidgetType, isNewDrawerCustomizable } =
  storeToRefs(useConversational());

const customWidgets = useCustomWidgets();
const {
  isEnabledCreateCustomForm,
  isLoadingSaveNewCustomWidget,
  isEnabledSaveCrosstabForm,
  isEnabledSaveAbsoluteNumbersForm,
} = storeToRefs(customWidgets);

const { saveCustomWidget, saveAbsoluteNumbers } = customWidgets;

const sentimentFormStore = useSentimentAnalysisForm();
const { initializeForm, clearEditingContext } = sentimentFormStore;

const warningModalType = ref<'cancel' | 'return' | ''>('');
const availableWidgetsFromApi = ref<AvailableWidget[]>([]);

const { isFeatureFlagEnabled } = useFeatureFlag();

const { currentDashboard } = storeToRefs(useDashboards());

onBeforeMount(() => {
  getAgentsTeam();
  if (!projectStore.isLoadedFlows) {
    getProjectFlows();
  }
  getAvailableWidgets();
});

async function getAvailableWidgets() {
  const response = await WidgetConversationalService.getAvailableWidgets({
    type: 'NATIVE' as 'NATIVE' | 'CUSTOM',
  });
  availableWidgetsFromApi.value = response.available_widgets;
}

function closeDrawer() {
  clearEditingContext();
  restoreWidgetsFromDashboard();
  setIsDrawerCustomizableOpen(false, null, false);
}

function closeWarningModal() {
  warningModalType.value = '';
}

watch(
  [isDrawerCustomizableOpen, drawerWidgetType, isNewDrawerCustomizable],
  async () => {
    if (!isDrawerCustomizableOpen.value) return;

    const type = drawerWidgetType.value;
    const isNew = isNewDrawerCustomizable.value;
    let uuid = '';

    if (type === 'custom') {
      uuid = customWidgets.customForm.widget_uuid;
    }

    initializeForm(type, isNew, uuid);
  },
  { immediate: true },
);

async function saveWidgetConfigs() {
  if (drawerWidgetType.value === 'absolute_numbers') {
    await saveAbsoluteNumbers();
  } else if (['custom', 'crosstab'].includes(drawerWidgetType.value)) {
    await saveCustomWidget(drawerWidgetType.value as 'custom' | 'crosstab');
  } else if (isNewDrawerCustomizable.value) {
    await saveNewWidget();
  } else {
    await updateConversationalWidget(drawerWidgetType.value as 'csat' | 'nps');
  }

  closeDrawer();
}

const isLoadingSaveButton = computed(() => {
  if (['custom', 'crosstab'].includes(drawerWidgetType.value)) {
    return isLoadingSaveNewCustomWidget.value;
  }

  if (isNewDrawerCustomizable.value) {
    return isLoadingSaveNewWidget.value;
  }

  return isLoadingUpdateWidget.value;
});

function handleSecondaryButtonClick() {
  if (drawerWidgetType.value !== 'add' && isNewDrawerCustomizable.value) {
    warningModalType.value = 'return';
  } else if (
    (drawerWidgetType.value === 'csat' && isEnabledUpdateWidgetCsat.value) ||
    (drawerWidgetType.value === 'nps' && isEnabledUpdateWidgetNps.value)
  ) {
    warningModalType.value = 'cancel';
  } else {
    closeDrawer();
  }
}

function createSalesFunnelWidget() {
  const conversationalWidgetsStore = useConversationalWidgets();
  const createSalesFunnelWidget = {
    uuid: '',
    name: 'conversations_dashboard.sales_funnel_widget.title',
    config: {},
    type: 'sales_funnel',
    source: 'conversations.sales_funnel',
    is_configurable: true,
  };
  conversationalWidgetsStore.newWidget = createSalesFunnelWidget as WidgetType;
  saveWidgetConfigs();
}

function createAbandonedCartRecoveryWidget() {
  const conversationalWidgetsStore = useConversationalWidgets();
  const createdAbandonedCartRecoveryWidget = {
    uuid: '',
    name: 'conversations_dashboard.abandoned_cart_recovery_widget.title',
    config: {},
    type: 'abandoned_cart_recovery',
    source: 'conversations.abandoned_cart_recovery',
    is_configurable: true,
  };
  conversationalWidgetsStore.newWidget =
    createdAbandonedCartRecoveryWidget as WidgetType;
  saveWidgetConfigs();
}

function createSearchTermWidget() {
  const conversationalWidgetsStore = useConversationalWidgets();
  const createdSearchTermWidget = {
    uuid: '',
    name: 'conversations.search_term',
    config: {},
    type: 'conversations.search_term',
    source: 'conversations.search_term',
    is_configurable: true,
  };
  conversationalWidgetsStore.newWidget = createdSearchTermWidget as WidgetType;
  saveWidgetConfigs();
}

function createAddedToCartWidget() {
  const conversationalWidgetsStore = useConversationalWidgets();
  const createdAddedToCartWidget = {
    uuid: '',
    name: 'conversations.product_added_to_cart',
    config: {},
    type: 'conversations.product_added_to_cart',
    source: 'conversations.product_added_to_cart',
    is_configurable: true,
  };
  conversationalWidgetsStore.newWidget = createdAddedToCartWidget as WidgetType;
  saveWidgetConfigs();
}

async function createAgentInvocationWidget() {
  await DashboardsService.updateDashboardConfig({
    dashboardUuid: currentDashboard.value.uuid,
    config: {
      ...currentDashboard.value.config,
      show_agent_invocation: true,
    },
  });
  currentDashboard.value.config.show_agent_invocation = true;
  UnnnicCallAlert({
    props: {
      text: i18n.global.t('alert_added', {
        name: i18n.global.t('conversations_dashboard.agent_invocation'),
      }),
      type: 'success',
    },
  });
  closeDrawer();
}

async function createToolResultWidget() {
  await DashboardsService.updateDashboardConfig({
    dashboardUuid: currentDashboard.value.uuid,
    config: {
      ...currentDashboard.value.config,
      show_tool_result: true,
    },
  });
  currentDashboard.value.config.show_tool_result = true;
  UnnnicCallAlert({
    props: {
      text: i18n.global.t('alert_added', {
        name: i18n.global.t('conversations_dashboard.tool_result'),
      }),
      type: 'success',
    },
  });
  closeDrawer();
}

function clickWidgetOption(
  widgetType:
    | 'csat'
    | 'nps'
    | 'custom'
    | 'sales_funnel'
    | 'crosstab'
    | 'abandoned_cart_recovery'
    | 'agent_invocation'
    | 'tool_result'
    | 'search_term'
    | 'added_to_cart',
) {
  if (widgetType === 'abandoned_cart_recovery') {
    createAbandonedCartRecoveryWidget();
    return;
  }
  if (widgetType === 'sales_funnel') {
    createSalesFunnelWidget();
    return;
  }
  if (widgetType === 'agent_invocation') {
    createAgentInvocationWidget();
    return;
  }
  if (widgetType === 'tool_result') {
    createToolResultWidget();
    return;
  }
  if (widgetType === 'search_term') {
    createSearchTermWidget();
    return;
  }
  if (widgetType === 'added_to_cart') {
    createAddedToCartWidget();
    return;
  }

  drawerWidgetType.value = widgetType;
}

function returnWidgetTypeChoice() {
  closeWarningModal();
  drawerWidgetType.value = 'add';
}

function cancelWidgetConfigs() {
  closeWarningModal();
  closeDrawer();
}

function confirmAttentionModal() {
  resetNewWidget();
  warningModalType.value === 'return'
    ? returnWidgetTypeChoice()
    : cancelWidgetConfigs();
}

const availableWidgets = computed(() => {
  return [
    {
      name: i18n.global.t('conversations_dashboard.csat'),
      description: i18n.global.t(
        'conversations_dashboard.customize_your_dashboard.csat_description',
      ),
      key: 'csat',
    },
    {
      name: i18n.global.t('conversations_dashboard.nps'),
      description: i18n.global.t(
        'conversations_dashboard.customize_your_dashboard.nps_description',
      ),
      key: 'nps',
    },
    {
      name: i18n.global.t(
        'conversations_dashboard.customize_your_dashboard.horizontal_bar_chart.title',
      ),
      description: i18n.global.t(
        'conversations_dashboard.customize_your_dashboard.horizontal_bar_chart.description',
      ),
      key: 'custom',
    },
    {
      name: i18n.global.t('conversations_dashboard.sales_funnel'),
      description: i18n.global.t(
        'conversations_dashboard.customize_your_dashboard.sales_funnel_description',
      ),
      key: 'sales_funnel',
    },
    {
      name: i18n.global.t(
        'conversations_dashboard.customize_your_dashboard.crosstab.title',
      ),
      description: i18n.global.t(
        'conversations_dashboard.customize_your_dashboard.crosstab.description',
      ),
      key: 'crosstab',
    },
    {
      name: i18n.global.t('conversations_dashboard.absolute_numbers'),
      description: i18n.global.t(
        'conversations_dashboard.customize_your_dashboard.absolute_numbers_description',
      ),
      key: 'absolute_numbers',
    },
    {
      name: i18n.global.t('conversations_dashboard.abandoned_cart_recovery'),
      description: i18n.global.t(
        'conversations_dashboard.customize_your_dashboard.abandoned_cart_recovery_description',
      ),
      key: 'abandoned_cart_recovery',
    },
    {
      name: i18n.global.t('conversations_dashboard.search_term'),
      description: i18n.global.t(
        'conversations_dashboard.customize_your_dashboard.search_term_description',
      ),
      key: 'search_term',
    },
    {
      name: i18n.global.t('conversations_dashboard.added_to_cart'),
      description: i18n.global.t(
        'conversations_dashboard.customize_your_dashboard.added_to_cart_description',
      ),
      key: 'added_to_cart',
    },
    {
      name: i18n.global.t('conversations_dashboard.agent_invocation'),
      description: i18n.global.t(
        'conversations_dashboard.agent_invocation_description',
      ),
      key: 'agent_invocation',
    },
    {
      name: i18n.global.t('conversations_dashboard.tool_result'),
      description: i18n.global.t(
        'conversations_dashboard.tool_result_description',
      ),
      key: 'tool_result',
    },
  ];
});

const activeTab = computed(() => {
  if (
    drawerWidgetType.value === 'add' &&
    !(isCsatConfigured.value || isNpsConfigured.value)
  ) {
    return availableTabs.find((tab) => tab.key === 'native')?.name;
  }

  return availableTabs.find((tab) => tab.key === 'customized')?.name;
});

const availableTabs: {
  key: 'native' | 'customized';
  name: string;
}[] = [
  {
    key: 'native',
    name: 'conversations_dashboard.customize_your_dashboard.tabs.native',
  },
  {
    key: 'customized',
    name: 'conversations_dashboard.customize_your_dashboard.tabs.customized',
  },
];

const getNativeWidgets = () => {
  const hasValidSalesFunnel = !!hasValidSalesFunnelAgent?.value;
  const isSalesFunnelAvailableFromApi = availableWidgetsFromApi.value.includes(
    AvailableWidget.SALES_FUNNEL,
  );

  type NativeWidgetKey =
    | 'csat'
    | 'nps'
    | 'sales_funnel'
    | 'agent_invocation'
    | 'tool_result'
    | 'abandoned_cart_recovery'
    | 'search_term'
    | 'added_to_cart';

  const nativeWidgets: { key: NativeWidgetKey; isVisible: boolean }[] = [
    { key: 'csat', isVisible: !isCsatConfigured.value },
    { key: 'nps', isVisible: !isNpsConfigured.value },
    {
      key: 'sales_funnel',
      isVisible:
        !isSalesFunnelConfigured.value &&
        hasValidSalesFunnel &&
        isSalesFunnelAvailableFromApi,
    },
    {
      key: 'agent_invocation',
      isVisible: !isAgentInvocationConfigured.value,
    },
    { key: 'tool_result', isVisible: !isToolResultConfigured.value },
    {
      key: 'abandoned_cart_recovery',
      isVisible:
        hasAbandonedCartRecoveryEnabled.value &&
        !isAbandonedCartRecoveryConfigured.value,
    },
    {
      key: 'search_term',
      isVisible:
        isSearchTermAgentAvailable.value && !isSearchTermConfigured.value,
    },
    {
      key: 'added_to_cart',
      isVisible:
        isAddedToCartAgentAvailable.value && !isAddedToCartConfigured.value,
    },
  ];

  return nativeWidgets
    .filter((widget) => widget.isVisible)
    .map((widget) => handleWidgetTypeChoice(widget.key));
};

const handleTabChoice = (tabKey: 'native' | 'customized') => {
  if (tabKey === 'native') {
    return getNativeWidgets();
  }

  if (tabKey === 'customized') {
    const isAbsoluteNumbersEnabled = isFeatureFlagEnabled(
      'insightsAbsoluteNumbersWidget',
    );

    const widgets = [
      handleWidgetTypeChoice('custom'),
      handleWidgetTypeChoice('crosstab'),
    ];

    if (isAbsoluteNumbersEnabled) {
      widgets.push(handleWidgetTypeChoice('absolute_numbers'));
    }

    return widgets;
  }

  return [];
};

const handleWidgetTypeChoice = (
  widgetType:
    | 'csat'
    | 'nps'
    | 'custom'
    | 'sales_funnel'
    | 'crosstab'
    | 'absolute_numbers'
    | 'abandoned_cart_recovery'
    | 'agent_invocation'
    | 'tool_result'
    | 'search_term'
    | 'added_to_cart',
) => {
  return availableWidgets.value.find((widget) => widget.key === widgetType);
};

const isDisabledPrimaryButton = computed(() => {
  if (drawerWidgetType.value === 'custom') {
    return !isEnabledCreateCustomForm.value;
  }

  if (drawerWidgetType.value === 'crosstab') {
    return !isEnabledSaveCrosstabForm.value;
  }

  if (drawerWidgetType.value === 'absolute_numbers') {
    return !isEnabledSaveAbsoluteNumbersForm.value;
  }

  if (isNewDrawerCustomizable.value) {
    return !isEnabledSaveNewWidget.value;
  }

  if (drawerWidgetType.value === 'csat') {
    return !isEnabledUpdateWidgetCsat.value;
  }

  return !isEnabledUpdateWidgetNps.value;
});
</script>

<style scoped lang="scss">
.add-widget-drawer {
  &__section-title {
    color: $unnnic-color-fg-muted;
    font: $unnnic-font-display-4;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;
  }

  &__widget-list {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;

    .widget-list__item {
      padding: $unnnic-space-6;

      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: $unnnic-space-1;

      border-radius: $unnnic-radius-2;
      border: 1px solid $unnnic-color-gray-2;

      cursor: pointer;

      .item__title {
        color: $unnnic-color-gray-12;
        font: $unnnic-font-display-3;
      }

      .item__description {
        color: $unnnic-color-fg-muted;
        font: $unnnic-font-body;
      }
    }
  }
}
</style>
