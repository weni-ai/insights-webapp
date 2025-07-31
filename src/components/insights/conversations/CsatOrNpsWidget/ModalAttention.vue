<template>
  <UnnnicModalDialog
    data-testid="modal-attention"
    :modelValue="modelValue"
    :title="title"
    type="attention"
    icon="error"
    :primaryButtonProps="{
      text: primaryButtonText,
    }"
    :secondaryButtonProps="{
      text: $t(
        'conversations_dashboard.customize_your_dashboard.modal_attention.keep_configuring',
      ),
    }"
    showCloseIcon
    size="sm"
    @update:model-value="emit('secondary-button-click')"
    @secondary-button-click="emit('secondary-button-click')"
    @primary-button-click="emit('primary-button-click')"
  >
    {{ description }}
  </UnnnicModalDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

interface Props {
  type: 'cancel' | 'return';
  modelValue: boolean;
}

const emit = defineEmits<{
  (_e: 'primary-button-click'): void;
  (_e: 'secondary-button-click'): void;
}>();

const { t } = useI18n();

const props = withDefaults(defineProps<Props>(), {
  type: 'cancel',
  modelValue: false,
});

const title = computed(() => {
  const text = {
    cancel: t(
      'conversations_dashboard.customize_your_dashboard.modal_attention.title_cancel',
    ),
    return: t(
      'conversations_dashboard.customize_your_dashboard.modal_attention.title_return',
    ),
  };

  return text[props.type];
});

const description = computed(() => {
  const text = {
    cancel: t(
      'conversations_dashboard.customize_your_dashboard.modal_attention.description_cancel',
    ),
    return: t(
      'conversations_dashboard.customize_your_dashboard.modal_attention.description_return',
    ),
  };

  return text[props.type];
});

const primaryButtonText = computed(() => {
  const text = {
    cancel: t(
      'conversations_dashboard.customize_your_dashboard.modal_attention.cancel',
    ),
    return: t(
      'conversations_dashboard.customize_your_dashboard.modal_attention.return',
    ),
  };

  return text[props.type];
});
</script>

<style lang="scss" scoped>
.modal-topic {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-md;
}
</style>
