<template>
  <section
    ref="exportRef"
    class="modal-export-data"
    data-testid="modal-export-data"
  >
    <UnnnicDialog
      :open="isRenderExportData"
      @update:open="setIsRenderExportData"
    >
      <UnnnicToolTip
        class="export-data-tooltip"
        data-testid="export-data-tooltip"
        :text="t('export_data.tooltip')"
        side="left"
        :enabled="!hasExportData"
      >
        <UnnnicDialogTrigger asChild>
          <UnnnicButton
            type="primary"
            size="large"
            :text="t('export_data.title')"
            :loading="isLoadingCheckExportStatus"
            :disabled="!hasExportData || shouldUseMock"
            data-testid="export-data-button"
          />
        </UnnnicDialogTrigger>
      </UnnnicToolTip>

      <UnnnicDialogContent
        data-testid="modal-dialog"
        class="finish-onboarding-modal conversational-export-dialog"
        size="large"
      >
        <UnnnicDialogHeader>
          <UnnnicDialogTitle>{{ t('export_data.title') }}</UnnnicDialogTitle>
        </UnnnicDialogHeader>

        <div class="conversational-export-dialog__body">
          <FormExport />
        </div>

        <UnnnicDialogFooter>
          <UnnnicDialogClose>
            <UnnnicButton
              type="tertiary"
              :text="t('export_data.cancel_btn')"
            />
          </UnnnicDialogClose>
          <UnnnicButton
            type="primary"
            :text="t('export_data.save_btn')"
            :disabled="!hasEnabledToExport"
            :loading="isLoadingCreateExport"
            @click="createExport"
          />
        </UnnnicDialogFooter>
      </UnnnicDialogContent>
    </UnnnicDialog>

    <UnnnicDialog
      :open="isRenderExportDataFeedback"
      @update:open="setIsRenderExportDataFeedback"
    >
      <UnnnicDialogContent
        data-testid="modal-dialog-feedback"
        class="finish-onboarding-modal"
        size="medium"
      >
        <UnnnicDialogHeader type="success">
          <UnnnicDialogTitle>{{
            t('export_data.feedback_title')
          }}</UnnnicDialogTitle>
        </UnnnicDialogHeader>

        <div class="export-data-feedback">
          <p
            class="export-data-feedback__text"
            data-testid="export-data-feedback-text"
          >
            {{ $t('export_data.feedback') }}
          </p>
        </div>
      </UnnnicDialogContent>
    </UnnnicDialog>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { useElementVisibility } from '@vueuse/core';

import { useConversationalExport } from '@/store/modules/export/conversational/export';
import { useConversational } from '@/store/modules/conversational/conversational';
import FormExport from './Conversational/FormExport.vue';

const { t } = useI18n();
const conversationalStore = useConversational();
const { shouldUseMock } = storeToRefs(conversationalStore);
const conversationalExport = useConversationalExport();
const { setIsRenderExportData, setIsRenderExportDataFeedback, createExport } =
  conversationalExport;
const {
  isRenderExportData,
  isRenderExportDataFeedback,
  hasEnabledToExport,
  isLoadingCreateExport,
  export_data,
  isLoadingCheckExportStatus,
} = storeToRefs(conversationalExport);

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
    conversationalExport.checkExportStatus();
  }, secondsToPoll.value);
};

const stopPolling = () => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
    pollingInterval.value = null;
  }
};

onMounted(() => {
  conversationalExport.checkExportStatus();
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

defineExpose({
  hasExportData,
  startPolling,
  stopPolling,
  pollingInterval,
});
</script>

<style lang="scss" scoped>
.modal-export-data {
  display: flex;
}

.conversational-export-dialog {
  &__body {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: $unnnic-space-6;
  }
}

.export-data-feedback {
  padding: $unnnic-space-6;

  &__text {
    font: $unnnic-font-body;
    color: $unnnic-color-fg-muted;
  }
}

.export-data-tooltip {
  :deep(.unnnic-tooltip-label) {
    z-index: 5;
  }
}
</style>
