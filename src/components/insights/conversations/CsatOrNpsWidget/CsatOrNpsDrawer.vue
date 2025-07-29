<template>
  <UnnnicDrawer
    v-if="modelValue"
    :modelValue="modelValue"
    title="Widgets"
    class="add-widget-drawer"
    data-testid="add-widget-drawer"
    :primaryButtonText="
      type
        ? $t('conversations_dashboard.customize_your_dashboard.save_changes')
        : ''
    "
    :secondaryButtonText="
      type ? $t('conversations_dashboard.customize_your_dashboard.return') : ''
    "
    @primary-button-click="saveWidgetConfigs"
    @secondary-button-click="warningModalType = 'return'"
    @close="closeDrawer"
  >
    <template #content>
      <ul
        v-if="!type"
        class="add-widget-drawer__widget-list"
      >
        <li
          v-for="widget in availableWidgets"
          :key="widget.name"
          class="widget-list__item"
          data-testid="add-widget-drawer-item"
          @click="type = widget.name.toLowerCase() as DrawerType"
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
        :type="type"
      />
    </template>
  </UnnnicDrawer>

  <ModalAttention
    v-if="!!warningModalType"
    :modelValue="!!warningModalType"
    :type="warningModalType"
    data-testid="drawer-csat-or-nps-widget-modal"
    @primary-button-click="confirmAttentionModal"
    @secondary-button-click="closeWarningModal"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ConfigCsatOrNpsWidget from './ConfigCsatOrNps.vue';
import ModalAttention from './ModalAttention.vue';
import i18n from '@/utils/plugins/i18n';

type DrawerType = 'csat' | 'nps' | null;

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (_e: 'update:modelValue', _value: boolean): void;
}>();

const type = defineModel<DrawerType>('type');
const warningModalType = ref<'cancel' | 'return' | ''>('');

function closeDrawer() {
  if (type.value) {
    warningModalType.value = 'cancel';
  } else {
    emit('update:modelValue', false);
  }
}

function closeWarningModal() {
  warningModalType.value = '';
}

function saveWidgetConfigs() {
  console.log('saveWidgetConfigs');
  // TODO: Implement save logic
  emit('update:modelValue', false);
}

function returnWidgetTypeChoice() {
  closeWarningModal();
  type.value = null;
}

function cancelWidgetConfigs() {
  closeWarningModal();
  type.value = null;
  emit('update:modelValue', false);
}

function confirmAttentionModal() {
  warningModalType.value === 'return'
    ? returnWidgetTypeChoice()
    : cancelWidgetConfigs();
}

const availableWidgets = ref([
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
]);
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
