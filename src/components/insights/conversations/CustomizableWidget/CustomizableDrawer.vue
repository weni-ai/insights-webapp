<template>
  <UnnnicDrawer
    v-if="isDrawerCustomizableOpen"
    :modelValue="isDrawerCustomizableOpen"
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
                    widget.key as 'csat' | 'nps' | 'custom' | 'sales_funnel',
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
import { WidgetType } from '@/models/types/WidgetTypes';

const { resetNewWidget, saveNewWidget, updateConversationalWidget } =
  useConversationalWidgets();
const {
  isEnabledSaveNewWidget,
  isCsatConfigured,
  isNpsConfigured,
  isSalesFunnelConfigured,
  isEnabledUpdateWidgetCsat,
  isEnabledUpdateWidgetNps,
  isLoadingSaveNewWidget,
  isLoadingUpdateWidget,
} = storeToRefs(useConversationalWidgets());

const projectStore = useProject();
const { getAgentsTeam } = projectStore;

const { hasValidSalesFunnelAgent } = storeToRefs(projectStore);

const { setIsDrawerCustomizableOpen } = useConversational();
const { isDrawerCustomizableOpen, drawerWidgetType, isNewDrawerCustomizable } =
  storeToRefs(useConversational());

const customWidgets = useCustomWidgets();
const { isEnabledCreateCustomForm, isLoadingSaveNewCustomWidget } =
  storeToRefs(customWidgets);
const { saveCustomWidget } = customWidgets;

const sentimentFormStore = useSentimentAnalysisForm();
const { initializeForm } = sentimentFormStore;

const warningModalType = ref<'cancel' | 'return' | ''>('');

onBeforeMount(() => {
  getAgentsTeam();
});

function closeDrawer() {
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
  if (drawerWidgetType.value === 'custom') {
    await saveCustomWidget();
  } else if (isNewDrawerCustomizable.value) {
    await saveNewWidget();
  } else {
    await updateConversationalWidget(drawerWidgetType.value as 'csat' | 'nps');
  }

  setIsDrawerCustomizableOpen(false, null, false);
}

const isLoadingSaveButton = computed(() => {
  if (drawerWidgetType.value === 'custom') {
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
    setIsDrawerCustomizableOpen(false, null, false);
  }
}

function clickWidgetOption(
  widgetType: 'csat' | 'nps' | 'custom' | 'sales_funnel',
) {
  if (widgetType === 'sales_funnel') {
    const conversationalWidgetsStore = useConversationalWidgets();
    const createWidget = {
      uuid: '',
      name: 'conversations_dashboard.sales_funnel_widget.title',
      config: {},
      type: 'sales_funnel',
      source: 'conversations.sales_funnel',
      is_configurable: true,
    };
    conversationalWidgetsStore.newWidget = createWidget as WidgetType;
    saveWidgetConfigs();
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
  drawerWidgetType.value = 'add';
  setIsDrawerCustomizableOpen(false, null, false);
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

const handleTabChoice = (tabKey: 'native' | 'customized') => {
  if (tabKey === 'native') {
    let widgets = [
      handleWidgetTypeChoice('csat'),
      handleWidgetTypeChoice('nps'),
      handleWidgetTypeChoice('sales_funnel'),
    ];

    if (isCsatConfigured.value) {
      widgets = widgets.filter((widget) => widget.key !== 'csat');
    }

    if (isNpsConfigured.value) {
      widgets = widgets.filter((widget) => widget.key !== 'nps');
    }

    if (isSalesFunnelConfigured.value || !hasValidSalesFunnelAgent.value) {
      widgets = widgets.filter((widget) => widget.key !== 'sales_funnel');
    }

    return widgets;
  }

  if (tabKey === 'customized') {
    return [handleWidgetTypeChoice('custom')];
  }

  return [];
};

const handleWidgetTypeChoice = (
  widgetType: 'csat' | 'nps' | 'custom' | 'sales_funnel',
) => {
  return availableWidgets.value.find((widget) => widget.key === widgetType);
};

const isDisabledPrimaryButton = computed(() => {
  if (drawerWidgetType.value === 'custom') {
    return !isEnabledCreateCustomForm.value;
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
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-lg;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }

  &__widget-list {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;

    .widget-list__item {
      padding: $unnnic-spacing-md;

      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: $unnnic-spacing-nano;

      border-radius: $unnnic-border-radius-md;
      border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;

      cursor: pointer;

      .item__title {
        color: $unnnic-color-neutral-darkest;
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-lg;
        font-weight: $unnnic-font-weight-bold;
        line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
      }

      .item__description {
        color: $unnnic-color-neutral-cloudy;
        font-size: $unnnic-font-size-body-gt;
        line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
      }
    }
  }
}
</style>
