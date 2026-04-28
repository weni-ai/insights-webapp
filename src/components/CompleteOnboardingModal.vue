<!-- This component should not be migrated to UnnnicDialog because it is deprecated and will be removed soon -->
<template>
  <UnnnicModalDialog
    data-test-id="modal-dialog"
    :modelValue="props.showModal"
    class="finish-onboarding-modal"
    :primaryButtonProps="{ text: 'Ok' }"
    hideSecondaryButton
    showActionsDivider
    size="sm"
    @primary-button-click="emit('finish-onboarding')"
  >
    <section class="finish-onboarding-modal__content">
      <h1 class="finish-onboarding-modal__content__title">
        {{ $t('onboarding.complete_modal.title') }}
      </h1>
      <p class="finish-onboarding-modal__content__info">
        {{ $t('onboarding.complete_modal.text') }}
      </p>
    </section>
  </UnnnicModalDialog>
</template>

<script setup>
const props = defineProps({
  showModal: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['close', 'finish-onboarding']);
</script>

<style lang="scss" scoped>
.finish-onboarding-modal {
  :deep(.unnnic-modal-dialog__container__actions) {
    display: flex;
    width: 100%;
    > .unnnic-modal-dialog__container__actions__primary-button {
      flex: 1;
    }
  }
  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    &__title {
      font: $unnnic-font-display-2;
      font-weight: 900;
      color: $unnnic-color-gray-12;
    }
    &__info {
      font: $unnnic-font-body;
      color: $unnnic-color-gray-7;
      margin-top: $unnnic-space-2;
    }
  }
}
</style>
