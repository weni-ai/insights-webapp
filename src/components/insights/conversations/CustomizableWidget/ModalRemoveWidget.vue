<template>
  <UnnnicDialog
    :open="modelValue"
    @update:open="emit('update:modelValue', $event)"
  >
    <UnnnicDialogContent
      data-testid="modal-remove-widget"
      class="modal-remove-widget"
      :size="dialogContentSize"
    >
      <UnnnicDialogHeader type="warning">
        <UnnnicDialogTitle>
          {{
            title ??
            $t(
              'conversations_dashboard.customize_your_dashboard.modal_remove_widget.title',
            )
          }}
        </UnnnicDialogTitle>
      </UnnnicDialogHeader>

      <section class="modal-remove-widget__content">
        <slot name="description">
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
        </slot>
      </section>
      <UnnnicDialogFooter>
        <UnnnicButton
          :text="
            $t(
              'conversations_dashboard.customize_your_dashboard.modal_remove_widget.cancel',
            )
          "
          type="tertiary"
          @click="emit('update:modelValue', false)"
        />
        <UnnnicButton
          :text="
            $t(
              'conversations_dashboard.customize_your_dashboard.modal_remove_widget.remove',
            )
          "
          type="warning"
          :loading="isLoading"
          @click="handleRemoveWidget"
        />
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCustomWidgets } from '@/store/modules/conversational/customWidgets';
import { useConversationalWidgets } from '@/store/modules/conversational/widgets';
import { UnnnicCallAlert } from '@weni/unnnic-system';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface Props {
  type:
    | 'csat'
    | 'nps'
    | 'custom'
    | 'sales_funnel'
    | 'crosstab'
    | 'absolute_numbers'
    | 'absolute_numbers_child';
  modelValue: boolean;
  uuid?: string;
  name?: string;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (_e: 'update:modelValue', _value: boolean): void;
  (_e: 'success'): void;
}>();

const { deleteWidget } = useConversationalWidgets();
const { deleteCustomWidget } = useCustomWidgets();

const isLoading = ref(false);

const dialogContentSize = computed(() => {
  const map = {
    sm: 'small',
    md: 'medium',
    lg: 'large',
  } as const;
  return map[props.size ?? 'sm'];
});

const handleRemoveWidget = async () => {
  try {
    isLoading.value = true;
    if (
      props.type === 'custom' ||
      props.type === 'absolute_numbers' ||
      props.type === 'absolute_numbers_child'
    ) {
      await deleteCustomWidget(props.uuid);
    } else {
      await deleteWidget(props.type);
    }

    UnnnicCallAlert({
      props: {
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
    emit('success');
  } catch (error) {
    console.error('Error removing widget', error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.modal-remove-widget {
  &__content {
    padding: $unnnic-space-6;
  }
}
</style>
