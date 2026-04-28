<template>
  <UnnnicDialog
    data-testid="modal-attention"
    :open="modelValue"
    @update:open="handleOpenChange"
  >
    <UnnnicDialogContent
      size="small"
      class="modal-attention"
    >
      <UnnnicDialogHeader type="attention">
        <UnnnicDialogTitle>{{ title }}</UnnnicDialogTitle>
      </UnnnicDialogHeader>

      <section class="modal-attention__content">
        {{ description }}
      </section>

      <UnnnicDialogFooter>
        <UnnnicButton
          type="tertiary"
          :text="secondaryButtonText"
          @click="emit('secondary-button-click')"
        />
        <UnnnicButton
          type="attention"
          :text="primaryButtonText"
          @click="emit('primary-button-click')"
        />
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
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

const secondaryButtonText = computed(() =>
  t(
    'conversations_dashboard.customize_your_dashboard.modal_attention.keep_configuring',
  ),
);

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

const handleOpenChange = (open: boolean) => {
  if (!open) {
    emit('secondary-button-click');
  }
};
</script>

<style lang="scss" scoped>
.modal-attention {
  &__content {
    padding: $unnnic-space-6;
    font: $unnnic-font-body;
    color: $unnnic-color-fg-base;
  }
}
</style>
