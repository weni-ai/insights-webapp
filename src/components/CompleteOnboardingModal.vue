<template>
  <UnnnicModalDialog
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
      font-size: $unnnic-font-size-title-sm;
      font-weight: $unnnic-font-weight-black;
      line-height: $unnnic-line-height-large * 1.75;
      color: $unnnic-color-neutral-darkest;
    }
    &__info {
      font-size: $unnnic-font-size-body-gt;
      font-weight: $unnnic-font-weight-regular;
      line-height: $unnnic-line-height-large * 1.375;
      color: $unnnic-color-neutral-cloudy;
      margin-top: $unnnic-spacing-xs;
    }
  }
}
</style>
