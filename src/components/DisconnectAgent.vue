<template>
  <section class="disconnect-agent-container">
    <UnnnicToolTip
      :text="$t('disconnectAgent.tooltip')"
      side="right"
      class="disconnect-agent-tooltip"
      data-test-id="disconnect-agent-tooltip"
    >
      <UnnnicButton
        data-testid="disconnect-agent-button"
        class="disconnect-agent-button"
        iconCenter="mode_off_on"
        size="small"
        type="tertiary"
        @click="handleModalClick"
      />
    </UnnnicToolTip>

    <UnnnicModalDialog
      :modelValue="modelValue"
      type="warning"
      class="disconnect-agent-modal"
      :title="$t('disconnectAgent.title')"
      :primaryButtonProps="{
        text: $t('disconnectAgent.save_btn'),
        loading: isLoading,
      }"
      :secondaryButtonProps="{ text: $t('disconnectAgent.cancel_btn') }"
      showCloseIcon
      @primary-button-click="handleDisconnectModalClick"
      @secondary-button-click="handleCancelClick"
      @update:model-value="handleUpdateModelValue"
    >
      <section class="disconnect-agent-modal-content">
        <p class="disconnect-agent-modal-content__text">
          {{ $t('disconnectAgent.description', { agent }) }}
        </p>
        <p class="disconnect-agent-modal-content__text">
          {{ $t('disconnectAgent.description_confirm', { agent }) }}
        </p>
      </section>
    </UnnnicModalDialog>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Unnnic from '@weni/unnnic-system';
import { useI18n } from 'vue-i18n';
import disconnectAgentApi from '@/services/api/resources/disconnectAgent';

const { t } = useI18n();

const props = defineProps({
  agent: {
    type: String,
    required: true,
  },
});

const modelValue = ref(false);
const isLoading = ref(false);

const handleModalClick = () => {
  modelValue.value = true;
};

const handleCancelClick = () => {
  modelValue.value = false;
};

const handleUpdateModelValue = (value: boolean) => {
  modelValue.value = value;
};

const handleDisconnectModalClick = async () => {
  isLoading.value = true;
  try {
    await disconnectAgentApi.disconnectAgent({ agent: props.agent });
    modelValue.value = false;
    defaultAlert(
      'success',
      t('disconnectAgent.sucess_message', { agent: props.agent }),
    );
  } catch (error) {
    defaultAlert(
      'error',
      t('disconnectAgent.error_message', { agent: props.agent }),
    );
    console.error('Error disconnecting agent', error);
  } finally {
    isLoading.value = false;
  }
};

const defaultAlert = (type: 'success' | 'error', text: string) => {
  Unnnic.unnnicCallAlert({
    props: {
      text,
      type,
      seconds: 5,
    },
  });
};
</script>

<style scoped lang="scss">
.disconnect-agent-container {
  display: flex;
  align-items: center;

  :deep(.material-symbols-rounded.unnnic-icon-size--sm) {
    font-size: $unnnic-font-size-title-sm;
  }
}

.disconnect-agent-modal-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: $unnnic-spacing-sm;

  &__text {
    color: $unnnic-color-neutral-cloudy;

    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-line-height-md + $unnnic-font-size-body-gt;
  }
}
</style>
