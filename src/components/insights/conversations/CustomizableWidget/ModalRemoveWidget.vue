<template>
  <UnnnicModalDialog
    data-testid="modal-remove-widget"
    class="modal-remove-widget"
    :modelValue="modelValue"
    :title="
      $t(
        'conversations_dashboard.customize_your_dashboard.modal_remove_widget.title',
        {
          type:
            type === 'sales_funnel'
              ? $t('conversations_dashboard.sales_funnel')
              : type.toUpperCase(),
        },
      )
    "
    type="warning"
    icon="warning"
    :primaryButtonProps="{
      text: $t(
        'conversations_dashboard.customize_your_dashboard.modal_remove_widget.remove',
      ),
      loading: isLoading,
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
    <p
      class="modal-remove-widget__description"
      data-testid="modal-remove-widget-description"
    >
      {{
        $t(
          'conversations_dashboard.customize_your_dashboard.modal_remove_widget.description',
          {
            type:
              type === 'sales_funnel'
                ? $t('conversations_dashboard.sales_funnel')
                : type.toUpperCase(),
          },
        )
      }}
    </p>
  </UnnnicModalDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCustomWidgets } from '@/store/modules/conversational/customWidgets';
import { useConversationalWidgets } from '@/store/modules/conversational/widgets';

interface Props {
  type: 'csat' | 'nps' | 'custom' | 'sales_funnel';
  modelValue: boolean;
  uuid?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (_e: 'update:modelValue', _value: boolean): void;
}>();

const { deleteWidget } = useConversationalWidgets();
const { deleteCustomWidget } = useCustomWidgets();

const isLoading = ref(false);

const handleRemoveWidget = async () => {
  try {
    isLoading.value = true;
    if (props.type === 'custom') {
      await deleteCustomWidget(props.uuid);
    } else {
      await deleteWidget(props.type);
    }
    emit('update:modelValue', false);
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
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
