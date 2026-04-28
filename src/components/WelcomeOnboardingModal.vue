<!-- This component should not be migrated to UnnnicDialog because it is deprecated and will be removed soon -->
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
    gap: $unnnic-space-6;
    text-align: center;
  }

  &__title {
    font: $unnnic-font-display-2;
    font-weight: 900;
    color: $unnnic-color-gray-12;
  }

  &__version {
    font: $unnnic-font-caption-2;
    color: $unnnic-color-gray-12;
  }

  &__info {
    font: $unnnic-font-body;
    color: $unnnic-color-gray-7;
    margin-top: $unnnic-space-2;
  }
}
</style>
