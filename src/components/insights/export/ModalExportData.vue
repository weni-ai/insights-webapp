<template>
  <section class="modal-export-data">
    <UnnnicButton
      type="primary"
      size="large"
      text="Export Data"
      @click="setIsRenderExportData(true)"
    />
    <UnnnicModalDialog
      data-test-id="modal-dialog"
      :modelValue="isRenderExportData"
      class="finish-onboarding-modal"
      :primaryButtonProps="{ text: 'Ok' }"
      hideSecondaryButton
      showActionsDivider
      size="lg"
      title="Export Data"
      showCloseIcon
      @primary-button-click="setIsRenderExportData(false)"
      @update:model-value="setIsRenderExportData(false)"
    >
      <section class="finish-onboarding-modal__content">
        <h1>Export Data</h1>
      </section>
    </UnnnicModalDialog>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useExportData } from '@/store/modules/export/exportData';

const useExportDataStore = useExportData();
const { setIsRenderExportData } = useExportDataStore;
const { isRenderExportData } = storeToRefs(useExportDataStore);
</script>

<style lang="scss" scoped>
.modal-export-data {
  display: flex;
}
</style>
