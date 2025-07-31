<template>
  <UnnnicModalDialog
    data-testid="modal-remove-widget"
    class="modal-remove-widget"
    :modelValue="modelValue"
    :title="
      $tc(
        'conversations_dashboard.customize_your_dashboard.modal_remove_widget.title',
        { type: type.toUpperCase() },
      )
    "
    type="warning"
    icon="warning"
    :primaryButtonProps="{
      text: $t(
        'conversations_dashboard.customize_your_dashboard.modal_remove_widget.remove',
      ),
      onClick: handleRemoveWidget,
    }"
    :secondaryButtonProps="{
      text: $t(
        'conversations_dashboard.customize_your_dashboard.modal_remove_widget.cancel',
      ),
      onClick: () => emit('update:modelValue', false),
    }"
    showCloseIcon
    size="sm"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <p class="modal-remove-widget__description">
      {{
        $tc(
          'conversations_dashboard.customize_your_dashboard.modal_remove_widget.description',
          { type: type.toUpperCase() },
        )
      }}
    </p>
  </UnnnicModalDialog>
</template>

<script setup lang="ts">
import { useConversationalWidgets } from '@/store/modules/conversational/widgets';

interface Props {
  type: 'csat' | 'nps';
  modelValue: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (_e: 'update:modelValue', _value: boolean): void;
}>();

const { deleteWidget } = useConversationalWidgets();

const handleRemoveWidget = () => {
  deleteWidget(props.type);
  emit('update:modelValue', false);
};
</script>

<style lang="scss" scoped>
.modal-remove-widget {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-md;

  &__description {
    font-size: $unnnic-font-size-body-gt;
    color: $unnnic-color-neutral-cloudy;
  }

  :deep(.unnnic-modal-dialog__container__content) {
    padding-bottom: $unnnic-spacing-sm;
  }

  :deep(.unnnic-modal-dialog__container__actions) {
    padding-top: $unnnic-spacing-sm;
  }
}
</style>
