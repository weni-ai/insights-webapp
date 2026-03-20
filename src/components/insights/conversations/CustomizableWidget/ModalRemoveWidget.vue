<template>
  <UnnnicModalDialog
    data-testid="modal-remove-widget"
    class="modal-remove-widget"
    :modelValue="modelValue"
    :title="
      $t(
        'conversations_dashboard.customize_your_dashboard.modal_remove_widget.title',
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
            type: props.name,
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
import { unnnicCallAlert } from '@weni/unnnic-system';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface Props {
  type: 'csat' | 'nps' | 'custom' | 'sales_funnel' | 'crosstab';
  modelValue: boolean;
  uuid?: string;
  name?: string;
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

    unnnicCallAlert({
      props: {
        version: '1.1',
        text: t(
          'conversations_dashboard.customize_your_dashboard.modal_remove_widget.success_message',
          {
            widget: props.name,
          },
        ),
        type: 'success',
        seconds: 5,
      },
    });

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
  gap: $unnnic-space-6;

  &__description {
    font: $unnnic-font-body;
    color: $unnnic-color-gray-7;
  }

  :deep(.unnnic-modal-dialog__container__content) {
    padding-bottom: $unnnic-space-4;
  }

  :deep(.unnnic-modal-dialog__container__actions) {
    padding-top: $unnnic-space-4;
  }
}
</style>
