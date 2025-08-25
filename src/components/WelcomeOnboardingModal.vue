<template>
  <UnnnicModalDialog
    :modelValue="props.showModal"
    data-test-id="modal-dialog"
    class="welcome-onboarding-modal"
    :primaryButtonProps="{ text: $t('onboarding.welcome_modal.button.go') }"
    :secondaryButtonProps="{
      text: $t('onboarding.welcome_modal.button.ignore'),
    }"
    showActionsDivider
    @primary-button-click="emit('start-onboarding')"
    @secondary-button-click="ignoreOnboarding()"
  >
    <section class="welcome-onboarding-modal__content">
      <img
        height="120"
        width="120"
        src="@/assets/images/doris-pc.png"
      />
      <section>
        <h1 class="welcome-onboarding-modal__title">
          {{ $t('onboarding.welcome_modal.title') }}
          <sup class="welcome-onboarding-modal__version"> Beta </sup>
        </h1>
        <p class="welcome-onboarding-modal__info">
          {{ $t('onboarding.welcome_modal.text') }}
        </p>
      </section>
    </section>
  </UnnnicModalDialog>
</template>

<script setup>
import { moduleStorage } from '@/utils/storage';

const props = defineProps({
  showModal: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['close', 'start-onboarding']);

const ignoreOnboarding = () => {
  moduleStorage.setItem('hasDashboardOnboardingComplete', true);
  moduleStorage.setItem('hasWidgetsOnboardingComplete', true);
  emit('close');
};
</script>

<style lang="scss" scoped>
.welcome-onboarding-modal {
  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $unnnic-spacing-md;
    text-align: center;
  }

  &__title {
    font-size: $unnnic-font-size-title-sm;
    font-weight: $unnnic-font-weight-black;
    line-height: $unnnic-line-height-large * 1.75;
    color: $unnnic-color-neutral-darkest;
  }

  &__version {
    font-size: $unnnic-font-size-body-md;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-line-height-large * 1.25;
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
</style>
