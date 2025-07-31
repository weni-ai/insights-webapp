<template>
  <UnnnicDrawer
    v-if="isDrawerCsatOrNpsOpen"
    :modelValue="isDrawerCsatOrNpsOpen"
    title="Widgets"
    class="add-widget-drawer"
    data-testid="add-widget-drawer"
    :primaryButtonText="
      drawerWidgetType !== 'add'
        ? $t('conversations_dashboard.customize_your_dashboard.save_changes')
        : ''
    "
    :secondaryButtonText="
      drawerWidgetType !== 'add' && isNewDrawerCsatOrNps
        ? $t('conversations_dashboard.customize_your_dashboard.return')
        : $t('cancel')
    "
    :disabledPrimaryButton="
      isNewDrawerCsatOrNps
        ? !isEnabledSaveNewWidget
        : drawerWidgetType === 'csat'
          ? !isEnabledUpdateWidgetCsat
          : !isEnabledUpdateWidgetNps
    "
    @primary-button-click="saveWidgetConfigs"
    @secondary-button-click="handleSecondaryButtonClick"
    @close="closeDrawer"
  >
    <template #content>
      <ul
        v-if="drawerWidgetType === 'add'"
        class="add-widget-drawer__widget-list"
      >
        <li
          v-for="widget in availableWidgets"
          :key="widget.name"
          class="widget-list__item"
          data-testid="add-widget-drawer-item"
          @click="
            drawerWidgetType = widget.name.toLowerCase() as 'csat' | 'nps'
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

      <ConfigCsatOrNpsWidget
        v-else
        data-testid="config-csat-or-nps-widget"
        :type="drawerWidgetType"
        :isNew="isNewDrawerCsatOrNps"
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
import { computed, ref } from 'vue';
import ConfigCsatOrNpsWidget from './ConfigCsatOrNps.vue';
import ModalAttention from './ModalAttention.vue';
import i18n from '@/utils/plugins/i18n';
import { useConversationalWidgets } from '@/store/modules/conversational/widgets';
import { storeToRefs } from 'pinia';
import { useConversational } from '@/store/modules/conversational/conversational';

const { resetNewWidget, saveNewWidget, updateConversationalWidget } =
  useConversationalWidgets();
const {
  isEnabledSaveNewWidget,
  isCsatConfigured,
  isNpsConfigured,
  isEnabledUpdateWidgetCsat,
  isEnabledUpdateWidgetNps,
} = storeToRefs(useConversationalWidgets());

const { setIsDrawerCsatOrNpsOpen } = useConversational();
const { isDrawerCsatOrNpsOpen, drawerWidgetType, isNewDrawerCsatOrNps } =
  storeToRefs(useConversational());

const warningModalType = ref<'cancel' | 'return' | ''>('');

function closeDrawer() {
  setIsDrawerCsatOrNpsOpen(false, null, false);
}

function closeWarningModal() {
  warningModalType.value = '';
}

async function saveWidgetConfigs() {
  if (isNewDrawerCsatOrNps.value) {
    await saveNewWidget();
  } else {
    await updateConversationalWidget(drawerWidgetType.value as 'csat' | 'nps');
  }

  setIsDrawerCsatOrNpsOpen(false, null, false);
}

function handleSecondaryButtonClick() {
  if (drawerWidgetType.value !== 'add' && isNewDrawerCsatOrNps.value) {
    warningModalType.value = 'return';
  } else if (
    (drawerWidgetType.value === 'csat' && isEnabledUpdateWidgetCsat.value) ||
    (drawerWidgetType.value === 'nps' && isEnabledUpdateWidgetNps.value)
  ) {
    warningModalType.value = 'cancel';
  } else {
    setIsDrawerCsatOrNpsOpen(false, null, false);
  }
}

function returnWidgetTypeChoice() {
  closeWarningModal();
  drawerWidgetType.value = 'add';
}

function cancelWidgetConfigs() {
  closeWarningModal();
  drawerWidgetType.value = 'add';
  setIsDrawerCsatOrNpsOpen(false, null, false);
}

function confirmAttentionModal() {
  resetNewWidget();
  warningModalType.value === 'return'
    ? returnWidgetTypeChoice()
    : cancelWidgetConfigs();
}

const availableWidgets = computed(() => {
  const availableWidgets = [
    {
      name: i18n.global.t('conversations_dashboard.csat'),
      description: i18n.global.t(
        'conversations_dashboard.customize_your_dashboard.csat_description',
      ),
    },
    {
      name: i18n.global.t('conversations_dashboard.nps'),
      description: i18n.global.t(
        'conversations_dashboard.customize_your_dashboard.nps_description',
      ),
    },
  ];

  if (isCsatConfigured.value) {
    availableWidgets.splice(0, 1);
  }

  if (isNpsConfigured.value) {
    availableWidgets.splice(1, 1);
  }

  return availableWidgets;
});
</script>

<style scoped lang="scss">
.add-widget-drawer {
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
