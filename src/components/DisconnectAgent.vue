<template>
  <div
    :class="[
      'disconnect-agent-container',
      { 'disconnect-agent-container--center': props.containerCenter },
    ]"
    @click.stop
  >
    <UnnnicDialog v-model:open="isOpen">
      <UnnnicDialogTrigger asChild>
        <UnnnicToolTip
          :text="handleTooltipText"
          :side="props.disabled ? 'left' : 'top'"
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
          />
        </UnnnicToolTip>
      </UnnnicDialogTrigger>
      <UnnnicDialogContent
        class="disconnect-agent-modal"
        size="medium"
      >
        <UnnnicDialogHeader type="warning">
          <UnnnicDialogTitle>
            {{ $t('disconnectAgent.title') }}
          </UnnnicDialogTitle>
        </UnnnicDialogHeader>

        <div class="disconnect-agent-modal-content">
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
        </div>

        <UnnnicDialogFooter>
          <UnnnicDialogClose>
            <UnnnicButton
              :text="$t('disconnectAgent.cancel_btn')"
              type="tertiary"
            />
          </UnnnicDialogClose>
          <UnnnicButton
            :text="$t('disconnectAgent.save_btn')"
            type="warning"
            :loading="isLoading"
            @click="handleDisconnectModalClick"
          />
        </UnnnicDialogFooter>
      </UnnnicDialogContent>
    </UnnnicDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { UnnnicCallAlert } from '@weni/unnnic-system';
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

const isOpen = ref(false);
const isLoading = ref(false);

const handleDisconnectModalClick = async () => {
  isLoading.value = true;
  try {
    await disconnectAgentApi.disconnectAgent({ agent: props.agent.email });
    isOpen.value = false;
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
  UnnnicCallAlert({
    props: {
      text,
      type,
      seconds: 5,
    },
  });
};

const handleTooltipText = computed(() => {
  return props.disabled
    ? t('disconnectAgent.tooltip_disabled')
    : t('disconnectAgent.tooltip');
});
</script>

<style scoped lang="scss">
.disconnect-agent-container {
  display: inline-flex;
  align-items: center;
  max-width: 100%;

  &--center {
    display: flex;
    width: 100%;
    justify-content: center;
  }

  :deep(.material-symbols-rounded.unnnic-icon-size--sm) {
    font-size: 20px;
  }
}

.disconnect-agent-modal-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: $unnnic-space-4;
  padding: $unnnic-space-6;

  &__text {
    color: $unnnic-color-gray-7;
    font: $unnnic-font-body;
  }
}
</style>
