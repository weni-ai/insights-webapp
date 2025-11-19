<template>
  <section
    ref="exportRef"
    class="modal-export-data"
    data-testid="modal-export-data"
  >
    <UnnnicToolTip
      data-testid="export-data-tooltip"
      :text="t('export_data.tooltip')"
      side="left"
      :enabled="!hasExportData"
    >
      <UnnnicButton
        type="primary"
        size="large"
        :text="t('export_data.title')"
        :loading="isLoadingCheckExportStatus"
        :disabled="!hasExportData"
        data-testid="export-data-button"
        @click="setIsRenderExportData(true)"
      />
    </UnnnicToolTip>
    <UnnnicModalDialog
      data-testid="modal-dialog"
      :modelValue="isRenderExportData"
      class="finish-onboarding-modal"
      :primaryButtonProps="{
        text: t('export_data.save_btn'),
        disabled: !hasEnabledToExport,
        loading: isLoadingCreateExport,
      }"
      :secondaryButtonProps="{ text: t('export_data.cancel_btn') }"
      showActionsDivider
      size="lg"
      :title="t('export_data.title')"
      showCloseIcon
      @primary-button-click="createExport"
      @secondary-button-click="setIsRenderExportData(false)"
      @update:model-value="setIsRenderExportData(false)"
    >
      <FormExport />
    </UnnnicModalDialog>
    <UnnnicModalDialog
      data-testid="modal-dialog-feedback"
      :modelValue="isRenderExportDataFeedback"
      class="finish-onboarding-modal"
      :title="t('export_data.feedback_title')"
      type="success"
      size="md"
      showCloseIcon
      @update:model-value="setIsRenderExportDataFeedback(false)"
    >
      <p
        class="export-data-feedback__text"
        data-testid="export-data-feedback-text"
      >
        {{ $t('export_data.feedback') }}
      </p>
    </UnnnicModalDialog>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { useElementVisibility } from '@vueuse/core';
import { useHumanSupportExport } from '@/store/modules/export/humanSupport/export';
import FormExport from './HumanSupport/FormExport.vue';

const { t } = useI18n();
const humanSupportExport = useHumanSupportExport();
const { setIsRenderExportData, setIsRenderExportDataFeedback, createExport } =
  humanSupportExport;
const {
  isRenderExportData,
  isRenderExportDataFeedback,
  hasEnabledToExport,
  isLoadingCreateExport,
  export_data,
  isLoadingCheckExportStatus,
} = storeToRefs(humanSupportExport);

const exportRef = ref(null);
const isVisible = useElementVisibility(exportRef);

const pollingInterval = ref<ReturnType<typeof setInterval> | null>(null);
const secondsToPoll = ref(60000);

const hasExportData = computed(() => {
  return export_data.value?.status?.toLowerCase() === 'ready';
});

const startPolling = () => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
  }

  pollingInterval.value = setInterval(() => {
    humanSupportExport.checkExportStatus();
  }, secondsToPoll.value);
};

const stopPolling = () => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
    pollingInterval.value = null;
  }
};

onMounted(() => {
  humanSupportExport.checkExportStatus();
});

onUnmounted(() => {
  stopPolling();
});

watch(
  isVisible,
  (newValue) => {
    if (newValue && !pollingInterval.value) {
      startPolling();
    } else if (!newValue && pollingInterval.value) {
      stopPolling();
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.modal-export-data {
  display: flex;
}

.export-data-feedback__text {
  font-family: $unnnic-font-family-secondary;
  color: $unnnic-color-neutral-cloudy;
  font-size: $unnnic-font-size-body-gt;
  font-weight: $unnnic-font-weight-regular;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
}
</style>
