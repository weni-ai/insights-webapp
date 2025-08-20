<template>
  <section class="modal-export-data">
    <UnnnicButton
      type="primary"
      size="large"
      :text="$t('export_data.title')"
      @click="setIsRenderExportData(true)"
    />
    <UnnnicModalDialog
      data-test-id="modal-dialog"
      :modelValue="isRenderExportData"
      class="finish-onboarding-modal"
      :primaryButtonProps="{ text: $t('export_data.save_btn') }"
      :secondaryButtonProps="{ text: $t('export_data.cancel_btn') }"
      showActionsDivider
      size="lg"
      :title="$t('export_data.title')"
      showCloseIcon
      @primary-button-click="setIsRenderExportData(false)"
      @update:model-value="setIsRenderExportData(false)"
    >
      <FormExportData />
    </UnnnicModalDialog>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useExportData } from '@/store/modules/export/exportData';
import FormExportData from './form/FormExportData.vue';

const useExportDataStore = useExportData();
const { setIsRenderExportData } = useExportDataStore;
const { isRenderExportData } = storeToRefs(useExportDataStore);
</script>

<style lang="scss" scoped>
.modal-export-data {
  display: flex;
}
</style>
