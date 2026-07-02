<template>
  <UnnnicDialog
    :open="isRemoveModalOpen"
    data-testid="remove-criterion-modal"
    @update:open="handleUpdateOpen"
  >
    <UnnnicDialogContent
      size="small"
      class="remove-criterion-modal"
    >
      <UnnnicDialogHeader type="warning">
        <UnnnicDialogTitle>
          {{
            $t('conversations_dashboard.resolution_criteria.remove_modal.title')
          }}
        </UnnnicDialogTitle>
      </UnnnicDialogHeader>

      <section class="remove-criterion-modal__content">
        {{
          $t(
            'conversations_dashboard.resolution_criteria.remove_modal.description',
          )
        }}
      </section>

      <UnnnicDialogFooter>
        <UnnnicButton
          type="tertiary"
          :text="
            $t(
              'conversations_dashboard.resolution_criteria.remove_modal.cancel',
            )
          "
          :disabled="isRemoving"
          @click="closeRemoveModal"
        />
        <UnnnicButton
          type="warning"
          :text="
            $t(
              'conversations_dashboard.resolution_criteria.remove_modal.confirm',
            )
          "
          :loading="isRemoving"
          data-testid="remove-criterion-confirm-button"
          @click="confirmRemove"
        />
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { useResolutionCriteria } from '@/store/modules/conversational/resolutionCriteria';

const store = useResolutionCriteria();
const { isRemoveModalOpen, isRemoving } = storeToRefs(store);
const { closeRemoveModal, confirmRemove } = store;

const handleUpdateOpen = (open: boolean) => {
  if (!open) {
    closeRemoveModal();
  }
};
</script>

<style lang="scss" scoped>
.remove-criterion-modal {
  &__content {
    padding: $unnnic-space-6;
    font: $unnnic-font-body;
    color: $unnnic-color-fg-base;
  }
}
</style>
