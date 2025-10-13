<template>
  <section
    :class="[
      'disconnect-agent-container',
      { 'disconnect-agent-container--center': props.containerCenter },
    ]"
    @click.stop
  >
    <UnnnicToolTip
      :text="$t('disconnectAgent.tooltip')"
      side="top"
      class="disconnect-agent-tooltip"
      data-test-id="disconnect-agent-tooltip"
      enabled
    >
      <UnnnicButton
        data-testid="disconnect-agent-button"
        class="disconnect-agent-button"
        iconCenter="mode_off_on"
        size="small"
        type="tertiary"
        :disabled="props.disabled"
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
      @click.stop
    >
      <section class="disconnect-agent-modal-content">
        <p class="disconnect-agent-modal-content__text">
          {{ $t('disconnectAgent.description', { agent: props.agent.name }) }}
        </p>
        <p class="disconnect-agent-modal-content__text">
          {{
            $t('disconnectAgent.description_confirm', {
              agent: props.agent.name,
            })
          }}
        </p>
      </section>
    </UnnnicModalDialog>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { unnnicCallAlert, UnnnicButton } from '@weni/unnnic-system';
import { useI18n } from 'vue-i18n';
import disconnectAgentApi from '@/services/api/resources/disconnectAgent';

const { t } = useI18n();

const props = defineProps({
  agent: {
    type: Object,
    default: () => ({
      name: '',
      email: '',
    }),
    required: true,
  },
  containerCenter: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['request-data']);

const modelValue = ref(false);
const isLoading = ref(false);

const handleModalClick = (event: Event) => {
  event.stopPropagation();
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
    await disconnectAgentApi.disconnectAgent({ agent: props.agent.email });
    modelValue.value = false;
    defaultAlert(
      'success',
      t('disconnectAgent.sucess_message', { agent: props.agent.name }),
    );
    emits('request-data');
  } catch (error) {
    defaultAlert(
      'error',
      t('disconnectAgent.error_message', { agent: props.agent.name }),
    );
    console.error('Error disconnecting agent', error);
  } finally {
    isLoading.value = false;
  }
};

const defaultAlert = (type: 'success' | 'error', text: string) => {
  unnnicCallAlert({
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

  &--center {
    justify-content: center;
  }

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
